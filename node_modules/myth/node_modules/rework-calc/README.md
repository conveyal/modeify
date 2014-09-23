# rework-calc [![Build Status](https://travis-ci.org/reworkcss/rework-calc.png)](https://travis-ci.org/reworkcss/rework-calc)

A [Rework](https://github.com/reworkcss/rework) plugin to support `calc()`.
Particularly useful with the [rework-vars](https://github.com/reworkcss/rework-vars)

## Installation

```bash
npm install rework-calc
```

## Use

As a Rework plugin:

```javascript
var rework = require('rework');
var calc = require('rework-calc');

var css = rework(cssString).use(calc).toString();
```

## Supported feature

This simply add `calc()` support, a feature to do simple calculations.  This
can be particularly useful with the [rework-vars](https://github.com/reworkcss/rework-vars) plugin.

**Note:** When multiple units are mixed together in the same expression, the
`calc()` statement is left as is, to fallback to the CSS3 calc feature.

**Example** (with [rework-vars](https://github.com/reworkcss/rework-vars)
enabled as well):

```css
:root {
  --main-font-size: 16px;
}

body {
  font-size: var(--main-font-size);
}

h1 {
  font-size: calc(var(--main-font-size) * 2);
  height: calc(100px - 2em);
}
```

yields:

```css
body {
  font-size: 16px
}

h1 {
  font-size: 32px;
  height: calc(100px - 2em)
}
```

See unit tests for another example.

## Unit tests

Make sure the dev-dependencies are installed, and then run:

```bash
npm test
```

## License

MIT
