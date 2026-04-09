# Quill composer for NodeBB

This plugin activates the WYSIWYG Quill composer for NodeBB. Please ensure that:

* The markdown plugin is disabled (see note below, re: markdown)
* Any other composers (i.e. nodebb-plugin-composer-default) are disabled
* **Warning** This composer saves its data in a unique format that is only compatible with Quill. If you switch to Quill, any posts made with Quill cannot be migrated back to Markdown.

## For developers

This plugin is forked from nodebb-plugin-composer-quill。

### The changes are as follows:
🐛 Fixes

*Replace deprecated app.alertError with the alerts module to resolve app.alertError is undefined issue
*Improve upload progress feedback by providing clearer and more consistent status updates during file uploads
✨ Improvements

*Integrate markdown-shortcuts plugin into Quill editor to enhance writing experience with Markdown-style input
*Disable tags and thumbs options in the editor toolbar





## Screenshots

### Desktop

![Desktop](/screenshots/desktop.png)

### Mobile

![Mobile](/screenshots/mobile.png)
