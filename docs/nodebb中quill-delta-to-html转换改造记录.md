# NodeBB Composer Quill：Quill 2 升级后 Delta → HTML 改造记录

本文记录在本插件从 Quill 1.x 升级到 **Quill 2.0.x** 后，**如何把 Delta 转为可持久化、可展示的 HTML** 的问题分析与落地方案，便于后续维护与联调。

---

## 1. 背景与问题

### 1.1 原有链路（典型 Quill 1 时代）

- 前端 Composer 把 **Delta JSON字符串** 写进 `textarea`（或等价字段）。
- 服务端在 `filter:post.create` / `filter:post.edit` 等钩子里，通过 `savePost` 判断 `content` 是否为 Delta，再调用 `migrator.toHtml(delta)` 把 Delta 转成 HTML，写入帖子的 `content`字段，同时可能另存 `quillDelta`供再次编辑。

### 1.2 升级到 Quill 2 后的主要变化

1. **Delta 的具体形态不再能沿用旧 fixture / 旧测试假设**  
   例如旧版里针对表格、emoji 等结构的 Delta 表示，往往绑定在当时的模块与 Quill 版本上；升级到 Quill 2 后，应以**真实编辑器产出的 Delta** 为准，而不是历史测试夹具。

2. **服务端“手写 Delta → HTML”成本变高**  
   Quill 2 的语义 HTML 导出、自定义 blot、表格模块等，若全部在 Node 端用 `quill-delta-to-html` 或自写解析器维护，容易与前端实际行为漂移。

