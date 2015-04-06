/**
 * Expose `plugin`
 */

module.exports = function (Model) {
  Model
    .attr('coordinate')
    .attr('address')
    .attr('original_address')
    .attr('city')
    .attr('county')
    .attr('magic_key')
    .attr('state')
    .attr('zip')

    /**
     * Full address
     */

  Model.prototype.fullAddress = function () {
    var addr = this.address() || ''
    var fuzzy = this.fuzzyAddress()

    if (fuzzy) {
      if (addr) addr += ', ' + fuzzy
      else addr = fuzzy
    }

    return addr
  }

  /**
   * Not the full address
   */

  Model.prototype.fuzzyAddress = function () {
    var city = this.city()
    var state = this.state()
    var zip = this.zip()
    var addr = city || ''

    if (city && (state || zip)) addr += ', '
    if (state) addr += state

    if (zip) {
      if (state) addr += ' ' + zip
      else addr += zip
    }

    return addr
  }

  /**
   * Obscured Coordinates
   */

  Model.prototype.fuzzyCoordinate = function () {
    var ll = this.coordinate()
    return {
      lat: obscure(ll.lat),
      lng: obscure(ll.lng)
    }
  }

  /**
   * Valid coordinate
   */

  Model.prototype.validCoordinate = function () {
    var c = this.coordinate()
    return c && !!c.lat && !!c.lng
  }
}

/**
 * Obscure a coordinate
 */

function obscure (c) {
  return Math.round(c * 1000) / 1000
}
