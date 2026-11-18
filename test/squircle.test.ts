import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

import squircle from '../src/index.ts';

const run = async (css: string) =>
	(await postcss([squircle()]).process(css, { from: 'in.css' })).css;

describe('postcss-squircle', () => {
	it('expands squircle() to a plain radius plus a corner-shape @supports block', async () => {
		expect(await run('.a { border-radius: squircle(8px); }')).toBe(
			'.a { border-radius: 8px; }\n' +
				'@supports (corner-shape: squircle) {\n' +
				' .a { corner-shape: squircle; border-radius: calc(8px * 1.8); } }',
		);
	});

	it('keeps nested parentheses in the radius', async () => {
		expect(await run('.a { border-radius: squircle(var(--radius-lg)); }')).toContain(
			'border-radius: calc(var(--radius-lg) * 1.8)',
		);
	});

	it('keeps a calc() radius whole inside the scaled calc()', async () => {
		expect(await run('.a { border-radius: squircle(calc(var(--r) * 2)); }')).toContain(
			'border-radius: calc(calc(var(--r) * 2) * 1.8)',
		);
	});

	it('emits @supports after the rule, leaving later declarations in it', async () => {
		const root = (
			await postcss([squircle()]).process(
				'.a { display: flex; border-radius: squircle(8px); box-shadow: none; }',
				{ from: 'in.css' },
			)
		).root;
		const [rule, supports] = root.nodes;

		expect(rule?.toString()).toBe('.a { display: flex; border-radius: 8px; box-shadow: none; }');
		expect(supports?.type).toBe('atrule');
	});

	it('ignores squircle() outside border-radius', async () => {
		const css = '.a { --radius: squircle(8px); }';
		expect(await run(css)).toBe(css);
	});

	it('leaves other declarations and plain radii alone', async () => {
		const css = '.a { border-radius: 8px; content: "squircle(1px)"; }';
		expect(await run(css)).toBe(css);
	});

	it('maps generated nodes to the source declaration', async () => {
		const root = (
			await postcss([squircle()]).process('.a { border-radius: squircle(8px); }', {
				from: 'in.css',
			})
		).root;
		root.walkDecls((decl) => {
			expect(decl.source?.input.file).toMatch(/in\.css$/);
		});
	});

	it('only rewrites the value when the declaration is not inside a rule', async () => {
		expect(await run('@font-face { border-radius: squircle(8px); }')).toBe(
			'@font-face { border-radius: 8px; }',
		);
	});
});
