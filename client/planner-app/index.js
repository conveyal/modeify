var es5 = require('es5-shim');
var es6 = require('es6-shim');
var historyPolyfill = require('html5-history-api');
var onLoad = require('on-load');
var page = require('page');
var router = require('planner-router');

onLoad(page);
