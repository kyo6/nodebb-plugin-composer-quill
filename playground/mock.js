(function () {
	window.app = {
		user: {
			privileges: {
				'upload:post:image': true,
				'upload:post:file': true,
			},
		},
	};

	window.ajaxify = {
		data: {
			cid: 1,
		},
	};

	window.config = {
		maximumChatMessageLength: 1000,
	};

	window.socket = {
		emit(eventName, payload, callback) {
			if (typeof payload === 'function') {
				callback = payload;
			}
			if (typeof callback === 'function') {
				callback(null, []);
			}
		},
	};

	define('quill', [], () => window.Quill);
	define('quill-magic-url', [], () => ({
		default: class MagicUrl {
			constructor() {}
		},
	}));

	define('composer/resize', [], () => ({
		reposition() {},
	}));

	define('components', [], () => ({
		get(name) {
			if (name === 'composer') {
				return $('.composer');
			}
			return $();
		},
	}));

	define('slugify', [], () => (str) => String(str).replace(/\s+/g, '-'));

	define('alerts', [], () => ({
		alert(payload) {
			console.log('[alerts.alert]', payload);
		},
		error(payload) {
			console.error('[alerts.error]', payload);
		},
		remove(id) {
			console.log('[alerts.remove]', id);
		},
	}));

	define('composer/autocomplete', [], () => ({
		init() {},
	}));

	define('composer/drafts', [], () => ({
		get() {
			return null;
		},
	}));

	define('composer/formatting', [], () => ({
		getDispatchTable() {
			return {
				bold() {},
				italic() {},
				underline() {},
				strike() {},
				link() {},
				blockquote() {},
				'code-block'() {},
				picture() {},
				upload() {},
			};
		},
	}));

	define('hooks', [], () => ({
		async fire(name, payload) {
			return payload;
		},
	}));
})();