# rework-color-function
  
  Implements [Tab Atkins](https://github.com/tabatkins)'s [proposed color function](http://dev.w3.org/csswg/css-color/#modifying-colors) in CSS.

## Installation

    $ npm install rework-color-function

## Example

```js
var color = require('rework-color-function');

rework(css)
  .use(color)
  .toString();
```

## API

  You can use the `color()` function in your CSS to modify colors on the fly just like Tab's spec explains:

```css
h2 {
  background-color: color(red hue(+ 29));
}

p {
  color: color(var(green) tint(10%));
}
```

## License

  MIT
