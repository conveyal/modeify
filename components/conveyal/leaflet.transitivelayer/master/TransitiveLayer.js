L.TransitiveLayer = module.exports = L.Class.extend({

  initialize: function(transitive, options) {
    this._transitive = transitive;
  },

  onAdd: function(map) {
    this._map = map;

    this._initContainer();

    map.on("moveend", this._refresh, this);
    map.on("zoomend", this._refresh, this);
    map.on("drag", this._refresh, this);
    map.on("resize", this._resize, this);

    this._transitive.options.zoomEnabled = false;
    this._transitive.options.autoResize = false;
    this._transitive.setElement(this._container);
    this._transitive.render();

    var self = this;
    this._transitive.on('clear data', function() {
      self._refresh();
    });

    this._transitive.on('update data', function() {
      self._transitive.render();
      self._refresh();
    });
  },

  onRemove: function(map) {
    map.getPanes().overlayPane.removeChild(this._container);
    map.off("moveend", this._refresh, this);
    map.off("zoomend", this._refresh, this);
    map.off("drag", this._refresh, this);
    map.off("resize", this._resize, this);
  },

  getBounds: function() {
    var bounds = this._transitive.getNetworkBounds();
    if(!bounds) return null;
    return new L.LatLngBounds([bounds[0][1], bounds[0][0]],[bounds[1][1], bounds[1][0]]);
  },

  _initContainer: function() {
    this._container = L.DomUtil.create('div', 'leaflet-transitive-container', this._map.getPanes().overlayPane);
    this._container.style.position = 'absolute';
    this._container.style.width = this._map.getSize().x + "px";
    this._container.style.height = this._map.getSize().y + "px";
  },

  _refresh: function() {
    var bounds = this._map.getBounds();
    var topLeft = this._map.latLngToLayerPoint(bounds.getNorthWest());
    L.DomUtil.setPosition(this._container, topLeft);
    this._transitive.setDisplayBounds([
      [bounds.getWest(), bounds.getSouth()],
      [bounds.getEast(), bounds.getNorth()]
    ]);
  },

  _resize: function(data) {
    this._transitive.resize(data.newSize.x, data.newSize.y);
    this._refresh();
  }

});

L.transitiveLayer = function(transitive, options) {
  return new L.TransitiveLayer(transitive, options);
};