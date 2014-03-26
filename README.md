# Commute Planner [![Build Status](https://travis-ci.org/conveyal/commute-planner.png)](https://travis-ci.org/conveyal/commute-planner) [![Code Climate](https://codeclimate.com/github/conveyal/commute-planner.png)](https://codeclimate.com/github/conveyal/commute-planner) [![Dependency Status](https://david-dm.org/conveyal/commute-planner.png)](https://david-dm.org/conveyal/commute-planner)

## Installation

Clone to your local directory to begin.

```bash
$ git clone git@github.com:conveyal/commute-planner.git
$ cd commute-planner
```

### Environment Variables & Config

All environment variables needed can be found in `.env.tmp` and environment specific URLS can be found in `config.json.tmp`. Copy the `.tmp` files to non-temp versions and configure accordingly. Environment variables can also be set machine wide for deployment.

### MongoDB

Install [locally](http://www.mongodb.org/downloads) or use a service like [MongoLab](https://mongolab.com/welcome/). Set `MONGODB_URL` accordingly.

### OpenTripPlanner

The planner requires an instance of [OpenTripPlanner](http://opentripplanner.com) running with the GTFS feeds you would like to analyze. Manage your OTP endpoint in `config.json`.

### Component

Commute Planner uses [Component](https://github.com/component) to manage client side dependencies and building. Running `make` installs the necesary node modules, downloads the components, and builds the client side JavaScript and CSS.

When `NODE_ENV` is set to `development` the server will rebuild the client side dependencies on each change.

## Running

#### `npm start`

Runs `node bin/server`. Environment variables must be set.

#### `make serve`

Runs the server as a daemon with automatic restarts by [nodemon](http://nodemon.io/). Outputs logs to `/var/tmp/commute-planner-server.log`. Stores the `pid` in `server.pid`

##### `make stop`

Kills the server and cleans up the `.pid`.

## Pushing to S3

Configure [s3cmd](http://s3tools.org/s3cmd) and run `make release`, it will build using production and sync the `build` directory with your S3 Bucket.
