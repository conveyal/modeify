
var assert = require('assert');
var exec = require('child_process').exec;
var fs = require('fs');
var exists = fs.existsSync;
var Installer = require('..');
var path = require('path');
var resolve = path.resolve;

function clean (done) {
  exec('rm -rf components component.json', done);
}

describe('Installer', function () {
  before(clean);
  afterEach(clean);
  beforeEach(function(done){
    fs.writeFile('component.json', JSON.stringify({
      dependencies: {
        "component/tip": "*",
        "component/popover": "*"
      },
      development: {
        "component/assert": "*",
        "component/each": "*"
      }
    }), done);
  });

  describe('#installPackage', function () {
    it('should install a package', function (done) {
      var installer = new Installer('.');

      installer.on('package', function (pkg) {
        pkg.on('error', done);
        pkg.on('end', function () {
          var json = require(resolve('components/component-tip/component.json'));
          assert(json.name == 'tip');
          done();
        });
      });

      installer.installPackage('component/tip', '*');
    });
  });

  describe('#install', function () {
    it('should install dependencies', function (done) {
      var installer = new Installer('.');
      installer.install(function (err) {
        if (err) return done(err);
        var tip = require(resolve('components/component-tip/component.json'));
        var popover = require(resolve('components/component-popover/component.json'));
        assert(tip.name == 'tip');
        assert(popover.name == 'popover');
        done();
      });
    });

    it('should support missing dependencies', function (done) {
      fs.writeFileSync('component.json', JSON.stringify({
        development: {
          "component/assert": "*",
          "component/each": "*"
        }
      }));

      var installer = new Installer('.');
      installer.install(function (err) {
        if (err) return done(err);
        done();
      });
    });
  });

  describe('#development', function () {
    it('should install development dependencies', function (done) {
      var installer = new Installer('.');
      installer.development();
      installer.install(function (err) {
        if (err) return done(err);
        var tip = require(resolve('components/component-tip/component.json'));
        var popover = require(resolve('components/component-popover/component.json'));
        var ass = require(resolve('components/component-assert/component.json'));
        assert(tip.name == 'tip');
        assert(popover.name == 'popover');
        assert(ass.name == 'assert');
        done();
      });
    });
  });

  describe('#json', function () {
    it('should return the config', function () {
      var installer = new Installer('.');
      var conf = installer.json();
      assert('*' == conf.development['component/assert']);
    });

    it('should cache the config', function () {
      var installer = new Installer('.');
      var conf = installer.json();
      assert(conf === installer.json());
    });
  });
});
