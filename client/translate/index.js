var fr = require('./fr.json')

var langage = fr
var _tr = module.exports = function (translate, filter) {
        if (arguments.length == 1 || arguments.length == 2) {
            if (langage[translate] || langage[translate] === "") return langage[translate]
            if (translate !== " " && translate !=="" && !filter) console.log(translate + " is not registered")
            if (translate !== " " && translate !=="" && filter) console.log(translate + " is not registered. Looking for filter " + filter)

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
        var tr = _tr(translations[i].innerText, filter)
        var tmp = translations[i].innerHTML.replace(translations[i].innerText, tr)
        translations[i].innerText =  tr
        translations[i].innerHTML = tmp
  }
}

module.exports.attribute = function (view, filter, attribute) {
    var translations = view.el.querySelectorAll(filter)
    for (var i=0; i<translations.length;i++){
        //innerText Non supporté par Firefox ?
        if (translations[i][attribute]) translations[i][attribute] = _tr(translations[i][attribute], filter)
        else console.error("the element " + translations[i] + " has no attribute " + attribute)
  }
}

module.exports.stringOfHTML = function (htmlstr, strToReplace, limitStart, limitEnd){
    if (!limitStart) limitStart = 0
    if (!limitEnd && limitEnd !== 0) limitEnd = strToReplace.length
    var translatedStr = strToReplace.substring(0, limitStart) +_tr(strToReplace.substring(limitStart, limitEnd)) + strToReplace.substring(limitEnd)
    return htmlstr.replace(strToReplace, translatedStr)
}
