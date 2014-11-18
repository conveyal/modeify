# Builder Autoprefixer

Autoprefixer plugin for [builder2.js](https://github.com/componentjs/builder2.js). Caches to create incremental builds. Based on [postcss/autoprefixer-core](https://github.com/postcss/autoprefixer-core).

## API

```js
var build = require('component-builder2')
var autoprefix = require('builder-autoprefixer')

build.styles(branches, options)
  .use('styles',
    autoprefix({ browsers: ['last 2 version'] }))
  .pipe(process.stdout)
```

If you provide the `options` argument as a string, use comma as seperator for multiple options.
To disable autoprefixer pass an empty string.

## License

The MIT License (MIT)

Copyright (c) 2014 Jonathan Ong me@jongleberry.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
