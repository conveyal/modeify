# Modeify

[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Code Climate][code-climate-image]][code-climate-url]
[![Dependency Status][david-image]][david-url]

[travis-image]: https://img.shields.io/travis/conveyal/modeify.svg?style=flat-square
[travis-url]: https://travis-ci.org/conveyal/modeify
[coveralls-image]: https://img.shields.io/coveralls/conveyal/modeify.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/conveyal/modeify?branch=master
[code-climate-image]: http://img.shields.io/codeclimate/github/conveyal/modeify.svg?style=flat-square
[code-climate-url]: https://codeclimate.com/github/conveyal/modeify
[david-image]: http://img.shields.io/david/conveyal/modeify.svg?style=flat-square
[david-url]: https://david-dm.org/conveyal/modeify

A web-based UI for delivering personalized commute information to travelers. Supported by the [Mobility Lab](http://mobilitylab.org/) [Transit Tech Initiative](http://mobilitylab.org/tech/transit-tech-initiative/).

## Development

Clone to your local directory to begin.

```bash
$ git clone git@github.com:conveyal/modeify.git
$ cd modeify
```

### Node.js & JavaScript

Follow the instructions [here](https://github.com/conveyal/javascript) to setup you're JavaScript development environment.

### Environment Variables & Config

All private environment variables needed can be found in `config/env.tmp` and client configuration specific variables can be found in `config/config.yaml`.

**NOTE** Anything in `config/config.yaml` is exposed to the client.

```bash
modeify $ cp config/env.tmp config/env
moedify $ cp config/config.yaml.tmp config/config.yaml
```

### MongoDB

Install [locally](http://www.mongodb.org/downloads) or use a service like [MongoLab](https://mongolab.com/welcome/). Set `MONGODB_URL` in `config/env` accordingly.

### OpenTripPlanner

The planner requires an instance of [OpenTripPlanner](http://opentripplanner.com) running with the GTFS feeds you would like to analyze. Manage your OTP endpoint in `config/public.yaml`.

### Install

All Node.js dependencies are checked in, but still requires a rebuild on each system. Whenever you pull down a new version you'll want to run this also.

```bash
modeify $ npm install
```

Client side dependencies are also all checked in, but the final `.js` & `.css` files need to be built.

```bash
modeify $ make build
```

## Running

The default way is to run the server as a daemon with automatic restarts using [nodemon](http://nodemon.io/) and stores the `pid` in `server.pid`

```bash
modeify $ npm start
```

In development, we store the logs locally.

```bash
modeify $ tail -f server.log
```

### Stopping

```bash
modeify $ npm stop
```

Kills the server and cleans up the `.pid`.

## Deploying

Install & confiugre the [aws](http://docs.aws.amazon.com/cli/latest/reference/) CLI tool.

### S3

Configure your S3 buckets per environment in `config/public.yaml`.

```bash
modeify $ bin/deploy-assets staging
```

This builds the client files for staging & syncs the `assets` folder with your specified S3 bucket.

### OpsWorks

Setup an OpsWorks Node.JS application and configure in `config/public.yaml`. The OpsWorks application will need to have all the environent variables set up that are in `config/env`.

**NOTE** This is dependent on files that get deployed to S3.

```bash
modeify $ bin/deploy-server staging
```

### Environemnt

Short hand to deploy all at once:

```bash
modeify $ bin/deploy staging
```
