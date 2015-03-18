# Component Watcher

A watch utility for Component. It watches a `component.json`, then emits `resolve`, `scripts`, and `styles` events, allowing you to trigger these functions elsewhere.

## API

### var watcher = watch([options])

Options:

- `root` <process.cwd()> - path where the main `component.json` is located.
- `development` - if you want to watch for field within the `.development` property.
- `extensions` - extensions to look up for `scripts` and `styles`. Default `{ scripts: ['js', 'json', 'html'], styles: ['css'] }`.
- `fields` - fields to look up for `scripts` and `styles`. Default `{ scripts: ['scripts', 'json', 'templates'], styles: ['styles'] }`.

### watcher.start()

Start or restart the watcher. Aliased as `watcher.restart()`. `watcher` starts automatically, so this is unnecessary.

### watcher.stop()

Stop the watcher. Aliased as `watcher.close()`.

### Event: resolve

Emitted when a `component.json` file has been changed or a file has been added/removed, meaning you should re-resolve and create new builds.

### Event: scripts

Emitter when a `scripts` file has changed. Meaning you can use your previous `tree` and rebuild.

### Event: styles

Emitter when a `styles` file has changed. Meaning you can use your previous `tree` and rebuild.

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
