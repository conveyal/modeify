var model = require('model')

var request = require('./client/request')

var User = module.exports = model('User')
  .attr('href')
  .attr('customData')
  .attr('email')
  .attr('fullName')
  .attr('givenName')
  .attr('surname')
  .attr('groups')

User.prototype.id = function () {
  return this.href().split('/').pop()
}

User.prototype.inGroups = function (names, all) {
  var groups = this.groupNames()
    .reduce(function (memo, n) {
      if (names.indexOf(n) !== -1) memo.push(n)
      return memo
    }, [])
  return all ? groups.length === names.length : groups.length > 0
}

User.prototype.getOrganizationId = function () {
  return this.groupNames().reduce(function (m, n) {
    if (n.indexOf('organization-') !== -1 && n.indexOf('-manager') !== -1) {
      return n.split('-')[1]
    } else {
      return n
    }
  }, false)
}

User.prototype.groupNames = function () {
  return (this.groups().items || []).map(function (i) {
    return i.name
  })
}

User.getManagers = function (callback) {
  request.get('/users/managers', function (err, res) {
    if (err) {
      callback(err)
    } else {
      callback(null, (res.body || []).map(function (user) {
        return new User(user)
      }))
    }
  })
}

User.createManager = function (info, callback) {
  request.post('/users/managers', info, function (err, res) {
    if (err) {
      callback(res.text || err)
    } else {
      callback(null, res.body)
    }
  })
}
