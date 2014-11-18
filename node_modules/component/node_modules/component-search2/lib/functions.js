
exports.filterBy = {
  owner: function (owner) {
    return function (json) {
      return json.github.owner.login === owner;
    }
  },
  keyword: function (keyword) {
    return function (json) {
      var keywords = json.keywords;
      if (!keywords) return false;
      return ~json.keywords.indexOf(keyword);
    }
  },
  text: function (string) {
    string = escapeRegExp(string).trim();
    var terms = string.split(/\s+/);
    var re = new RegExp(terms.join('.* .*'), 'i');
    return function (json) {
      return re.test(json.name)
        || re.test(json.description)
        || re.test(json.github.full_name);
    }
  }
}

exports.sortBy = {
  starsAndWatchers: function (a, b) {
    return followScore(b) - followScore(a);
  }
}

function followScore(json) {
  var watchers = json.github.subscribers_count || 0;
  var stars = json.github.stargazers_count || 0;
  return watchers * 10 + stars;
}

function escapeRegExp(str) {
  return String(str).replace(/([.*+?=^!:${}()|[\]\/\\])/g, '\\$1');
}