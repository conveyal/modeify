'use strict';
module.exports = function (scope) {
	var rc = require('rc')('npm');
	return rc[scope + ':registry'] ||
		rc.registry || 'https://registry.npmjs.org/';
};
