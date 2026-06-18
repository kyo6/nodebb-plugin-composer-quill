# Quill Composer for NodeBB

Forked from [NodeBB/nodebb-plugin-composer-quill](https://github.com/NodeBB/nodebb-plugin-composer-quill) and upgraded to **Quill 2** with rich table support and additional improvements.

## Prerequisites

Please ensure that:

* The markdown plugin is **disabled** (see note below)
* Any other composers (i.e. `nodebb-plugin-composer-default`) are **disabled**
* **Warning**: This composer saves its data in Quill Delta format. Posts created with Quill cannot be migrated back to Markdown.

## Features

### Upgraded to Quill 2

Migrated from Quill 1.x to [Quill 2.x](https://quilljs.com/) for improved architecture, better TypeScript support, and a modern module system.

### Table Support (quill-table-up)

Full-featured table editing powered by [quill-table-up](https://github.com/user-attachment/quill-table-up):

* Insert and resize tables with configurable rows/columns
* Merge and split cells (`rowspan` / `colspan`)
* Full-width or auto-width table layout
* Cell-level styling (background, text color, alignment)
* Row/column insertion, deletion, and reordering
* `rowspan`/`colspan` attributes are preserved through NodeBB's HTML sanitization via the `filter:sanitize.config` hook

### Markdown Shortcuts

Integrated [quill-markdown-shortcuts](https://github.com/user-attachment/quill-markdown-shortcuts) for a Markdown-style writing experience — type `# `, `**bold**`, `- list`, etc. directly in the WYSIWYG editor.

### Magic URL

Automatic URL detection with [quill-magic-url](https://github.com/user-attachment/quill-magic-url) — paste a URL and it becomes a clickable link automatically.

### Additional Improvements

* **Image & file uploads** — drag-and-drop and paste support with progress feedback
* **Full-screen editing** via [screenfull](https://github.com/sindresorhus/screenfull)
* **RTL (right-to-left) support** — automatic text direction based on document locale
* **Chat & messaging** — Quill bubble theme integration for real-time messaging
* **Draft auto-save & restore** — seamless draft integration with NodeBB's draft system
* **Autocomplete** — user/mention autocomplete support
* **Configurable toolbar** — headings (H1–H6), font, bold, italic, underline, strike, link, blockquote, code block, ordered/bullet lists, subscript/superscript, color, background, alignment, and clean formatting
* **Tags & thumbs toolbar items disabled** for a cleaner editing experience

## Bug Fixes

* Replaced deprecated `app.alertError` with the `alerts` module to resolve `app.alertError is undefined` issue
* Improved upload progress feedback with clearer and more consistent status updates during file uploads

## Compatibility

* NodeBB `^3.2.0`
* Quill `^2.0.3`
* quill-table-up `^3.5.1`

## Screenshots

### Desktop

![Desktop](/screenshots/desktop.png)

### Mobile

![Mobile](/screenshots/mobile.png)
