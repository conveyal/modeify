var request = require('./client/request')
var Pikaday = require('pikaday')
var moment = require('moment')

var textModal = require('text-modal')
var view = require('view')

var displayFormat = 'MM-DD-YYYY'

var View = view(require('./template.html'), function(view, model) {
  var fromDateInput = view.find('.fromDate')

  var defaultToDate = moment()
  var defaultFromDate = moment().add(-7, 'days')

  view.fromDatePicker = new Pikaday({
    field: fromDateInput,
    defaultDate: defaultFromDate.toDate(),
    setDefaultDate: defaultFromDate.toDate(),
    format: displayFormat,
    onSelect: function() {
      view.updateRange()
    }
  });

  var toDateInput = view.find('.toDate')
  view.toDatePicker = new Pikaday({
    field: toDateInput,
    defaultDate: defaultToDate.toDate(),
    setDefaultDate: defaultToDate.toDate(),
    format: displayFormat,
    onSelect: function() {
      view.updateRange()
    }
  });

  view.updateRange();
})

View.prototype.updateRange = function() {
  var view = this
  var fromDate = moment(this.fromDatePicker.getDate())
  var toDate = moment(this.toDatePicker.getDate())

  if(toDate.isBefore(fromDate)) {
    textModal('To date must be later than from date.')
  }

  request.get('/user-activity/signups', {
    fromDate: fromDate.format('MM-DD-YYYY'),
    toDate: toDate.format('MM-DD-YYYY')
  }, function (err, signups) {
    if (err) {
      window.alert(err)
    } else {
      //console.log('signups', JSON.parse(signups.text));
      view.updateTable(JSON.parse(signups.text))
    }
  })
}

View.prototype.updateTable = function(users) {
  var fromDate = moment(this.fromDatePicker.getDate())
  var toDate = moment(this.toDatePicker.getDate())

  var usersByDate = {}

  var tbody = this.find('.signup-table-body')
  while (tbody.firstChild) {
      tbody.removeChild(tbody.firstChild);
  }

  for(var i=0; i<users.length; i++) {
    var user = users[i]
    var createdAt = moment(user.createdAt).add(-5, 'hours').format('MM-DD-YYYY')
    if(!(createdAt in usersByDate)) usersByDate[createdAt] = []
    usersByDate[createdAt].push(user)
  }

  while(fromDate.isSameOrBefore(toDate)) {
    var usersForDate = usersByDate[fromDate.format('MM-DD-YYYY')]
    var tr = document.createElement('tr')
    tr.innerHTML = '<td>' + fromDate.format(displayFormat) + '</td><td>' + (usersForDate ? usersForDate.length : 0) + '</td><td>0</td>'
    tbody.appendChild(tr)
    fromDate.add(1, 'days')
  }

  var tr = document.createElement('tr')
  tr.innerHTML = '<td><b>Total<b></td><td><b>' + (users ? users.length : 0) + '</b></td><td>0</td>'
  tbody.appendChild(tr)

}

module.exports = function (ctx, next) {
  ctx.view = new View()
  next()
}
