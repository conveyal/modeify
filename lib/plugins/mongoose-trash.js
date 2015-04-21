/**
 * Don't actually destroy a model
 */

module.exports = function (schema) {
  schema.add({
    trashed: Date
  })

  schema.methods.trash = function (callback) {
    this.trashed = new Date()
    return this.save(callback)
  }

  schema.methods.untrash = function (callback) {
    this.trashed = undefined
    return this.save(callback)
  }
}
