(function () {
	require(['quill-nbb'], () => {
		const targetEl = $('#editor');
		const outputEl = $('#output');

		const data = {
			post_uuid: 'demo-1',
			formatting: [
				{ name: 'bold', className: 'fa fa-bold' },
				{ name: 'italic', className: 'fa fa-italic' },
				{ name: 'underline', className: 'fa fa-underline' },
				{ name: 'strike', className: 'fa fa-strikethrough' },
				{ name: 'link', className: 'fa fa-link' },
				{ name: 'blockquote', className: 'fa fa-quote-left' },
				{ name: 'code-block', className: 'fa fa-code' },
			],
			composerData: {
				body: '',
				action: 'posts.reply',
			},
		};

		window.quill.init(targetEl, data, () => {
			const quill = targetEl.data('quill');

			$('#btn-delta').on('click', () => {
				outputEl.text(JSON.stringify(quill.getContents(), null, 2));
			});

			$('#btn-html').on('click', () => {
				let html = quill.getSemanticHTML();
				html = html.replaceAll(/((?:&nbsp;)*)&nbsp;/g, '$1 ');
				outputEl.text(html);
			});

			$('#btn-submit-payload').on('click', () => {
				const delta = quill.getContents();
				let html = quill.getSemanticHTML();
				html = html.replaceAll(/((?:&nbsp;)*)&nbsp;/g, '$1 ');

				const payload = {
					content: html,
					quillDelta: JSON.stringify(delta),
				};

				outputEl.text(JSON.stringify(payload, null, 2));
			});

			$('#btn-debug').on('click', () => {
				const QuillModule = require(['quill']);
				const MagicUrlModule = require(['quill-magic-url']);
				outputEl.text(JSON.stringify({
					windowQuillType: typeof window.Quill,
					windowQuillHasRegister: !!(window.Quill && window.Quill.register),
					requireQuillType: typeof QuillModule,
					requireQuillKeys: QuillModule ? Object.keys(QuillModule) : [],
					requireQuillHasRegister: !!(QuillModule && QuillModule.register),
					requireQuillDefaultHasRegister: !!(QuillModule && QuillModule.default && QuillModule.default.register),
					requireMagicUrlKeys: MagicUrlModule ? Object.keys(MagicUrlModule) : [],
				}, null, 2));
			});
		});
	});
})();