
/**
 * Join `arr` with the trailing `str` defaulting to "and",
 * and `sep` string defaulting to ", ".
 *
 * @param {Array} arr
 * @param {String} str
 * @param {String} sep
 * @return {String}
 * @api public
 */

module.exports = function(arr, str, sep){
  str = str || 'and';
  sep = sep || ', ';
  str = ' ' + str + ' ';
  if (arr.length < 2) return arr[0] || '';
  return arr.slice(0, -1).join(sep) + str + arr[arr.length - 1];
};
