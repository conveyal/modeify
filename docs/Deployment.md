# Deployment

Read `docs/Development.md` and set up your configuration correctly.

## Client

Install & configure the [aws](http://docs.aws.amazon.com/cli/latest/reference/) CLI tool.

Define your S3 buckets per environment in your `settings.yml`:

```yaml
...
environments:
  staging:
    s3Bucket: s3://bucket/
...
```

Once the client has been build, from the command line, run:

```shell
modeify $ NODE_ENV=staging npm run sync
```

This is a simple wrapper that runs:

```sh
modeify $ aws s3 sync assets $(node bin/config-val s3Bucket) --acl public-read
```

This builds the client files for staging & syncs the `assets` folder with your specified S3 bucket.

## Server

Set up your [Heroku endpoints](https://devcenter.heroku.com/articles/git#tracking-your-app-in-git).

Define your Heroku application name in your `settings.yml`:

```yaml
...
environments:
  staging:
    heroku: application-name
...
```

To deploy:

```shell
modeify $ NODE_ENV=staging npm run heroku
```

## Both

Build, sync to S3, and push to heroku in one go:

```shell
modeify $ NODE_ENV=staging npm run deploy
```
