# Development

Clone to your local directory to begin.

```bash
$ git clone git@github.com:conveyal/modeify.git
$ cd modeify
```

## Requirements

* [Node.js](https://nodejs.org/)
* [MongoDB](https://www.mongodb.org/)
* [OpenTripPlanner](http://www.opentripplanner.org/)

### Node.js & JavaScript

Follow the instructions [here](https://github.com/conveyal/javascript) to setup you're JavaScript development environment.

All Node.js dependencies are checked in, but still requires a rebuild on each system.

```bash
modeify $ npm install
```

### MongoDB

Install [locally](http://www.mongodb.org/downloads) or use a service like [MongoLab](https://mongolab.com/welcome/). Set `MONGODB_URL` in `deployment/env` accordingly.

### OpenTripPlanner

The planner requires an instance of [OpenTripPlanner](http://opentripplanner.com) running with the GTFS feeds you would like to analyze. Manage your OTP endpoint in `deployment/config.yaml`.

## Building

Client side dependencies are all checked in, but the final `.js` & `.css` files need to be built.

```bash
modeify $ make build
```

## Running

The default way is to run the server as a daemon with automatic restarts using [nodemon](http://nodemon.io/) and stores the `pid` in `server.pid`. This watches the client and lib directories for changes and rebuilds and reloads the server accordingly.

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
