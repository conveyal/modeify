var model = require('model')

var User = module.exports = model('User')
  .attr('href')
  .attr('customData')
  .attr('email')
  .attr('givenName')
  .attr('surname')
  .attr('groups')

User.prototype.inGroups = function (names, all) {
  var groups = this.groups().items
    .map(function (i) { return i.name })
    .reduce(function (memo, n) {
      if (names.indexOf(n) !== -1) memo.push(n)
      return memo
    }, [])
  return all ? groups.length === names.length : groups.length > 0
}
