# @kausters/postcss-squircle

PostCSS plugin that turns `border-radius: squircle(<radius>)` into a
[`corner-shape`](https://developer.mozilla.org/docs/Web/CSS/corner-shape) progressive
enhancement.

```css
.card {
	border-radius: squircle(var(--radius-lg));
}
```

becomes

```css
.card {
	border-radius: var(--radius-lg);
}
@supports (corner-shape: squircle) {
	.card {
		corner-shape: squircle;
		border-radius: calc(var(--radius-lg) * 1.8);
	}
}
```

A squircle corner looks sharper than a round one of the same radius, so the
`@supports` radius is scaled 1.8× to read as equally round.

## Install

Not on npm. Each GitHub release carries the packed tarball:

```sh
bun add -d https://github.com/kausters/postcss-squircle/releases/download/1.0.0/package.tgz
```

`postcss` 8 is a peer dependency.

## Use

```js
// postcss.config.js
import squircle from '@kausters/postcss-squircle';

export default {
	plugins: [squircle()],
};
```

Put it before `postcss-preset-env`, so preset-env also processes the `@supports`
block it generates.

`squircle()` must be the whole value, one radius: `border-radius: squircle(8px)`, not
`squircle(8px) 4px`. Only `border-radius` is rewritten; `squircle()` anywhere else is
left as written. Outside a style rule (say, in an at-rule body) the value is unwrapped
to the plain radius with no `@supports` block, since there is no selector to repeat.

The package is ESM-only. A CommonJS config gets it from `require(...).default` on Node
20.19+.

## Design notes

**Why a function, not a mixin.** A `border-radius` value keeps call sites readable and
works in plain CSS, CSS modules and any preprocessor; a mixin would tie it to one
preprocessor's syntax.

**Why 1.8×.** At the same radius a superellipse (n=4) bulges past a circular arc at 45°
but tucks in tighter at the apex, so it reads sharper. Matching the two corners' distance
from the box corner at 45° gives (1 − 2^−0.5) / (1 − 2^−0.25) ≈ 1.84. A scale of 2 reads
visibly rounder than plain corners beside it; 1.8 is the perceptual compromise, also
making up for the area lost at the outer points.

**Why `@supports` goes after the rule.** Emitting it next to the declaration would nest
an at-rule inside the rule and split it: everything after `border-radius` lands below the
`@supports` block. The plugin instead appends a sibling `@supports` holding a rule with
the same selector, so the original rule stays intact and the override wins by source
order at equal specificity.

**Why generated nodes copy the declaration's `source`.** Vite's `url()` rewriting resolves
paths against each declaration's source file and warns ("A PostCSS plugin did not pass the
`from` option") about any declaration that has none. Borrowing the original declaration's
`source` silences that and maps the generated CSS back to its file in source maps.

**Why no `postcss` import.** Node constructors come from the visitor's helpers argument,
so nodes are built by whichever PostCSS instance runs the plugin and `postcss` stays a
peer dependency.

**Why ESM, not CommonJS.** PostCSS configs that import their plugins, Vite's included,
load ESM directly, and Node 20.19+ can `require()` it, so a CommonJS build would only be
a second output to keep in sync. Loaders that take plugins by path and `require()` them
(Next.js does) get the module namespace, `{ default }`, back; that setup is untested.

## Release

Every push to `main` keeps a draft release one version ahead (`.github/workflows/release.yml`).
Publishing the draft makes `.github/workflows/publish.yml` pack that tag and attach
`package.tgz` to the release.

Versions come from `.github/actions/get-next-version`: each release bumps the patch of the
latest one, and raising the major or minor in `package.json` starts a new `x.y.0`.
