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

[Modeify](http://modeify.co) is an open-source platform for multimodal commuter engagement. Utilizing the latest advances in open transportation technology, Modeify uses personalized outreach to promote commuter behavior change and improve outcomes for travelers, employers, and transportation demand management (TDM) providers.

Development of Modeify is supported by the [Mobility Lab](http://mobilitylab.org/) [Transit Tech Initiative](http://mobilitylab.org/tech/transit-tech-initiative/).

## Development quick start

Clone to your local directory to begin.

```bash
$ git clone git@github.com:conveyal/modeify.git
$ cd modeify
```

### Requirements

* [Node.js](https://nodejs.org/) version `6.x.x`
* [Yarn](https://yarnpkg.com/en/)
* [R5](https://github.com/conveyal/r5) url endpoint
* [MongoDB](https://www.mongodb.org/)
* [Mapbox](https://mapbox.com) access token and a map id
* [Mapzen Search](https://mapzen.com/projects/search/) api key
* [Auth0](https://auth0.com)

### Configuration

An example configuration can be found in `configurations/default`. Copy that directory and edit the `settings.yml` and `env.yml` files. Add your

1. `MONGODB_URL` to `env.yml`.
2. Mapbox `access_token` and `map_id` to `settings.yml`.
3. Mapzen Search `api_key` to `settings.yml`.
4. R5 url endpoint to `settings.yml`.
5. Auth0 `AUTH0_CLIENT_ID`, `AUTH0_DOMAIN`, `AUTH0_NON_INTERACTIVE_CLIENT_ID`, `AUTH0_NON_INTERACTIVE_CLIENT_SECRET`, and `AUTH0_SIGNING_CERTIFICATE` to `env.yml`.
6. Auth0 logo and primary color in `lock > theme` in `settings.yml`.

If you have configuration specific images run `./bin/set-deployment ../path/to/your/configuration/directory` to use them.

### Running

If Modeify is configured correctly (above) then you will be able to run with `npm start`. This will

1. Install all of the dependencies.
2. Run the node server with automatic restarts using [nodemon](http://nodemon.io/). It watches for changes in the `/lib` directory.
3. Build the `client/planner-app` and `client/manager-app` and rebuilds on changes.

Once it starts, you will be able to find the planner at [http://localhost:5000](http://localhost:5000) and the manager at [http://localhost:5000/manager](http://localhost:5000/manager).

To point it at a different configuration directory run:

```bash
$ npm start -- ../path/to/configuration/directory
```

## Deployment

This repository is setup to deploy automatically to Heroku. All commits to the dev branch will be deployed to staging and all commits to master will be deployed to production. Pull requests will create review apps that run on Heroku Hobby Dynos. The review apps will build their client side files locally while the staging and production apps retrieve their assets from AWS and they need to be deployed manually.

Heroku will run the node server with

```bash
$ node lib/server.js
```

### Heroku Environment Variables

All variables in `env.yml` must be set manually as Heroku environment variables. They can be set via the command line with:

```bash
$ heroku config:set VARIABLE_NAME=value --app heroku-app-name
```

The `settings.yml` is retrieved from Heroku apps via the `MODEIFY_CONFIG` environment variable. To set that value you can run the `bin/push-settings-to-heroku` script:

```bash
$ ./bin/push-settings-to-heroku ../path/to/configuration/settings.yml heroku-app-name
```

### AWS Assets Deployment

Deployment is done with `mastarm`. See [mastarm#deploy](https://github.com/conveyal/mastarm#deploy) for more info on configuration.

```bash
$ mastarm deploy --minify --env production --config ../configurations/modeify
```
