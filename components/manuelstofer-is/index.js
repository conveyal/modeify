"use strict";
var each = require('each'),
    toString = Object.prototype.toString,
    types = ['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Array'];

each(types, function (type) {
    module.exports[type.toLowerCase()] = function (obj) {
        return toString.call(obj) === '[object ' + type + ']';
    };
});

if (Array.isArray) {
    module.exports.array = Array.isArray;
}

module.exports.object = function (obj) {
    return obj === Object(obj);
};

