# Development quick start

Clone to your local directory to begin.

```bash
$ git clone git@github.com:conveyal/modeify.git
$ cd modeify
```
## Installation

### `bin/install`

This copies the configuration files into a `deployment` directory. On Macs this script also `brew install`s NodeJS and MongoDB.

### Requirements for running

* [Node.js](https://nodejs.org/) — Version 0.10 and up
* [MongoDB](https://www.mongodb.org/) — Can set `MONGODB_URL` in `deployment/env`
* [OpenTripPlanner](http://www.opentripplanner.org/) — Set `otp` `host` and `port` in `deployment/config.yaml`
* [Mapbox](https://mapbox.com) — Set the key in `deployment/config.yaml`

## Running

### `npm start`

Run's the server in the background with automatic restarts using [nodemon](http://nodemon.io/) This watches the `client` and `lib` directories for changes and rebuilds and reloads the server accordingly. Logs are stored in `server.log`.

**NOTE:** Changes to the configuration files requires a manual restart. Just run `npm start` again.

### `npm stop`

Kills the server and cleans up the `.pid`.

### `make build`

Manually rebuilds the client assets.

## Deployment Configuration

If you manage your configurations elsewhere, `bin/set-deployment $DIRECTORY` allows you to switch between deployments.

