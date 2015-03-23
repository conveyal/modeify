# Deployment

Install & configure the [aws](http://docs.aws.amazon.com/cli/latest/reference/) CLI tool.

## S3

Configure your S3 buckets per environment in `config/public.yaml`.

```bash
modeify $ bin/deploy-assets staging
```

This builds the client files for staging & syncs the `assets` folder with your specified S3 bucket.

## OpsWorks

Setup an OpsWorks Node.JS application and configure in `config/public.yaml`. The OpsWorks application will need to have all the environent variables set up that are in `config/env`.

**NOTE** This is dependent on files that get deployed to S3.

```bash
modeify $ bin/deploy-server staging
```

## Environment

Short hand to deploy all at once:

```bash
modeify $ bin/deploy staging
```