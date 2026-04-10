'use strict';

/* globals $, document, window */

$(document).ready(() => {
	const wrapWithBlockquote = function (delta) {
		// Validate the delta
		try {
			const parsed = JSON.parse(delta);
			parsed.ops = parsed.ops.map((op) => {
				// eslint-disable-next-line prefer-object-spread
				op.attributes = Object.assign({ blockquote: true }, op.attributes || {});
				return op;
			});
			return JSON.stringify(parsed);
		} catch (e) {
			// It is probably just a text string, make your own delta(tm)
			return JSON.stringify({ ops: [{ insert: `${delta}\n`, attributes: { blockquote: true } }] });
		}
	};
	$(window).on('action:app.load', () => {
		require(['composer', 'hooks','quill-nbb'], (composer, hooks) => {
			$(window).on('action:composer.topic.new', (ev, data) => {
				composer.newTopic({
					cid: data.cid,
					title: data.title || '',
					body: data.body || '',
					tags: data.tags || [],
				});
			});

			$(window).on('action:composer.post.edit', (ev, data) => {
				composer.editPost({ pid: data.pid });
			});

			$(window).on('action:composer.post.new', (ev, data) => {
				data.body = data.body || data.text;
				data.title = data.title || data.topicName;
				composer.newReply({
					tid: data.tid,
					toPid: data.pid,
					title: data.title,
					body: data.body,
				});
			});

			$(window).on('action:composer.addQuote', (ev, data) => {
				data.title = data.title || data.topicName;
				data.body = data.body || data.text;
				composer.newReply({
					tid: data.tid,
					toPid: data.pid,
					title: data.title,
					body: wrapWithBlockquote(data.body),
				});
			});

			hooks.on('filter:composer.submit', async (hookData) => {
				const composerEl = hookData.composerEl;
				if (!composerEl || !composerEl.length) {
					return hookData;
				}
				const quill = composerEl.find('.ql-container').data('quill');
				if (!quill) {
					return hookData;
				}
				const isEmpty = window.quill && window.quill.isEmpty && window.quill.isEmpty(quill);
				if (isEmpty) {
					hookData.composerData.content = '';
					hookData.composerData.quillDelta = '';
					return hookData;
				}
				const delta = quill.getContents();
				let html = quill.getSemanticHTML();
				// Quill 2.0.3 对空格有已知问题，可按需要保守修正
				html = html.replaceAll(/((?:&nbsp;)*)&nbsp;/g, '$1 ');
				hookData.composerData.quillDelta = JSON.stringify(delta);
				hookData.composerData.content = html;
				return hookData;
			});
		});
	});
});
