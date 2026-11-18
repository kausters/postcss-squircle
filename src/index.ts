import type { PluginCreator } from 'postcss';

/**
 * Scale factor to make squircle border-radius visually match standard border-radius.
 *
 * Squircles (superellipse n=4) "bulge out" more at 45° but tuck in tighter at the apex,
 * making the same radius appear sharper. The mathematically derived ratio for equal
 * distance from corner at 45° is (1 − 2^−0.5) / (1 − 2^−0.25) ≈ 1.84. We use 1.8
 * as a perceptual compromise that also compensates for the area lost at outer points.
 */
const SQUIRCLE_RADIUS_SCALE = 1.8;

/**
 * Expands `border-radius: squircle(<radius>)` to a plain `border-radius: <radius>`,
 * followed by an `@supports (corner-shape: squircle)` block that switches the same
 * selector to a squircle corner, with the radius scaled up 1.8× to look as round.
 *
 * Node constructors come from the visitor's helpers, so the plugin builds nodes with
 * whichever PostCSS instance runs it and needs `postcss` only as a peer dependency.
 */
const squircle: PluginCreator<void> = () => ({
	postcssPlugin: 'postcss-squircle',
	Declaration(decl, { AtRule, Declaration, Rule }) {
		if (decl.prop !== 'border-radius') return;
		const radius = decl.value.match(/squircle\((.+)\)/)?.[1];
		if (radius === undefined) return;

		decl.value = radius;

		const parent = decl.parent;
		if (!parent || parent.type !== 'rule') return;

		/* The generated nodes borrow the original declaration's source, so they
		map back to its file. Vite's url() rewriting resolves paths against that
		file and warns about any declaration that has none. */
		const { source } = decl;

		const innerRule = new Rule({ selector: parent.selector, source });
		innerRule.append(
			new Declaration({ prop: 'corner-shape', value: 'squircle', source }),
			new Declaration({
				prop: 'border-radius',
				value: `calc(${radius} * ${SQUIRCLE_RADIUS_SCALE})`,
				source,
			}),
		);

		const supports = new AtRule({
			name: 'supports',
			params: '(corner-shape: squircle)',
			source,
		});
		supports.append(innerRule);

		parent.after(supports);
	},
});

squircle.postcss = true;

export default squircle;
