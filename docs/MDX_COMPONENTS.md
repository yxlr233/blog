# MDX 组件使用指南

博客会自动向 `content/posts/*.mdx` 和 `content/pages/*.mdx` 注册本文列出的组件。直接在正文中使用即可，不需要写 `import`。

## 使用原则

- 普通段落、列表、表格和代码优先使用 Markdown。
- 组件用于表达明确的内容语义，不只用于装饰。
- `Callout` 不宜连续堆叠；一屏内通常保留一个重点即可。
- 交互组件 `Tabs` 的每个面板都应有清晰、简短的标签。
- 图片必须填写能够替代图片内容的 `alt`；纯装饰图可传空字符串。

## Callout

用于提示、技巧、成功状态、风险和错误信息。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | 无 | 可选标题 |
| `type` | `info \| tip \| success \| warning \| danger` | `info` | 语义和配色 |

```mdx
<Callout title="部署提示" type="tip">
提交前先运行 `npm run build`，确保静态导出成功。
</Callout>
```

## Badge

用于行内状态、版本或短标签。它不是链接，也不适合承载长文本。

| 属性 | 类型 | 默认值 |
| --- | --- | --- |
| `tone` | `default \| accent \| success \| warning \| danger` | `default` |

```mdx
当前状态：<Badge tone="success">Stable</Badge>
```

## CardGrid 与 Card

用于一组并列的资源、相关文章或概念入口。`CardGrid` 在窄屏上会自动变为单列。

`CardGrid` 属性：

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `columns` | `2 \| 3` | `2` | 桌面端列数 |

`Card` 属性：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `title` | `string` | 标题 |
| `eyebrow` | `string` | 标题上方的短分类 |
| `href` | `string` | 可选；传入后整张卡片成为链接 |

```mdx
<CardGrid columns={2}>
  <Card eyebrow="Guide" title="部署指南" href="/blog/deploy/">
    从构建到上线的完整流程。
  </Card>
  <Card eyebrow="Reference" title="配置参考">
    常用环境变量与默认值。
  </Card>
</CardGrid>
```

## Steps 与 Step

用于必须按顺序完成的操作。序号由组件自动生成。

```mdx
<Steps>
  <Step title="安装依赖">运行 `npm install`。</Step>
  <Step title="启动开发服务">运行 `npm run dev`。</Step>
  <Step title="检查构建">运行 `npm run build`。</Step>
</Steps>
```

`Step` 的 `title` 可省略，但建议在三个及以上步骤中保留，以方便扫描。

## Tabs 与 Tab

用于同一内容的不同语言、平台或工具版本。标签页支持键盘聚焦和标准 ARIA 语义。

| 属性 | 所属组件 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `defaultValue` | `Tabs` | `number` | `0` |
| `label` | `Tab` | `string` | 必填 |

````mdx
<Tabs defaultValue={0}>
  <Tab label="npm">
    ```sh
    npm run dev
    ```
  </Tab>
  <Tab label="pnpm">
    ```sh
    pnpm dev
    ```
  </Tab>
</Tabs>
````

## Details

用于可选的补充说明、长日志或进阶内容。浏览器会使用原生折叠行为。

| 属性 | 类型 | 默认值 |
| --- | --- | --- |
| `summary` | `string` | 必填 |
| `open` | `boolean` | `false` |

```mdx
<Details summary="查看完整错误信息">
  这里放日志、解释或补充代码。
</Details>
```

## Checklist 与 CheckItem

适合发布检查、迁移进度和任务状态。它是展示型组件，不会在刷新后保存勾选状态。

```mdx
<Checklist>
  <CheckItem done>构建通过</CheckItem>
  <CheckItem done>移动端检查完成</CheckItem>
  <CheckItem>部署到生产环境</CheckItem>
</Checklist>
```

`done` 是布尔属性，写成 `done` 等价于 `done={true}`。

## FileTree

用于展示目录结构或短的文本树。`title` 默认为“文件结构”。

```mdx
<FileTree title="项目结构">
  {`src/\n├── app/\n├── components/\n└── lib/`}
</FileTree>
```

内容会保留空格与换行。它不负责语法高亮，较长的源代码仍应使用 Markdown 代码块。

## Figure

统一渲染带可选说明文字的图片，并默认启用延迟加载。

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `src` | `string` | 本地或远程图片地址 |
| `alt` | `string` | 图片替代文本，必填 |
| `caption` | `string` | 可选说明文字 |

```mdx
<Figure
  src="/images/build-result.png"
  alt="终端显示静态构建成功"
  caption="构建完成后，静态文件位于 out 目录。"
/>
```

本地图片应放在 `public/` 下，并使用以 `/` 开头的路径。

## 代码块与语法高亮

代码块使用 Shiki 在构建阶段完成语法高亮，不会在浏览器中运行高亮器。只需要在围栏后填写语言：

````md
```ts
const greeting: string = "Hello";
console.log(greeting);
```
````

支持标题、说明文字、行号、指定行和指定字符高亮：

````md
```ts title="src/example.ts" caption="一个带标注的 TypeScript 示例" {2-3} /greeting/ showLineNumbers
const greeting: string = "Hello";
if (greeting) {
  console.log(greeting);
}
```
````

| 写法 | 效果 |
| --- | --- |
| `title="文件名"` | 在代码块上方显示标题 |
| `caption="说明"` | 在代码块下方显示说明 |
| `showLineNumbers` | 显示行号 |
| `{2,4-6}` | 高亮第 2、4 至 6 行 |
| `/text/` | 高亮代码中的指定字符 |

代码块右上角会显示语言与复制按钮。浅色和深色主题使用各自的 token 配色；未知语言会自动回退为纯文本，不会导致构建失败。

## 标题与目录

文章中的 `##` 和 `###` 会自动生成目录项与标题锚点：

```md
## 快速开始
### 安装依赖
```

标题“快速开始”的链接为 `#快速开始`。重复标题会自动追加序号，例如第二个“示例”会得到 `#示例-2`。修改已发布文章的标题会改变锚点，若外部已经引用该章节，应尽量保持标题稳定。

## 扩展组件

新增组件的基本流程：

1. 在 `src/components/` 中实现组件；需要状态或事件时添加 `"use client"`。
2. 在 `src/components/mdx-components.tsx` 的 `createMdxComponents()` 返回对象中注册。
3. 在 `src/app/globals.css` 中使用现有设计令牌编写样式。
4. 在本文档和 `content/posts/custom-mdx-interface.mdx` 中补充可构建的示例。
5. 运行 `npm run build`，同时验证浅色、深色和移动端布局。
