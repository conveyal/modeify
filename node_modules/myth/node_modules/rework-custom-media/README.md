# rework-custom-media [![Build Status](https://travis-ci.org/reworkcss/rework-custom-media.png)](https://travis-ci.org/reworkcss/rework-custom-media)

A [Rework](https://github.com/reworkcss/rework) plugin to add support for the
[W3C-style CSS Custom Media Queries](http://dev.w3.org/csswg/mediaqueries/#custom-mq) syntax.

## Installation

```
npm install rework-custom-media
```

## Use

As a Rework plugin:

```js
// dependencies
var fs = require('fs');
var rework = require('rework');
var media = require('rework-custom-media');

// css to be processed
var css = fs.readFileSync('build/build.css', 'utf8').toString();

// process css using rework-custom-media
css = rework(css).use(media).toString();
```

## CSS syntax

A custom media query is defined with the `@custom-media` rule. Its scope is
global.

```css
@custom-media <extension-name> <media-query-list>;
```

This defines that the custom media query named by the `<extension-name>`
represents the given `<media-query-list>`.

The `<extension-name>` can then be used in a media feature. The alias must be
wrapped in parentheses.

```css
@custom-media --narrow-window screen and (max-width: 30em);

@media (--narrow-window) {
  /* narrow window styles */
}
```

If an undefined `<extension-name>` is used by a media feature, the media
feature will be stripped from the output, and a warning will be logged to the
console.

## License

MIT
