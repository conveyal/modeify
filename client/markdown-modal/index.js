var modal = require('./client/modal');

var Modal = module.exports = modal({
  closable: true,
  width: '640px',
  template: require('./template.html')
});
