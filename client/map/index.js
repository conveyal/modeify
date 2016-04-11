var config = require('config'); 
var debug = require('debug')(config.name() + ':map');
var page = require('page');
var plugins = require('./leaflet-plugins');

/**
 * Expose `map`
 */

module.exports = function(el, opts) {
  opts = opts || {};
  opts.tileLayer = opts.tileLayer || {
    detectRetina: true
  };

  // create a map in the el with given options
  if (config.map_provider && config.map_provider() === 'AmigoCloud') {
    return new Map(L.amigo.map(el, opts));
  } else {
    return new Map(L.mapbox.map(el, config.mapbox_map_id(), opts));
  }
};

/**
 * Expose `createMarker`
 */

module.exports.createMarker = function(opts) {
  debug('creating marker %s', opts);

  var marker;

  if (config.map_provider && config.map_provider() === 'AmigoCloud') {
    marker = L.marker(new L.LatLng(opts.coordinate[1], opts.coordinate[0]), {
      icon: L.amigo.marker.icon({
        'marker-size': opts.size || 'medium',
        'marker-color': opts.color || '#ccc',
        'marker-symbol': opts.icon || ''
      }),
      title: opts.title || ''
    });
  } else {
    marker = L.marker(new L.LatLng(opts.coordinate[1], opts.coordinate[0]), {
      icon: L.mapbox.marker.icon({
        'marker-size': opts.size || 'medium',
        'marker-color': opts.color || '#ccc',
        'marker-symbol': opts.icon || ''
      }),
      title: opts.title || ''
    });
  }

  if (opts.url) {
    marker.on('click', function() {
      page(opts.url);
    });
  }
  return marker;
};

/**
 * Expose `realtime`
 */


if (config.map_provider() === 'AmigoCloud') {
    module.exports.realtime = function() {
        debug('setting up socket connection');

        L.amigo.realtime.setAccessToken(config.realtime_access_token());
        L.amigo.realtime.connectDatasetByUrl(config.realtime_dataset_url());

        L.amigo.realtime.on('realtime', function (data) {

        });
    };
}

/**
 * Toggle realtime
 */
module.exports.toggleRealtime = function(viewMap) {
  var map = viewMap;
  debug('toggling realtime');

  if (!map.realtime || !map.realtime.active) {
      map = module.exports.realtimeMap = viewMap;

      module.exports.loadBusPredictionData(config.bus_prediction_url());
      module.exports.loadBusRoutesData(config.bus_routes_url());
      module.exports.queryFunctionId = setInterval(function () {
        module.exports.loadBusPredictionData(config.bus_prediction_url());
      }, config.query_interval());

      if (!map.realtime) {
          map.realtime = {
	      points: []
	  };
      }
      L.amigo.realtime.on('realtime', function (data) {
          var point = data.data[data.data.length - 1];
	  module.exports.realtimePoint = point;

          if (module.exports.findPoint(map, point) === -1) {
              module.exports.addPoint(map, point);
          } else {
              module.exports.movePoint(map, point);
          }
      });
      map.realtime.active = true;
  } else {
      window.clearInterval(module.exports.queryFunctionId);
      L.amigo.realtime.socket.removeAllListeners('realtime');
      for (var i = 0; i < map.realtime.points.length; i++) {
	  map.removeLayer(map.realtime.points[i].marker);
      }
      map.realtime.points = [];
      map.realtime.active = false;
  }
};

module.exports.loadBusRoutesData  = function (url) {
  var tokens = url.split('/'),
    datasetId = tokens[tokens.length - 1],
    query = 'SELECT amigo_id, lineabbr, linename, schedules FROM dataset_' + datasetId,
    projectUrl = tokens.slice(0, tokens.length - 2).join('/'),
    queryUrl = projectUrl + '/sql?token=' + config.realtime_access_token() +
      '&query=' + query + '&limit=1000';

  L.amigo.utils.get(queryUrl).
    then(function (data) {
      var routes = {};

      for (var i = 0; i < data.data.length; i++) {
        routes[parseInt(data.data[i].lineabbr)] =
	  {
            amigoId: data.data[i].amigo_id,
	    lineName: data.data[i].linename,
	    schedules: data.data[i].schedules
          };
      }
      module.exports.busRoutesData = routes;
    });
}

