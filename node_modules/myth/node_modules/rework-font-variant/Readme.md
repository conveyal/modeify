# rework-font-variant

  Adds support for the nice `font-variant` CSS properties that are shorthand for the really awkward `font-feature-settings` values. 

  This is part of the [CSS spec](http://www.w3.org/TR/css3-fonts/#font-rend-props), but no browser supports the shorthands yet.

## Installation

    $ npm install rework-font-variant

## Example

```js
var variant = require('rework-font-variant');

rework(css)
  .use(variant)
  .toString();
```

## API

  In your CSS, use the font-variant properties like [the spec](http://www.w3.org/TR/css3-fonts/#font-rend-props) tells you to:

```css
h2 {
  font-variant-caps: small-caps;
}

table {
  font-variant-numeric: lining-nums;
}
```

  Or use the `font-variant` shorthand:

```css
table {
  font-variant: small-caps lining-nums;
}
```

## License

  MIT
