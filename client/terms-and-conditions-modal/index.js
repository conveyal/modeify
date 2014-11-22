var modal = require('modal');

/**
* Create `Modal`
*/

var Modal = module.exports = modal({
  closable: true,
  width: '640px',
  template: require('./template.html').replace('{{content}}', require('./content.md'))
});
