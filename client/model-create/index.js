/**
 * Expose `plugin`
 */

module.exports = function (Model) {
  Model.create = function (data, callback) {
    var model = new Model(data)
    model.save(function (err, res) {
      callback(err, model, res)
    })
  }
}
