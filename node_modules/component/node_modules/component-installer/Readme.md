
# installer.js

  Component install tool. This is the library that `component(1)` uses to install components.

## Installation

    $ npm install component-installer

## Example

```js
var Installer = require('component-installer');
var installer = new Installer(__dirname);

installer.on('package', function (pkg) {
  console.log('installing', pkg.name, pkg.version);
});

installer.install(function (err) {
  console.log('installed');
});
```

## API

### new Installer(dir)

  Creates a new `Installer` for the given component `dir`.

### Installer#install(callback)

  Install the component's dependencies and `callback(err)`.

### Installer#installPackage(name, version)

  Install a dependency by `name` and `version`.

### Installer#use(plugin)

  Use the given `plugin`.

### Installer#development()

  Install development dependencies.

### Installer#concurrency(number)

  Set the `number` of packages to install concurrently.

### Installer#force()

  Force installation even if the component already exists.

### Installer#destination(dir)

  Set the install destination `dir`.

### Installer#remote(url)

  Add a remote to the installer by `url`.

### Installer#proxy(url)

  Set the installer's proxy `url`.