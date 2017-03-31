var ie = require('ie');

function with_query_strings(request) {
    request._query = [Date.now().toString()]
    return request;
}

module.exports = function (request) {
	request.set('X-Requested-With', 'XMLHttpRequest');
	request.set('Cache-Control', 'no-cache,no-store,must-revalidate,max-age=-1');

    if (ie) {
        with_query_strings(request);
    }

	return request;
};