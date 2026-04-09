'use strict';

const path = require('path');
const fs = require('fs');

function loadFixture(name) {
	const p = path.join(__dirname, 'fixtures', name);
	return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const Migrator = require('../lib/migrator');

Migrator.resolveNbb = (id) => {
	if (id === './src/posts') {
		return { sanitize: (html) => html };
	}
	if (id === 'winston') {
		return { verbose: jest.fn() };
	}
	throw new Error(`Unexpected resolveNbb("${id}")`);
};

describe('Migrator.convertMixedDeltaToHtml', () => {
	test('text-only delta uses quill-delta-to-html', () => {
		const delta = loadFixture('text-only.json');
		const html = Migrator.convertMixedDeltaToHtml(delta);
		expect(html).toContain('Hello world');
		expect(html).toContain('Second paragraph');
		expect(html).not.toContain('<table');
	});

	test('table-only delta produces table HTML', () => {
		const delta = loadFixture('table-only.json');
		const html = Migrator.convertMixedDeltaToHtml(delta);
		expect(html).toContain('<table table_id="t1"');
		expect(html).toContain('A1');
		expect(html).toContain('B2');
	});

	test('mixed text and table preserves order', () => {
		const delta = loadFixture('mixed.json');
		const html = Migrator.convertMixedDeltaToHtml(delta);
		const intro = html.indexOf('Intro paragraph');
		const table = html.indexOf('<table');
		const outro = html.indexOf('Outro paragraph');
		expect(intro).toBeGreaterThanOrEqual(0);
		expect(table).toBeGreaterThan(intro);
		expect(outro).toBeGreaterThan(table);
	});

	test('two independent tables', () => {
		const delta = loadFixture('two-tables.json');
		const html = Migrator.convertMixedDeltaToHtml(delta);
		expect(html).toContain('table_id="table1"');
		expect(html).toContain('table_id="table2"');
		expect(html).toContain('T1C1');
		expect(html).toContain('T2C1');
	});

	test('emoji custom embed renders img', () => {
		const delta = loadFixture('emoji.json');
		const html = Migrator.convertMixedDeltaToHtml(delta);
		expect(html).toContain('/emoji/smile.png');
		expect(html).toContain('alt="smile"');
		expect(html).toMatch(/<img[^>]+class="emoji"/);
	});
});

describe('Migrator.toHtml', () => {
	test('returns false for invalid JSON', () => {
		expect(Migrator.toHtml('not json')).toBe(false);
	});

	test('returns false when ops is missing', () => {
		expect(Migrator.toHtml(JSON.stringify({}))).toBe(false);
	});

	test('table delta stringified returns HTML string', () => {
		const delta = loadFixture('table-only.json');
		const html = Migrator.toHtml(JSON.stringify(delta));
		expect(typeof html).toBe('string');
		expect(html).toContain('<table');
	});
});
