# Commute Planner [![Build Status](https://travis-ci.org/conveyal/commute-planner.png)](https://travis-ci.org/conveyal/commute-planner) [![Code Climate](https://codeclimate.com/github/conveyal/commute-planner.png)](https://codeclimate.com/github/conveyal/commute-planner)

## Installation & Running

### Environment Variables & Config

All environment variables needed can be found in `.env.tmp` and environment specific URLS can be found in `config.json.tmp`.

### MongoDB

Install [locally](http://www.mongodb.org/downloads) or use a service like [MongoLab](https://mongolab.com/welcome/). Set `MONGODB_URL` accordingly.

### OpenTripPlanner

The planner requires an instance of [OpenTripPlanner](http://opentripplanner.com) running with the GTFS feeds you would like to analyze.

```bash
$ git clone git@github.com:conveyal/commute-planner.git
$ cd commute-planner
$ npm start
```
