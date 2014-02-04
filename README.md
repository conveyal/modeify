# Commute Planner [![Build Status](https://travis-ci.org/conveyal/commute-planner.png)](https://travis-ci.org/conveyal/commute-planner) [![Code Climate](https://codeclimate.com/github/conveyal/commute-planner.png)](https://codeclimate.com/github/conveyal/commute-planner)

## Installation & Running

Copy `.env.tmp` to `.env` and customize per deployment. Nothing will work without a `MONGODB_URL`. Emails will not send without a `MANDRILL_API_KEY`. Maps will not be displayed without a `MAPBOX_PROJECT_KEY`.

```bash
$ git clone git@github.com:conveyal/commute-planner.git
$ cd commute-planner
$ npm start
```
