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

The package is ESM-only. CommonJS configs can still `require()` it on Node 20.19+.

## Release

Every push to `main` keeps a draft release one version ahead (`.github/workflows/release.yml`).
Publishing the draft makes `.github/workflows/publish.yml` pack that tag and attach
`package.tgz` to the release.

Versions come from `.github/actions/get-next-version`: each release bumps the patch of the
latest one, and raising the major or minor in `package.json` starts a new `x.y.0`.
