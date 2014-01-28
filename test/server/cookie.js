/**
 * Parse the response
 */

module.exports = function(res) {
  var val = res.headers['set-cookie'];
  if (!val) return '';
  var uid = /^user=([^;]+);/.exec(val[0]);
  var sid = /^commute\-planner\.test=([^;]+);/.exec(val[1]);
  if (!val) return '';
  return uid[0] + sid[0];
};
