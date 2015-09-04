
/**
 * Parse CSV
 *
 * @param {String} csv
 * @return {Array}
 */

module.exports = function csvToArray (csv) {
  var rows = csv.split(/\r\n|\n/)
  var keys = rowToArray(rows.shift())

  return rows.map(function (r) {
    var obj = {}
    var values = rowToArray(r)
    keys.forEach(function (k) {
      obj[k] = values.shift()
    })
    return obj
  })
}

/**
 * Split a row and trim it
 *
 * @param {String} row
 * @return {Array}
 */

function rowToArray (row) {
  return row.match(/(".*?"|[^\s",][^",]+[^\s",])(?=\s*,|\s*$)/g)
    .map(function (c) {
      return c.replace(/"/g,"").trim()
    })
}
