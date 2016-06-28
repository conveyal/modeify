# Deployment

Read `docs/Development.md` and set up your configuration correctly.

## Configure

### AWS

1. Install the AWS Cli tool.
2. Create an S3 bucket that can be publicly read.
3. Add the `s3Bucket` key to your settings file. Can add one per environment.

### Heroku

1. Set up a node Heroku app that you can deploy to using Git. [Instructions](https://devcenter.heroku.com/articles/git)
2. Add your Heroku application name in your settings file under the `heroku` key. Can add one per environment.

## Deploy

### `npm run sync`

Builds the client side files and syncs them to your S3 bucket.

### `npm run push-config`

Encodes your settings and pushes them to your Heroku application.

### `npm run push-heroku`

Git pushes your application to heroku.

### `npm run deploy`

Does the previous three commands in sequence.
