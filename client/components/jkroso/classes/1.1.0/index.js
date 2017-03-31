
module.exports = document.createElement('div').classList
  ? require('./modern')
  : require('./fallback')