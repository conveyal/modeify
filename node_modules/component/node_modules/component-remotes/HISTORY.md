1.1.6 / 2014-10-21
==================

- check for redirects when a repo isn't there anymore via api.github.com
- use fork of cogent with a fix for `options.redirects: 0`

1.1.5 / 2014-09-21
==================

- test with real http request for github API
- show more infos about github rate limit in the console

1.1.4 / 2014-04-26
==================

 - adds debug output for github api call usage

1.1.3 / 2014-04-17
==================

- fix that annoying bitbucket malformed JSON error

1.1.1 / 2014-04-07
==================

- fix each remote overwriting other remotes' options
- add Remotes.defaults

1.1.0 / 2014-04-06
==================

- remote title-cased names of remotes
- add bitbucket remote (@netpoetica)

1.0.2 / 2014-04-02
==================

- fix logic issues with the previous retry command

1.0.1 / 2014-04-02
==================

- retry all possible URLs when GETing JSON. possible solution to #11

0.2.0 / 2014-02-22
==================

- change signature
- remove downloading
- add archive
- better folder directory options
- fix .resolve(null...)
