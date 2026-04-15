'use strict';

const mod = require('../../../../node_modules/quill/dist/quill.js');

function resolveQuill(candidate) {
	if (!candidate) {
		return null;
	}
	if (typeof candidate.import === 'function' && typeof candidate.register === 'function') {
		return candidate;
	}
	return null;
}

const quill =
	resolveQuill(mod) ||
	resolveQuill(mod && mod.default) ||
	resolveQuill(mod && mod.Quill) ||
	resolveQuill(typeof window !== 'undefined' && window.Quill) ||
	mod;

module.exports = quill;
