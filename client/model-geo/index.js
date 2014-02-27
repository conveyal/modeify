/**
 * Expose `plugin`
 */

module.exports = function(Model) {
  Model
    .attr('coordinate', {
      type: 'object'
    })
    .attr('address', {
      type: 'string'
    })
    .attr('city', {
      type: 'string'
    })
    .attr('state', {
      type: 'string'
    })
    .attr('zip', {
      type: 'number'
    });

  /**
   * Full address
   */

  Model.prototype.fullAddress = function() {
    return this.address() + ', ' + this.city() + ', ' + this.state() + ' ' +
      this.zip();
  };

  /**
   * Not the full address
   */

  Model.prototype.fuzzyAddress = function() {
    return this.city() + ', ' + this.state() + ' ' + this.zip();
  };

  /**
   * Obscured Coordinates
   */

  Model.prototype.fuzzyCoordinate = function() {
    var ll = this.coordinate();
    return {
      lat: obscure(ll.lat),
      lng: obscure(ll.lng)
    };
  };
};

/**
 * Obscure a coordinate
 */

function obscure(c) {
  return Math.round(c * 1000) / 1000;
}
