# Commute Planner

[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Code Climate][code-climate-image]][code-climate-url]
[![Dependency Status][david-image]][david-url]

[travis-image]: https://img.shields.io/travis/conveyal/commute-planner.svg?style=flat-square
[travis-url]: https://travis-ci.org/conveyal/commute-planner
[coveralls-image]: https://img.shields.io/coveralls/conveyal/commute-planner.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/coveralls/commute-planner?branch=master
[code-climate-image]: http://img.shields.io/codeclimate/github/conveyal/commute-planner.svg?style=flat-square
[code-climate-url]: https://codeclimate.com/github/conveyal/commute-planner
[david-image]: http://img.shields.io/david/conveyal/commute-planner.svg?style=flat-square
[david-url]: https://david-dm.org/conveyal/commute-planner

A web-based UI for delivering personalized commute information to travelers. Supported by the [Mobility Lab](http://mobilitylab.org/) [Transit Tech Initiative](http://mobilitylab.org/tech/transit-tech-initiative/).

## Installation

Clone to your local directory to begin.

```bash
$ git clone git@github.com:conveyal/commute-planner.git
$ cd commute-planner
```

### Environment Variables & Config

All environment variables needed can be found in `config/env.tmp` and environment specific URLS can be found in `config/public.json.tmp`. Copy the `.tmp` files to non-temp versions and configure accordingly. Environment variables can also be set machine wide for deployment.

### MongoDB

Install [locally](http://www.mongodb.org/downloads) or use a service like [MongoLab](https://mongolab.com/welcome/). Set `MONGODB_URL` accordingly.

### OpenTripPlanner

The planner requires an instance of [OpenTripPlanner](http://opentripplanner.com) running with the GTFS feeds you would like to analyze. Manage your OTP endpoint in `config/public.json`.

### Component

Commute Planner uses [Component](https://github.com/component) to manage client side dependencies and building. Running `make` installs the necesary node modules, downloads the components, and builds the client side JavaScript and CSS.

When `NODE_ENV` is set to `development` the server will rebuild the client side dependencies on each change.

## Running

```bash
$ npm start
```

Runs the server as a daemon with automatic restarts by [nodemon](http://nodemon.io/). Outputs logs to `server.log`. Stores the `pid` in `server.pid`

```bash
$ npm stop
```

Kills the server and cleans up the `.pid`.

## Pushing to S3

Configure [s3cmd](http://s3tools.org/s3cmd) and run `make release NODE_ENV={staging|production}`, it will build using the environment specified and sync the `build` directory with your S3 Bucket.
