import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", process.argv[2] ?? "out");
const port = Number(process.env.PORT ?? 3000);

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"]
]);

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
    const filePath = await resolveFilePath(url.pathname);
    const extension = path.extname(filePath);

    response.writeHead(200, {
      "content-type": mimeTypes.get(extension) ?? "application/octet-stream"
    });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    const statusCode = error instanceof HttpError ? error.statusCode : 500;
    response.writeHead(statusCode, {
      "content-type": "text/plain; charset=utf-8"
    });
    response.end(statusCode === 404 ? "Not found" : "Server error");
  }
});

server.listen(port, () => {
  console.log(`Serving ${root}`);
  console.log(`Local: http://localhost:${port}`);
});

async function resolveFilePath(urlPathname) {
  const decodedPath = decodeURIComponent(urlPathname);
  const normalizedPath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const requestedPath = path.join(root, normalizedPath);

  if (!requestedPath.startsWith(root)) {
    throw new HttpError(403);
  }

  const directPath = await findExistingFile(requestedPath);

  if (directPath) {
    return directPath;
  }

  const indexPath = await findExistingFile(path.join(requestedPath, "index.html"));

  if (indexPath) {
    return indexPath;
  }

  throw new HttpError(404);
}

async function findExistingFile(filePath) {
  try {
    const fileStat = await stat(filePath);

    if (fileStat.isDirectory()) {
      return findExistingFile(path.join(filePath, "index.html"));
    }

    return filePath;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

class HttpError extends Error {
  constructor(statusCode) {
    super(`HTTP ${statusCode}`);
    this.statusCode = statusCode;
  }
}