module.exports.loadBusPredictionData  = function (url) {
  var tokens = url.split('/'),
    datasetId = tokens[tokens.length - 1],
    query = 'SELECT * FROM dataset_' + datasetId,
    projectUrl = tokens.slice(0, tokens.length - 2).join('/'),
    queryUrl = projectUrl + '/sql?token=' + config.realtime_access_token() +
      '&query=' + query + '&limit=1000';

  
  L.amigo.utils.get(queryUrl).
    then(function (data) {
      var buses = {};

      for (var i = 0; i < data.data.length; i++) {
        buses[data.data[i].vehicle_id] =
          data.data[i];
      }
      module.exports.busPredictionData = buses;
    });
};

module.exports.drawRoute = function (marker) {
    var busId = marker.realtimeData.object_id,
      url = config.bus_routes_url(),
      tokens = url.split('/'),
      datasetId = tokens[tokens.length - 1],
      projectUrl = tokens.slice(0, tokens.length - 2).join('/'),
      routeStyle = {
	  color: '#8ec449',
	  opacity: 1,
	  weight: 4
      },
      routeId,
      queryUrl,
      query;

    if (busId.indexOf(' ') === -1) {
	busId = busId.split('-')[0];
    } else {
	busId = busId.split(' ')[0];
    }
    if (!module.exports.busPredictionData[busId]) return;
    routeId = module.exports.busPredictionData[busId].route_id;

    if (!routeId) return;

    query = 'SELECT st_asgeojson(wkb_geometry) FROM dataset_' + datasetId +
      " WHERE lineabbr='" + routeId + "'";
    queryUrl = projectUrl + '/sql?token=' + config.realtime_access_token() +
      '&query=' + query + '&limit=1000';

    L.amigo.utils.get(queryUrl).
	then(function (data) {
	    if (!data.data.length) return;
	    module.exports.activeRoute = L.geoJson(
		JSON.parse(data.data[0].st_asgeojson),
		{
		    style: routeStyle
		}
	    ).addTo(module.exports.realtimeMap);
	});
};

module.exports.deleteRoute = function (marker) {
    if (!module.exports.activeRoute) return;
    module.exports.realtimeMap.removeLayer(
	module.exports.activeRoute
    );
    module.exports.activeRoute.clearLayers();
    module.exports.activeRoute = null;
};

/**
 * REALTIME FUNCTIONS
 */
L.NumberedDivIcon = L.Icon.extend({
  options: {
  iconUrl: '',
  number: '',
//    iconSize: new L.Point(25, 41),
//	iconAnchor: new L.Point(13, 41),
//	popupAnchor: new L.Point(0, -33),
  className: 'leaflet-div-icon',
  divClass: 'number'
  },
  createIcon: function () {
    var div = document.createElement('div');
    var text = document.createElement('span');
    var img = this._createImg(this.options['iconUrl']);
    var numdiv = document.createElement('div');
    numdiv.setAttribute ( "class", this.options['divClass'] );
    text.innerHTML = this.options['number'] || '';
    numdiv.appendChild(text);
    img.setAttribute('style', 'max-width:' + this.options.iconSize[0] + 'px !important;' +
		     'max-height:' + this.options.iconSize[1] + 'px !important');
    div.appendChild ( img );
    if (this.options['number']) {
      div.appendChild ( numdiv );
    }
    this._setIconStyles(div, 'icon');
    return div;
  }
});

L.Control.ToggleRealTime = L.Control.extend({
    options: {
        position: 'topright',
    },

    onAdd: function (map) {
        var controlDiv = L.DomUtil.create('div', 'leaflet-control-realtime');
        L.DomEvent
            .addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
            .addListener(controlDiv, 'click', L.DomEvent.preventDefault)
        .addListener(controlDiv, 'click', function () {
	    if (!this.active) {
		this.className += ' active';
		this.active = true;
	    } else {
		this.className = this.className.split(' ').slice(0 ,2).join(' ');
		this.active = false;
	    }
	    module.exports.toggleRealtime(map);
	});

        var button = L.DomUtil.create('a', 'leaflet-control-realtime-interior', controlDiv);
	var busIcon = L.DomUtil.create('i', 'fa fa-fw fa-bus', button);
	var rssIcon = L.DomUtil.create('i', 'fa fa-fw fa-rss', button);
        button.title = 'Toggle Realtime';
        return controlDiv;
    }
});

