require('./style.css')

require('es5-shim')
require('es6-shim')
require('html5-history-api')
require('../planner-router')

var onLoad = require('../../components/ianstormtaylor/on-load/0.0.2')
var page = require('page')

onLoad(page)
