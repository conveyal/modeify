
# rework-hex-alpha
  
  Convert hex colors with alpha values into their RGBA equivalents for more browser support.

## Installation

    $ npm install rework-hex-alpha

## Example

```js
var hex = require('rework-hex-alpha');

rework(css)
  .use(hex)
  .toString();
```

## API

  In your CSS, use 4-digit or 8-digit hex colors with alpha channels as if they were already supported in all browsers:

```css
h2 {
  color: #9d9c;
}

p {
  color: #9823f8a9;
}
```

## License

  MIT
