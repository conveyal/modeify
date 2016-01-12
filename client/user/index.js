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

User.prototype.grantManagementPermission = function (org, callback) {
  request.get('/users/' + this.id() + '/add-to-group', {
    group: 'organization-' + org + '-manager'
  }, function (err, res) {
    if (err || !res.ok) {
      callback(res.text, res)
    } else {
      callback(null, res)
    }
  })
}

User.prototype.revokeManagementPermission = function (org, callback) {
  request.get('/users/' + this.id() + '/remove-from-group', {
    group: 'organization-' + org + '-manager'
  }, function (err, res) {
    if (err || !res.ok) {
      callback(res.text, res)
    } else {
      callback(null, res)
    }
  })
}

User.prototype.saveCustomData = function (callback) {
  request.post('/users/' + this.id() + '/save-custom-data', {
    customData: this.customData()
  }, function (err, res) {
    if (err || !res.ok) {
      callback(res.text, res)
    } else {
      callback(null, res)
    }
  })
}

User.prototype.addFavoritePlace = function (address) {
  var customData = this.customData()
  if(!customData.modeify_places) customData.modeify_places = []
  customData.modeify_places.push({
    address : address
  })
  this.customData(customData)
}

User.prototype.deleteFavoritePlace = function (address) {
  var customData = this.customData()
  if(!customData.modeify_places) customData.modeify_places = []
  customData.modeify_places = customData.modeify_places.filter(function(place) {
    return place.address !== address
  })
  this.customData(customData)
}

User.prototype.isFavoritePlace = function (address) {
  var customData = this.customData()
  if(!customData.modeify_places) return false
  for(var i=0; i < customData.modeify_places.length; i++) {
    if(customData.modeify_places[i].address === address) return true
  }
  return false
}

User.prototype.matchFavoritePlaces = function (text) {
  var customData = this.customData()
  if(!customData.modeify_places) return []
  var matches = []
  for(var i=0; i < customData.modeify_places.length; i++) {
    if(customData.modeify_places[i].address.toLowerCase().lastIndexOf(text.toLowerCase()) === 0) {
      matches.push(customData.modeify_places[i])
    }
  }
  return matches
}

User.loadManager = function (ctx, next) {
  request.get('/users/' + ctx.params.manager, function (err, res) {
    if (err || !res.ok) {
      next(err || res.text)
    } else {
      ctx.manager = new User(res.body)
      next()
    }
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

User.getManagersForOrg = function (org, callback) {
  request.get('/users/managers-for-organization', {
      organization: org
    }, function (err, res) {
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
