# Configuration

## Installation

Run `./bin/install`. This copies the configuration files into a deployment directory. If you manage your configurations elsewhere, `./bin/set-deployment $DIRECTORY` allows you to switch between deployments.

## Environment Variables & Config

All private environment variables needed can be found in `deployment/env` and client configuration specific variables can be found in `deployment/config.yaml`.

**NOTE** Anything in `deployment/config.yaml` is exposed to the client.

## Announcements

Announcements need an `id` and an `image` that is either passed as an absolute URL or is located in the `deployment/images` directory.

## [Mapbox](https://mapbox.com)

You **MUST** obtain a Mapbox key to display maps. There will be errors if you don't.

## [Segment](https://segment.com)

Obtain a Segment key and use their service to use whatever metric tracking service you would like.
