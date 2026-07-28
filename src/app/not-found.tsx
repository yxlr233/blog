import { RouteLink } from "@/components/route-link";

export default function NotFound() {
  return (
    <main className="page">
      <section className="page-header">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p>The page you requested does not exist.</p>
        <RouteLink href="/" className="button-link">
          Go home
        </RouteLink>
      </section>
    </main>
  );
}