L.control.toggleRealTime = function (options) {
    return new L.Control.ToggleRealTime(options);
};

module.exports.getRouteId = function (point) {
    var busId, routeId;

    if (point.object_id.indexOf(' ') === -1) {
      busId = point.object_id.split('-')[0];
    } else {
      busId = point.object_id.split(' ')[0];
    }
    busId = parseInt(busId);

    if (module.exports.busPredictionData &&
	module.exports.busPredictionData[busId] &&
	module.exports.busPredictionData[busId].route_id
    ) {
      routeId = module.exports.busPredictionData[busId].route_id;
    }
    return routeId;
}

module.exports.addPoint = function (map, point) {
    var routeId = module.exports.getRouteId(point),
      line, newPoint;

    line = L.polyline(
        [
            [parseFloat(point.latitude), parseFloat(point.longitude)],
            [parseFloat(point.latitude), parseFloat(point.longitude)],
        ]

    );
    console.log(Math.random())
    newPoint = {
        id: point.object_id,
        marker: L.animatedMarker(line.getLatLngs(),
            {
            className: "realtimemarker"
            }
        ).addTo(map)
    };

    if (parseFloat(point.speed) < 0.5) {
        newPoint.marker.setIcon(new L.NumberedDivIcon({
            iconUrl: 'assets/images/graphics/bus-gray.png',
            iconSize: [40, 55],
            iconAnchor: [20, 50],
            popupAnchor:  [0, -50],
            className: 'tint',
	    number: routeId,
	    divClass: 'number-inactive'
        }));
    } else {
        newPoint.marker.setIcon(new L.NumberedDivIcon({
            iconUrl: 'assets/images/graphics/bus-green.png',
            iconSize: [40, 55],
            iconAnchor: [20, 50],
            popupAnchor:  [0, -50],
            className: 'tint',
	    number: routeId
        }));
    }

    newPoint.marker.realtimeData = point;
    newPoint.marker.bindPopup(module.exports.makePopup(point));
    newPoint.marker.on('popupopen', function () {
	// Workaround for bug where you can no longer
	// click on start and end markers after opening
	// a real-time popup
	var zoomHideEl = document.querySelectorAll('svg.leaflet-zoom-hide')[0];
	if (zoomHideEl) zoomHideEl.style.display = 'inherit';
	module.exports.drawRoute(this);
    });
    newPoint.marker.on('popupclose', function () {
	// Workaround counterpart
	//var zoomHideEl = document.querySelectorAll('svg.leaflet-zoom-hide')[0];
	//if (zoomHideEl) zoomHideEl.style.display = 'none';
	//module.exports.deleteRoute(this);
    });

    map.realtime.points.push(newPoint);
};

module.exports.findPoint = function (map, point) {
    for (var i = 0; i < module.exports.realtimeMap.realtime.points.length; i++) {
        if (module.exports.realtimeMap.realtime.points[i].id === module.exports.realtimePoint.object_id) {
            return i;
        }
    }

    return -1;
};

module.exports.movePoint = function (map, point) {
    var routeId = module.exports.getRouteId(point),
      line, currentPoint;

    currentPoint = map.realtime.points[module.exports.findPoint(point)];
    line = L.polyline(
        [
            [currentPoint.marker.getLatLng().lat,
             currentPoint.marker.getLatLng().lng],
            [parseFloat(point.latitude),
             parseFloat(point.longitude)]
        ]
    );

    if (parseFloat(point.speed) < 0.5) {
        currentPoint.marker.setIcon(new L.NumberedDivIcon({
            iconUrl: 'assets/images/graphics/bus-gray.png',
            iconSize: [40, 55],
            iconAnchor: [20, 50],
            popupAnchor:  [0, -50],
            className: 'tint',
	    number: routeId,
	    divClass: 'number-inactive'
        }));
    } else {
        currentPoint.marker.setIcon(new L.NumberedDivIcon({
            iconUrl: 'assets/images/graphics/bus-green.png',
            iconSize: [40, 55],
            iconAnchor: [20, 50],
            popupAnchor:  [0, -50],
            className: 'tint',
	    number: routeId
        }));
    }

    currentPoint.marker.realtimeData = point;
    currentPoint.marker.setLine(line.getLatLngs());
    currentPoint.marker.setPopupContent(
        module.exports.makePopup(point)
    );
    currentPoint.marker.animate();
};

