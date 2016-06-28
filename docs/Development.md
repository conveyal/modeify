# Development quick start

Clone to your local directory to begin.

```bash
$ git clone git@github.com:conveyal/modeify.git
$ cd modeify
```

## Requirements

* [Node.js](https://nodejs.org/) version `6.x.x`
* [MongoDB](https://www.mongodb.org/)
* [OpenTripPlanner](http://www.opentripplanner.org/) end point running
* [Mapbox](https://mapbox.com) access token and a map id
* [Mapzen Search](https://mapzen.com/projects/search/) api key

## Configuration

An example configuration can be found in `configurations/example`. Copy that directory and edit the `settings.yml` and `env` files.

1. Add your `MONGODB_URL` to the env file.
2. Add your Mapbox `access_token` and `map_id` to the `settings.yml` file.
3. Add your Mapzen Search `api_key` to the `settings.yml` file.

Then run `./bin/set-deployment path-to-your-configuration-directory` to use your configuration files.

### Stormpath

Modeify uses [Stormpath](https://stormpath.com/) for authentication management. To use the `manager` or log in to the `planner` you need to add your Stormpath credentials to your `env` file. It requires a `STORMPATH_CLIENT_APIKEY_ID`, `STORMPATH_CLIENT_APIKEY_SECRET`, and a `STORMPATH_APPLICATION_HREF`.

## Running

If Modeify is configured correctly (above) then you will be able to run `Modeify` with: `npm install && npm start`. This

1. Installs all of the node dependencies.
2. Run's the node server with automatic restarts using [nodemon](http://nodemon.io/). It watches for changes in the `/lib` directory.
3. Run's `mastarm build --watch` on the `client/planner-app` and `client/manager-app` and rebuilds on changes.

Once it starts, you will be able to find the planner at [http://localhost:5000](http://localhost:5000) and the manager at [http://localhost:5000/manager](http://localhost:5000/manager).
