# rework-vars [![Build Status](https://travis-ci.org/reworkcss/rework-vars.png)](https://travis-ci.org/reworkcss/rework-vars)

A [Rework](https://github.com/reworkcss/rework) plugin to add support for the
[W3C-style CSS variables](http://www.w3.org/TR/css-variables/) syntax.

**N.B.** This is _not_ a polyfill. This plugin aims to provide a future-proof
way of using a _limited subset_ of the features provided by native CSS variables.

## Installation

```
npm install rework-vars
```

## Use

As a Rework plugin:

```js
// dependencies
var fs = require('fs');
var rework = require('rework');
var vars = require('rework-vars');

// css to be processed
var css = fs.readFileSync('build/build.css', 'utf8').toString();

// process css using rework-vars
var options = {};
var out = rework(css).use(vars(options)).toString();
```

### Options

#### `map`

Optionally, you may pass an object of variables - `map` - to the JavaScript
function.

```js
var map = {
  'app-bg-color': 'white'
}

var out = rework(css).use(vars({map: map})).toString();
```

#### `preserve` (default: `false`)

Setting `preserve` to `true` will preserve the variable definitions and
references in the output, so that they can be used by supporting browsers.

```js
var out = rework(css).use(vars({preserve: true})).toString();
```

## Supported features

Variables can be declared as custom CSS properties on the `:root` element,
prefixed with `--`:

```css
:root {
  --my-color: red;
}
```

Variables are applied using the `var()` function, taking the name of a variable
as the first argument:

```css
:root {
  --my-color: red;
}

div {
  color: var(--my-color);
}
```

Fallback values are supported and are applied if a variable has not been
declared:

```css
:root {
  --my-color: red;
}

div {
  color: var(--other-color, green);
}
```

Fallbacks can be "complex". Anything after the first comma in the `var()`
function will act as the fallback value – `var(name, fallback)`. Nested
variables are also supported:

```css
:root {
  --my-color: red;
}

div {
  background: var(--my-other-color, linear-gradient(var(--my-color), rgba(255,0,0,0.5)));
}
```

## What to expect

Variables can _only_ be declared for, and scoped to the `:root` element. All
other variable declarations are left untouched. Any known variables used as
values are replaced.

```css
:root {
  --color-one: red;
  --color-two: green;
}

:root,
div {
  --color-two: purple;
  color: var(--color-two);
}

div {
  --color-three: blue;
}

span {
  --color-four: yellow;
}
```

yields:

```css
:root,
div {
  --color-two: purple;
  color: green;
}

div {
  --color-three: blue;
}

span {
  --color-four: yellow;
}
```

Variables are not dynamic; they are replaced with normal CSS values. The value
of a defined variable is determined by the last declaration of that variable
for `:root`.

```css
:root {
  --brand-color: green;
}

.brand {
  color: var(--brand-color);
}

:root {
  --brand-color: red;
}
```

yields:

```css
.brand {
  color: red;
}
```

Variables declared within `@media` or `@supports` are not currently supported
and will also be ignored.

```css
@media (min-width: 320px) {
  :root {
    --brand-color: red;
  }
}
```

yields:

```css
@media (min-width: 320px) {
  :root {
    --brand-color: red;
  }
}
```

## License

MIT
