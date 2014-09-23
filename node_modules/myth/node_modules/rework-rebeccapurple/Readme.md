# rework-rebeccapurple
  
  Converts rebeccapurple to hex value for more browser support.

## Installation

    $ npm install rework-rebeccapurple

## Example

```js
var hex = require('rework-rebeccapurple');

rework(css)
  .use(rebeccapurple)
  .toString();
```

## API

  In your CSS, use rebeccapurple as if they were already supported in all browsers:

```css
h2 {
  color: rebeccapurple;
}

div {
  background: url(test/image.png) rebeccapurple;
}
```

## Explanation

http://www.zeldman.com/2014/06/10/the-color-purple/ and http://meyerweb.com/eric/thoughts/2014/06/09/in-memoriam-2/

## License

  MIT

