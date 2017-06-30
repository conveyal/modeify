var fr = require('./fr.json')

var langage = fr
var _tr = module.exports = function (translate) {
        if (arguments.length == 1) {
            if (langage[translate] || langage[translate] === "") return langage[translate]
            if (translate !== " " && translate !=="") console.log(translate + " is not registered")

            return translate
        }
        else {
            console.error("_tr function doesn't have an argument or has too many argument")
            return ""
        }
}

module.exports.inHTML = function (view, filter) {
    var translations = view.el.querySelectorAll(filter)
    for (var i=0; i<translations.length;i++){
        //innerText Non supporté par Firefox ?
        var tr = _tr(translations[i].innerText)
        var tmp = translations[i].innerHTML.replace(translations[i].innerText, tr)
        translations[i].innerText =  tr
        translations[i].innerHTML = tmp
  }
  return view
}

module.exports.attribute = function (view, filter, attribute) {
    var translations = view.el.querySelectorAll(filter)
    for (var i=0; i<translations.length;i++){
        //innerText Non supporté par Firefox ?
        translations[i][attribute] = _tr(translations[i][attribute])
  }
  return view
}

module.exports.stringOfHTML = function (htmlstr, strToReplace, limit){
    strToReplace = strToReplace.substring(limit)
    return htmlstr.replace(strToReplace, _tr(strToReplace))
}