3. **官方能力：`getSemanticHTML()`**  
   Quill 2 提供 `getSemanticHTML()`，用于从编辑器模型导出 HTML。这是把“转换”放在**与编辑器同构的运行时**里完成的自然选择。  
   参考：[Quill 2 API - getSemanticHTML](https://v2.quilljs.com/docs/api#getsemantichtml)

4. **已知风险**  
   - `getSemanticHTML()` 在部分小版本上存在空格、`&nbsp;`、空行等边界问题，需要按实际内容做后处理或升级版本后回归。  
   - 自定义 embed（如 emoji）、第三方表格模块等，导出质量取决于对应 blot / 模块实现。

---

## 2. 目标与原则

### 2.1 目标

- **帖子正文 `content`**：存 **已消毒的 HTML（经过安全过滤/白名单处理后的 HTML，目的是去掉或改写可能导致 XSS（跨站脚本）、破坏页面结构或执行恶意代码的内容，同时尽量保留允许的富文本标签与属性。）**（与 NodeBB 渲染链路一致）。
- **`quillDelta`**：存 **原始 Delta JSON 字符串**，用于再次打开编辑器时无损恢复。
- **兼容**：旧客户端仍只发 Delta、无 `quillDelta` 字段时，服务端仍能走旧逻辑或 fallback。

### 2.2 原则

- **优先由前端（Quill 实例）生成 HTML**，服务端以 **sanitize + 持久化** 为主，减少双端语义不一致。
- **服务端保留 fallback**：无法识别新协议时，继续支持“仅 Delta 的 content”或 `toQuill` 等迁移路径。

---

## 3. 方案对比

| 方案 | 做法 | 优点 | 缺点 |
|------|------|------|------|
| A. 服务端 Delta → HTML | `migrator.toHtml` / `quill-delta-to-html` 等 | 不依赖浏览器 | 与 Quill 2 实际表现易不一致；自定义 blot 要持续补规则 |
| B. 前端 HTML + 另存 Delta（推荐） | 提交前 `getSemanticHTML()` + `getContents()` | 与编辑器语义一致；服务端简单 | 需保证发帖 API 透传 `quillDelta`；需处理 `getSemanticHTML` 边界问题 |
| C. 服务端 headless Quill | jsdom + 实例化 Quill 再导出 | 逻辑集中 | 依赖重、环境复杂、维护成本高 |

**结论：推荐方案 B**，服务端退化为“接收 HTML + quillDelta，sanitize后保存”，并保留 A 作为兼容路径。

---

## 4. 推荐落地设计（与 nodebb-plugin-composer-default 集成）

### 4.0 改造涉及文件（本仓库）

| 文件 | 作用 |
|------|------|
| `static/lib/client.js` | 注册 `filter:composer.submit`，提交前写入 `content`（HTML）与 `quillDelta`（Delta JSON字符串） |
| `library.js` | `savePost` / `savePostQueue` / `saveChat`：识别新协议并 `sanitize`，旧协议仍走 `migrator.toHtml` |
| `lib/migrator.js` | `isDelta`、`toHtml`、`toQuill`：新协议下帖子 HTML 不再依赖 `deltaToPreviewHtml`；旧协议仍可能调用 `toHtml` |
| `static/lib/quill-nbb.js` | 编辑器初始化；`editor-change` 时仍把 **Delta** 同步到 `textarea`（草稿、长度统计等仍可按 Delta 工作） |
| `plugin.json` | 声明 `scripts` 加载 `client.js`，保证钩子注册在论坛前台生效 |

外部依赖（不在本仓库内，联调时需知）：

- `nodebb-plugin-composer-default` 的 `static/lib/composer.js`：在发起 `api.post` / `api.put` 前执行 `await hooks.fire('filter:composer.submit', submitHookData)`，因此改写 `hookData.composerData` 即可影响实际请求体。

### 4.1 前端：在 `filter:composer.submit` 改写提交数据

默认 Composer 在真正 `api.post` / `api.put` 前会触发：

- `filter:composer.submit`

**实现位置**：`static/lib/client.js` 在 `action:app.load` 里 `require(['hooks', ...])` 后注册：

```javascript
hooks.on('filter:composer.submit', async (hookData) => {
	const composerEl = hookData.composerEl;
	if (!composerEl || !composerEl.length) {
		return hookData;
	}
	const quill = composerEl.find('.ql-container').data('quill');
	if (!quill) {
		return hookData; // 非 Quill 写作区则原样提交
	}
	const isEmpty = window.quill && window.quill.isEmpty && window.quill.isEmpty(quill);
	if (isEmpty) {
		hookData.composerData.content = '';
		hookData.composerData.quillDelta = '';
		return hookData;
	}
	const delta = quill.getContents();
	let html = quill.getSemanticHTML();
	// Quill 2.0.3 等对空格 / &nbsp; 的已知问题，可按需保守修正
	html = html.replaceAll(/((?:&nbsp;)*)&nbsp;/g, '$1 ');
	hookData.composerData.quillDelta = JSON.stringify(delta);
	hookData.composerData.content = html;
	return hookData;
});
```

**改造要点说明**：

1. **只动 `hookData.composerData`**  
默认 Composer 随后用 `composerData` 作为请求体字段；不要依赖此时再去改 `textarea`（与4.3 中说明一致：`textarea` 仍可保持 Delta，仅请求体走 HTML）。

2. **空文档**  
   与 `window.quill.isEmpty` 一致时，将 `content` 与 `quillDelta` 置空字符串，避免提交无意义占位 HTML。

3. **可选加固**  
   若担心其它场景误触发，可增加 `hookData.action` 白名单，仅处理 `topics.post` / `posts.reply` / `posts.edit`。

4. **加载顺序**  
   `client.js` 需作为插件 `scripts` 在论坛加载；且 `quill-nbb` 需先于提交完成初始化，否则 `.data('quill')` 为空则跳过改写（行为等同于旧协议）。

**前提（已确认）**：NodeBB 发帖/编辑接口会保留 `composerData` 中的额外字段 **`quillDelta`**，并传入后续 `filter:post.*` 钩子。

### 4.2 服务端：`savePost` / `saveChat` 分支

**实现位置**：`library.js`。

**辅助函数**：

- `hasQuillDeltaField(data)`：用 `Object.prototype.hasOwnProperty` 判断请求体上是否**带有** `quillDelta` 键。  
  - 注意：若前端显式提交 `quillDelta: ''`，该键仍存在，仍走新协议分支（`content` 按 HTML sanitize）。  
- `sanitizeHtml(html)`：统一调用 `posts.sanitize(html || '')`。

**帖子 /队列（`savePost` / `savePostQueue`）逻辑（与代码一致）**：

1. **`hasQuillDeltaField(data[path])`（新协议）**  
   - `data[path].content = sanitizeHtml(data[path].content)`  
   - **不再**调用 `migrator.toHtml`；`quillDelta` 原样随 `data[path]` 进入后续持久化。

2. **`migrator.isDelta(data[path].content)`（旧协议：正文仍是 Delta 字符串）**  
   - `data[path].quillDelta = data[path].content`  
   - `data[path].content = migrator.toHtml(data[path].content)`  

3. **否则**  
   - `data[path] = migrator.toQuill(data[path])`（Write API、纯 Markdown/HTML 等）

**聊天（`saveChat`）**：

- 若 `hasQuillDeltaField(data)`：`data.content = sanitizeHtml(data.content)`  
- 否则：`data.quillDelta = data.content`，`data.content = migrator.toHtml(data.content)`  

**消息长度（`handleMessageCheck`）**：

- 形参解构包含 `quillDelta`。  
- `source = migrator.isDelta(quillDelta) ? quillDelta : content`：优先用 Delta 算纯文本长度，避免新协议下 `content` 已是 HTML 却仍按 Delta 解析。

以上三步分支与第 2 节「目标与原则」中的新/旧协议划分一致，此处已与 `library.js` 实现逐项对应。

**再次编辑**：`filter:composer.push` → `append` 等逻辑仍从数据库读 `quillDelta` 填回 `body`，与“正文存 HTML”不冲突。

### 4.3 与 `textarea` 的关系（`quill-nbb.js`）

- 编辑器在 `editor-change` 时仍执行：`textareaEl.val(JSON.stringify(quill.getContents()))`。  
-因此：**本地草稿、Composer 长度统计等仍可能基于 textarea 里的 Delta**；**真正发帖请求体**以 `filter:composer.submit` 改写后的 `composerData.content` / `quillDelta` 为准。  
- 若某处插件只读 `textarea` 而不走 `composerData`，需要单独评估是否也要改为读 HTML 或统一在提交钩子里同步（一般不必，因提交 API 已用 `composerData`）。

### 4.4 与 `quill-delta-to-html` 的关系

- **新协议下**：服务端可不再依赖 Delta→HTML 转换库来生成主帖 HTML；`quill-delta-to-html` 可降级为 **旧数据 / 无前端 HTML 时的 fallback**，或仅用于管理工具、迁移脚本。
- **若仍要在服务端转换**：须以 Quill 2 当前 Delta 与自定义 op 为准重写规则与测试，成本通常高于方案 B。

---

## 5. 本地 Playground（不依赖完整 NodeBB）

为便于升级期调试，可用 **Express** 提供静态资源：

- 挂载 `node_modules`、`static`、`playground`。
- 页面内用**极小的 `define/require` 兼容层**加载 `static/lib/quill-nbb.js`（避免强依赖 RequireJS）。
- Mock `composer/*`、`components`、`hooks`、`app`、`ajaxify`、`config` 等 NodeBB 全局与模块。

启动示例（以本仓库脚本为准）：

```bash
npm run playground
```

默认访问：`http://localhost:3100/playground/`（端口可通过环境变量 `PLAYGROUND_PORT` 调整）。

---

## 6. 前端初始化注意事项（`Quill.register` 等）

Quill 2 的 UMD/打包产物在部分加载方式下，**`require(['quill'])` 拿到的可能不是构造器本身**（例如存在 `default` 导出形态），会导致 `Quill.register` 为 `undefined`。Playground 或实际集成时若遇到此类问题，应对模块做归一化，例如统一解析为 `QuillClass = Quill.default || Quill`，再 `register` / `new QuillClass(...)`。

---

## 7. 小结

- **Quill 2 升级后，更合理的分工是：前端用 `getSemanticHTML()` 产出 HTML，用 `getContents()` 保留 Delta；服务端优先保存 `quillDelta` 并对 `content` 做 sanitize。**  
- **旧“仅 Delta 的 content”路径应在服务端保留为兼容分支。**  
- **`quill-delta-to-html` 不再是主路径，可作为 fallback 或迁移辅助。**  
- **本地可用 Express Playground 快速验证注册、工具栏、Delta/HTML 导出，而无需每次全量集成 NodeBB。**

---

*文档根据插件改造讨论整理，若 NodeBB 核心或 Composer 行为变更，请同步更新本文“前提”与钩子名称。*