module.exports.makePopup = function (point) {
    var busId, string, routeId;

    if (point.object_id.indexOf(' ') === -1) {
      busId = point.object_id.split('-')[0];
    } else {
      busId = point.object_id.split(' ')[0];
    }
    busId = parseInt(busId);

    string  =  '<div class="bus-popup">' +
        '<div class="popup-header"><h5><i class="fa fa-bus"></i> ';
    if (module.exports.busPredictionData &&
	module.exports.busPredictionData[busId] &&
	module.exports.busPredictionData[busId].route_id
    ) {
      routeId = module.exports.busPredictionData[busId].route_id;
      string += routeId;
      if (module.exports.busRoutesData &&
	  module.exports.busRoutesData[routeId]
      ) {
        string += ': <a target="_blank" href="' +
            module.exports.busRoutesData[routeId].schedules +'">' +
            module.exports.busRoutesData[routeId].lineName + '</a>';
      }
      string += '</h5>';
    }
    string += '</div>';

    string += '<div class="popup-body">';
    string += '<table>';
    string += '<tr class="popup-row">' +
        '<td class="label">Longitude</td><td class="value">' +
        point.longitude + '</td>' +
        '</tr>';
    string += '<tr class="popup-row">' +
        '<td class="label">Latitude: </td><td class="value"> ' +
        point.latitude + '</td>' +
        '</tr>';
    string += '<tr class="popup-row">' +
        '<td class="label">Altitude: </td><td class="value"> ' +
        point.altitude + '</td>' +
        '</tr>';

    for (var attr in point) {
        var value = point[attr];

        if (attr === 'longitude' ||
            attr === 'latitude' ||
            attr === 'altitude' ||
	    attr === 'satellite_fix' ||
	    attr === 'object_id' ||
	    attr === 'satellites' ||
	    attr === 'climb' ||
	    attr === 'track' ||
	    attr === 'separation') {
            continue;
        }

        if (attr === 'timestamp') {
            var dt = (new Date(value * 1000)).toLocaleString();
            value = dt.toString();
        }

        string += '<tr class="popup-row">' +
            '<td class="label">' +
            attr.charAt(0).toUpperCase() +
            attr.slice(1) +
            '</td><td class="value"> ' +
            value + '</td>' +
            '</tr>'
    }
    string += '</table>';
    string += '</div>';
    string += '</div>';

    return string;
};


/**
 * Map
 */

function Map(map) {
  this.map = map;
  if (config.map_provider && config.map_provider() === 'AmigoCloud') {
    this.featureLayer = L.amigo.featureLayer().addTo(map);
  } else {
    this.featureLayer = L.mapbox.featureLayer().addTo(map);
  }
}

/**
 * Add Marker
 */

Map.prototype.addMarker = function(marker) {
  this.featureLayer.addLayer(marker);
};

/**
 * Add Layer
 */

Map.prototype.addLayer = function(layer) {
  this.map.addLayer(layer);
};

/**
 * Fit bounds
 */

Map.prototype.fitLayer = function(layer) {
  debug('fitting layer %s', layer);
  var map = this.map;
  map.whenReady(function() {
    debug('map ready');
    setTimeout(function() {
      var bounds = layer.getBounds();
      debug('fitting to bounds %s', bounds);
      map.fitBounds(bounds);
    }, 200);
  });
};

/**
 * Fit to multiple layers
 */

Map.prototype.fitLayers = function(layers) {
  debug('fitting to %s layers', layers.length);
  var map = this.map;
  map.whenReady(function() {
    debug('map ready');
    setTimeout(function() {
      var bounds = layers[0].getBounds();
      for (var i = 1; i < layers.length; i++) {
        bounds.extend(layers[i].getBounds());
      }
      map.fitBounds(bounds);
    }, 200);
  });
};

/**
 * Featureify
 */

function featureify(opts) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: opts.coordinate
    },
    properties: {
      title: opts.title || '',
      description: opts.description || '',
      'marker-size': opts.size || 'medium',
      'marker-color': opts.color || '#ccc',
      'marker-symbol': opts.icon || ''
    }
  };
}
