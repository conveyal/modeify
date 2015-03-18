1.3.0 / 2015-03-14
==================
- update component-downloader and component-remotes due to shrinkwrapper support

1.2.8 / 2015-01-22
==================
- fix [component#621](https://github.com/componentjs/component/issues/621) - not resolving semver in some cases

1.2.7 / 2013-10-30
==================

* fix troubleshooting url

1.2.6 / 2013-10-28
==================

* use debug instead of consoler.warn for _requiring components below root_

1.2.5 / 2013-10-13
==================

* show require path for warning _requiring components below root_

1.2.4 / 2013-10-05
==================

* disable concurrency, workaround for [builder2.js/#29](https://github.com/componentjs/builder2.js/issues/29)
* fix travis credentials

1.2.3 / 2013-09-27
==================

* support omitting name for nested locals like `foo/bar`
* add tests for handing `*` as dependency
* update dependencies
* switch to new npm remotes name: __component-remotes__

1.2.0 / 2014-09-19
==================

 * issue#22, `can not require components below the root` use utils.warn() instead of throwing an error

1.1.8 / 2014-07-26
==================

 * further to issue#12, only lookup non-local versions if not looking for '*' (master)

1.1.7 / 2014-07-21
==================

 * issue#12, check non-local remotes when semver not satisfied locally

1.1.6 / 2014-05-31
==================

 * bugfix local `branch.conanical` sep for deep paths

1.1.5 / 2014-05-29
==================

 * Updated `.npmignore` to ignore test residual `components` folder and `component.json`
 * Updated `./test/resolver.js` to cleanup temporary `component.json`

1.1.4 / 2014-05-26
==================

 * normalize local `branch.conanical` path separators to `/` for all platform
 * added tests

1.1.3 / 2014-05-12
==================

 * using regenerator 0.4.6 (pinned) to build a working release

1.1.2 / 2014-05-12
==================

 * adding `timeout` and `retries` to `remotes.options`

1.1.1 / 2014-04-07
==================

 * update for remotes.defaults
 * bump deps

1.1.0 / 2014-04-06
==================

 * add bitbucket support (@netpoetica)

1.0.3 / 2014-04-05
==================

 * link install errors to `component open troubleshooting`

1.0.2 / 2014-04-02
==================

 * change validator to only log during `component-validate`
 * bump deps

1.0.1 / 2014-04-02
==================

 * fix validate to always show filenames

0.2.0 / 2014-02-22
==================

- changed API signature
- add canonical names for each component
- use component-downloader
- refactor to component-flatten
