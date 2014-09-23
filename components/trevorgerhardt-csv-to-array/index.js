
/**
 * Parse CSV
 *
 * @param {String} csv
 * @return {Array}
 */

module.exports = function csvToArray(csv) {
  var array = [];
  var rows = csv.split(/\r\n|\n/);
  var keys = rowToArray(rows.shift());

  for (var i = 0; i < rows.length; i++) {
    var obj = {};
    var values = rowToArray(rows[i]);
    for (var j = 0; j < keys.length; j++) {
      obj[keys[j]] = values.shift();
    }
    array.push(obj);
  }

  return array;
};

/**
 * Split a row and trim it
 *
 * @param {String} row
 * @return {Array}
 */

function rowToArray(row) {
  var array = row.split(',');
  for (var i = 0; i < array.length; i++) {
    array[i] = array[i].trim();
  }
  return array;
}
