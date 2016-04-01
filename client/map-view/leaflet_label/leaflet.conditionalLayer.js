// Loads a given number of markers visible in the frame
// Inspired on the work of Ishmael Smyrnow

  L.ConditionalMarkers = L.FeatureGroup.extend({
  	initialize: function (layers) {
		this._layers = {};

		var i, len;

		if (layers) {
			for (i = 0, len = layers.length; i < len; i++) {
				this.addLayer(layers[i]);
			}
		}
		this.options= {
      		maxMarkers: 500
      	}
      this._markers= [];
    	this.onMap= false;
	},
    setMaxMarkers: function (i) {
    	if (this.options.maxMarkers != undefined) {
	    	this.options.maxMarkers=i;
    	}
    },

    addLayer: function (layer) {
      this._markers.push(layer);
      if (this._map !=undefined){
        this._update();
      }
    },
    
    removeLayer: function (layer) {
      var markerIndex;

      for (var i = 0; i < this._markers.length; i++) {
        if (this._markers[i] == layer) {
          markerIndex = i;
          break;
        }
      }

      if (typeof markerIndex !== 'undefined') {
        this._markers.splice(markerIndex, 1);
        this._layer.removeLayer(layer);
      }
    },

    onAdd: function (map) {
      this._map = map;
      var self = this;
      this.onMap = true;
      if (map != null) {
        map.on("moveend", function (e) { self._update.call(self, e); });
        map.on("zoomend", function (e) { self._update.call(self, e); });
      }

      // Add layer to the map
      this._layer = new L.FeatureGroup();
      this._map.addLayer(this._layer);
      this._addMarkers();
      this._cleanupMarkers();

      L.FeatureGroup.prototype.onAdd.call(this, map);
    },

    onRemove: function() {
      this._removeMarkers();
      this.onMap = false;
    },

    _update: function (e) {
      // Perform updates to markers on map
      if (this.onMap==true) {
        this._removeMarkers();
        this._addMarkers();
        this._cleanupMarkers();
      }
    },

    _addMarkers: function () {
      // Add select markers to layer; skips existing ones automatically
      var i, marker;

      var markers = this._getMarkersInViewport(this._map);

      for (i = 0; i < markers.length && i < this.options.maxMarkers; i++) {
        marker = markers[i];
        this._layer.addLayer(marker);
      }
    },

    _removeMarkers: function () {
      this._layer.clearLayers();
    },

    _cleanupMarkers: function () {
      // Remove out-of-bounds markers
      // Also keep those with popups or in expanded clusters
      var bounds = this._map.getBounds();

      this._layer.eachLayer(function (marker) {
        if (!bounds.contains(marker.getLatLng()) && (!marker._popup || !marker._popup._container)) {
          this._layer.removeLayer(marker);
        }
      }, this);
    },

    _getMarkersInViewport: function (map) {
      var markers = [],
        bounds = map.getBounds(),
        i,
        marker;

      for (i = 0; i < this._markers.length; i++) {
        marker = this._markers[i];
        if (bounds.contains(marker.getLatLng())) {
          markers.push(marker);
        }
      }

      return markers;
    }
  });

  L.conditionalMarkers = function (markers, options) {
    var layer = new L.ConditionalMarkers();
    for(i in markers) {
      layer._markers = markers;
    }
    layer.setMaxMarkers(options.maxMarkers);
    return layer;
  };