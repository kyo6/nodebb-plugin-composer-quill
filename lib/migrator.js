'use strict';

const MarkdownIt = require('markdown-it');

const markdown = new MarkdownIt();

const isHtml = require('is-html');

const Migrator = module.exports;

Migrator.resolveNbb = id => require.main.require(id);

Migrator.detect = (postObj) => {
	const isHtml = Migrator.isHtml(postObj);

	return Object.freeze({
		quill: Migrator.isQuill(postObj),
		html: isHtml,
		markdown: !isHtml,
	});
};

Migrator.isQuill = postObj => postObj.hasOwnProperty('quillDelta');

Migrator.isDelta = (content) => {
	try {
		content = JSON.parse(content);
		return content.hasOwnProperty('ops') && Array.isArray(content.ops);
	} catch (e) {
		return false;
	}
};

Migrator.isHtml = postObj => isHtml(postObj.content);

Migrator.isMarkdown = postObj => !Migrator.isHTML(postObj);

function registerEmojiOnConverter(converter) {
	converter.renderCustomWith((customOp) => {
		if (customOp.insert.type === 'emoji') {
			return `<img src="${customOp.insert.value.src}" alt="${customOp.attributes.alt}" class="${customOp.attributes.class}" />`;
		}
	});
}



Migrator.deltaToPreviewHtml = (delta) => {
	console.log(delta);
	return '';
};

Migrator.toHtml = (content) => {
	const posts = Migrator.resolveNbb('./src/posts');
	const winston = Migrator.resolveNbb('winston');
	try {
		const delta = JSON.parse(content);
		if (!delta || !Array.isArray(delta.ops)) {
			winston.verbose('[plugin/composer-quill (toHtml)] Input not in expected format, skipping.');
			return false;
		}
		const html = Migrator.deltaToPreviewHtml(delta);
		return posts.sanitize(html);
	} catch (e) {
		// Do nothing
		winston.verbose('[plugin/composer-quill (toHtml)] Input not in expected format, skipping.');
		return false;
	}
};

Migrator.toQuill = (postObj) => {
	const currently = Migrator.detect(postObj);

	if (currently.quill) {
		// Delta already available, no action needed
		return postObj;
	}

	// Preserve existing content for backup purposes
	postObj.quillBackup = postObj.content;

	if (currently.markdown) {
		// Convert to HTML
		postObj.content = markdown.render(postObj.content);
	}

	// Finally, convert to delta
	postObj.quillDelta = JSON.stringify(require('node-quill-converter').convertHtmlToDelta(postObj.content));

	return postObj;
};
