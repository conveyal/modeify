var config = require('config');
var mapModule = require('map');
var plugins = require('./leaflet_plugins');
var polyUtil = require('./polyline_encoded.js');
var routeboxer = require('./leaflet_routeboxer.js');
var leaflet_label = require('./leaflet_label/leaflet.label-src.js');
var collision = require('./leaflet_layergroup_collision.js');
var session = require('session');

var center = config.geocode().center.split(',').map(parseFloat)
if (config.map_provider && config.map_provider() !== 'AmigoCloud') {
    L.mapbox.accessToken = config.mapbox_access_token();
}

module.exports = function (el) {
    var map, realtime, southWest, northEast, blurLayer;
    localStorage.removeItem('dataplan');
    if (config.map_provider && config.map_provider() === 'AmigoCloud') {
        southWest = L.latLng(35.946877085397, -123.480610897013);
        northEast = L.latLng(40.763279543715, -118.789317362500);
        map = (new L.amigo.map(el, {
            amigoLogo: 'right',
            loadAmigoLayers: false,
            inertia: false,
            zoomAnimation: $('.hide-map').css('display') !== 'none',
            maxBounds: L.latLngBounds(southWest, northEast),
            minZoom: 8
        })).setView([center[1], center[0]], config.geocode().zoom);

        L.amigo.auth.setToken(config.support_data_token());

        blurLayer = L.tileLayer(
            'https://www.amigocloud.com/api/v1/users/' +
            '23/projects/3019/datasets/23835/tiles/{z}/{x}/{y}.png?' +
            'token=' + config.support_data_token(), {
                name: 'Uncovered Area'
            }
        );

        map.addAuthLayer({
            id: config.mapbox_map_id(),
            accessToken: config.mapbox_access_token(),
            name: 'Gray',
            provider: 'mapbox'
        });
        map.addBaseLayer(L.amigo.AmigoGray);
        map.layersControl.addBaseLayer(
            L.bingLayer(
                config.bing_key(), {
                    type: 'Road',
                    attribution: 'Bing Maps'
                }
            ),
            'Bing Road'
        );
        map.layersControl.addOverlay(blurLayer);
        blurLayer.addTo(map);

        module.exports.activeMap = map;

        map.realtimeControl = L.control.toggleRealTime().addTo(map);

        realtime = mapModule.realtime();


    } else {

        map = L.mapbox.map(el, config.mapbox_map_id(), {
            attributionControl: false,
            inertia: false,
            zoomAnimation: false
        }).setView([center[1], center[0]], config.geocode().zoom);
    }

    return map;
};

module.exports.getMap = function () {
    return this.activeMap;
};

module.exports.cleanRoute = function () {
    module.exports.activeRoute.removeLayer();
    module.exports.activeRoute = null;
};

module.exports.polyline_creadas = [];
module.exports.marker_creadas = [];
module.exports.makerpoint_creadas = [];
module.exports.collision_group = {};
module.exports.marker_collision_group = [];
module.exports.last_marker_collision_group = [];
module.exports.addedRouteStops = [];
module.exports.addedRouteBuses = [];

module.exports.drawMakerCollision = function () {
    var collision_group = L.layerGroup.collision();
    var marker_collision_group = [];
    for (i in this.marker_collision_group) {
        for (j in this.marker_collision_group[i]) {
            marker_collision_group.push(this.marker_collision_group[i][j]);
        }
    }
    collision_group.addLayer(marker_collision_group);
    collision_group.onAdd(this.activeMap);
    this.collision_group = collision_group;

};

module.exports.drawItinerationMakerCollision = function (i) {
    var collision_group = L.layerGroup.collision();
    var marker_collision_group = [];
    var selection_marker_collision_group = [];

    for (j in this.last_marker_collision_group[i]) {
        marker_collision_group.push(this.last_marker_collision_group[i][j]);
        var objmarker = this.last_marker_collision_group[i][j];
        selection_marker_collision_group.push(objmarker);
    }

    for (j in this.last_marker_collision_group) {
        if (j != i) {

            for (k in this.last_marker_collision_group[j]) {
                var collision = false;
                var objmarker = this.last_marker_collision_group[j][k].getLatLng();
                for (m in selection_marker_collision_group) {
                    var iobjmarker = selection_marker_collision_group[m].getLatLng();
                    if (objmarker.lat == iobjmarker.lat && objmarker.lng == iobjmarker.lng) {
                        collision = true;
                        break;
                    } else {
                        collision = false;
                    }
                }

                if (!collision) {
                    marker_collision_group.push(this.last_marker_collision_group[j][k]);
                }

            }
        }

    }
    collision_group.addLayer(marker_collision_group);
    collision_group.onAdd(this.activeMap);
    this.collision_group = collision_group;

};

module.exports.getpolyline_creadas = function () {
    return this.polyline_creadas;
};

module.exports.getMarker_creadas = function () {
    return this.marker_creadas;
};

module.exports.cleanPolyline = function () {
    var polyline_creadas = this.getpolyline_creadas();
    var map = this.activeMap;
    for (i in polyline_creadas) {
        try {
            map.removeLayer(polyline_creadas[i]);

        } catch (e) {
            console.log("problema al eliminar " + e);
        }

    }
    this.polyline_creadas = [];

};

module.exports.cleanMarkerCollision = function () {

    for (i in this.marker_collision_group) {
        for (j in this.marker_collision_group[i]) {
            this.collision_group.removeLayer(this.marker_collision_group[i][j]);
        }
    }

    for (i in this.last_marker_collision_group) {
        for (j in this.last_marker_collision_group[i]) {
            this.collision_group.removeLayer(this.last_marker_collision_group[i][j]);
        }
    }

    this.last_marker_collision_group = this.marker_collision_group;

    this.marker_collision_group = [];
};

module.exports.cleanMarker = function () {
    var map = this.activeMap;
    for (i in this.marker_creadas) {
        try {
            map.removeLayer(this.marker_creadas[i]);

        } catch (e) {
            console.log("problema al eliminar " + e);
        }
    }

    this.marker_creadas = [];

};

module.exports.cleanMarkerpoint = function () {
    var map = this.activeMap;
    for (i in this.makerpoint_creadas) {
        try {
            map.removeLayer(this.makerpoint_creadas[i]);

        } catch (e) {
            console.log("problema al eliminar " + e);
        }
    }

    this.makerpoint_creadas = [];

};

module.exports.marker_map = function (from, to) {
    var IconStart = L.icon({
        iconUrl: 'assets/images/graphics/start.svg',
        iconSize: [28, 28],
        iconAnchor: [0, 0],
        popupAnchor: [0, -50]
    });
    var IconEnd = L.icon({
        iconUrl: 'assets/images/graphics/end.svg',
        iconSize: [28, 28],
        iconAnchor: [0, 0],
        popupAnchor: [0, -50]
    });

    var markerform = new L.marker([from[0], from[1]], {
            icon: IconStart,
            draggable: true
        })
        .addTo(this.activeMap);
    var markerto = new L.marker([to[0], to[1]], {
            icon: IconEnd,
            draggable: true
        })
        .addTo(this.activeMap);
    var _this = this;

    markerform.on('dragend', function (e) {
        var marker = e.target;
        var result = marker.getLatLng();
        _this.cleanPolyline();
        _this.cleanMarkerpoint();
        _this.cleanMarkerCollision();
        var plan = session.plan();

        plan.setAddress('from', result.lng + ',' + result.lat, function (err, rees) {
            plan.updateRoutes();
        });
    });

    markerto.on('dragend', function (e) {
        var marker = e.target;
        var result = marker.getLatLng();
        _this.cleanPolyline();
        _this.cleanMarkerpoint();
        _this.cleanMarkerCollision();
        var plan = session.plan();
        plan.setAddress('to', result.lng + ',' + result.lat, function (err, rees) {
            plan.updateRoutes();
        });
    });

    this.marker_creadas.push(markerform);
    this.marker_creadas.push(markerto);
};

module.exports.marker_map_point = function (to, map, itineration) {

    var name = to[2];
    var class_name = 'leaflet-div-icon1 circle-fade-' + itineration;
    var html = "<span class='leaflet-label'>" + name + "</span>";

    var marker = L.marker({
        "lat": to[0],
        "lng": to[1]
    }, {
        icon: L.divIcon({
            className: class_name,
            iconSize: [15, 15],
            iconAnchor: [0, 0],
            html: html
        }),
        interactive: false,
        clickable: false
    });

    if (this.marker_collision_group[itineration] === undefined) {
        this.marker_collision_group[itineration] = [];
        this.marker_collision_group[itineration].push(marker);
    } else {
        this.marker_collision_group[itineration].push(marker);
    }
};

module.exports.drawRouteAmigo = function (legs, mode, itineration) {
    var route = legs.legGeometry.points;
    var circle_from = [legs.from.lat, legs.from.lon, legs.from.name];
    var circle_to = [legs.to.lat, legs.to.lon, legs.to.name];
    var color = '#000000';
    var weight = 5;
    var classname = "iteration-" + itineration + " iteration-200";


    var dasharray = '';

    if (mode == "CAR") {
        color = '#9E9E9E';
        dasharray = '6';
        weight = 3;

    } else if (mode == "BICYCLE") {
        color = '#FF0000';
        if (!(legs.routeColor === undefined)) {
            color = "#" + legs.routeColor;
        }
        dasharray = '6';
        weight = 3;

    } else if (mode == "SUBWAY" || mode == "RAIL") {
        if (!(legs.routeColor === undefined)) {
            if (legs.routeColor != "" || legs.routeColor.length == 6) {
                color = "#" + legs.routeColor;
            }

        }
        weight = 8;
        this.marker_map_point(circle_from, this.activeMap, itineration);
        this.marker_map_point(circle_to, this.activeMap, itineration);

    } else if (mode == "WALK") {
        color = '#0BC8F4';
        dasharray = '6';
        weight = 3;
    } else if (mode == "BUS") {
        //color = '#FEF0B5';
        if (!(legs.routeColor === undefined)) {
            if (legs.routeColor != "" || legs.routeColor.length == 6) {
                color = "#" + legs.routeColor;
            }
        }
        weight = 5;
        this.marker_map_point(circle_from, this.activeMap, itineration);
        this.marker_map_point(circle_to, this.activeMap, itineration);
    }

    var color_options;
    color_options = {
        color: color,
        weight: weight,
        opacity: 1,
        dashArray: dasharray,
        className: classname
    };

    var argpolyline = L.PolylineUtil.decode(route, 5);
    argpolyline.unshift(circle_from);
    route = new L.Polyline(argpolyline, color_options);
    this.polyline_creadas.push(route);
    var boxes = L.RouteBoxer.box(route, 5);
    var boxpolys = new Array(boxes.length);
    route.addTo(this.activeMap);
};

module.exports.drawRouteStops = function (routeId, stops) {
    var stopsGroup = L.featureGroup();
    var endPoint = 'http://api.transitime.org/api/v1/key/5ec0de94/agency/vta/command/predictions';

    for (var i = 0; i < stops.length; i++) {
        var class_name = 'stops-icon';

        var marker = L.marker({
            "lat": stops[i].lat,
            "lng": stops[i].lon
        }, {
            icon: L.divIcon({
                className: class_name,
                iconSize: [15, 15],
                iconAnchor: [0, 0]
            }),
            interactive: false,
            clickable: true
        });

        marker.extra = stops[i];
        marker.bindPopup('<div class="stop-loading"><i class="fa fa-circle-o-notch fa-spin"></i><div>', {
            className: 'stop-popup'
        });

        // Requesting stop prediction information here to avoid getting information ahead
        marker.on('click', function (e) {
            var popup = e.target.getPopup();
            popup.setContent('<div class="stop-loading"><i class="fa fa-circle-o-notch fa-spin"></i><div>');
            popup.update();

            console.log(e.target.extra);

            $.get(endPoint, {
                rs: routeId + '|' + e.target.extra.code,
                format: 'json'
            }).done(function (data) {
                var stopInfo = data.predictions[0];
                var prediction = data.predictions[0].dest[0].pred;
                var string = '<div class="stop-popup-content">' +
                        '<div class="popup-header"><h5>' +
                        stopInfo.stopName + ' (' + stopInfo.stopId + ')' +
                    '</h5></div>';
                string += '<div class="popup-body">';
                string += '<strong>Route:</strong> ';
                string += stopInfo.routeShortName + '<br/>';
                string += '<strong>Next Bus:</strong><br/>';
                string += '<ul>';

                for (var pred in prediction) {
                    if (prediction[pred].sec < 60) {
                        string += '<li>Arriving</li>';
                    } else {
                        string += '<li>' + prediction[pred].min + ' mins</li>';
                    }
                }

                string += '</ul>';
                string += '</div>';
                string += '</div>';

                popup.setContent(string);
                popup.update();
            });
        });

        marker.addTo(stopsGroup);
    }

    this.addedRouteStops.push(stopsGroup);
    stopsGroup.addTo(this.activeMap);
};

module.exports.removeRouteStops = function () {
    for (var r in this.addedRouteStops) {
        this.activeMap.removeLayer(this.addedRouteStops[r]);
    }

    this.addedRouteStops = [];
};

module.exports.removeRouteBuses = function () {
    for (var r in this.addedRouteBuses) {
        this.activeMap.removeLayer(this.addedRouteBuses[r]);
    }

    this.addedRouteBuses = [];
};

module.exports.mapRouteStops = function (legs) {
    module.exports.removeRouteStops();

    for (var i = 0; i < legs.length; i++) {
        if (legs[i].mode === 'BUS') {
            module.exports.loadRouteStops(legs[i].routeId,
                                          legs[i].from.stopCode,
                                          legs[i].to.stopCode);
        }
    }
};

module.exports.loadRouteStops = function (routeId, from, to) {
    var endPoint = 'http://api.transitime.org/api/v1/key/5ec0de94/agency/vta/command/routesDetails';

    $.get(endPoint, {
        r: routeId,
        format: 'json'
    }).done(function (data) {
        var route = data.routes[0],
            foundFrom = false, foundTo = false,
            startAdding = false,
            stops = [],
            i = 0;

        // detecting which direction we need to draw
        for (; i < route.directions.length; i++) {
            for (var j = 0; j < route.directions[i].stops.length; j++) {
                if (route.directions[i].stops[j].code + '' === from) {
                    foundFrom = true;
                }
                if (foundFrom === true && route.directions[i].stops[j].code + '' === to) {
                    foundTo = true;
                }
            }
            if (foundFrom && foundTo) {
                break;
            }
            foundFrom = false;
            foundTo = false;
        }

        // limiting number of stops to draw
        for (var s = 0; s < route.directions[i].stops.length; s++) {
            if (route.directions[i].stops[s].code.toString() === from) {
                startAdding = true;
                stops.push(route.directions[i].stops[s]);
            }
            if (startAdding && route.directions[i].stops[s].code.toString() === to) {
                stops.push(route.directions[i].stops[s]);
                startAdding = false;
            }
            if (startAdding) {
                stops.push(route.directions[i].stops[s]);
            }
        }

        module.exports.drawRouteStops(routeId, stops);
        // module.exports.loadRouteBuses(routeId, stops, i);
    });
};

module.exports.findBusInRoute = function (bus, stops, direction) {
    for (var i = 0; i < stops.length; i++) {
        if (stops[i].id === bus.nextStopId && bus.direction === direction) {
            return true;
        }
    }

    return false;
};

module.exports.loadRouteBuses = function (routeId, stops, direction) {
    module.exports.removeRouteBuses();
    var endPoint = 'http://api.transitime.org/api/v1/key/5ec0de94/agency/vta/command/vehiclesDetails';
    direction = direction.toString();

    $.get(endPoint, {
        r: routeId,
        format: 'json'
    }).done(function (data) {
        var buses = data.vehicles,
            validBuses = [];
        for (var i = 0; i < buses.length; i++) {
            if (module.exports.findBusInRoute(buses[i], stops, direction)) {
                validBuses.push(buses[i]);
            }
        }

        console.log(validBuses);
        module.exports.drawRouteBuses(validBuses);
    });
};

module.exports.drawRouteBuses = function (buses) {
    var busesGroup = L.featureGroup();
    var endPoint = 'http://api.transitime.org/api/v1/key/5ec0de94/agency/vta/command/predictions';

    for (var i = 0; i < buses.length; i++) {
        var class_name = 'leaflet-div-bus';

        var marker = L.marker({
            "lat": buses[i].loc.lat,
            "lng": buses[i].loc.lon
        }, {
            icon: L.divIcon({
                className: class_name,
                iconSize: [15, 15],
                iconAnchor: [0, 0]
            }),
            interactive: false,
            clickable: true
        });

        // marker.extra = stops[i];
        // marker.bindPopup('<i class="fa fa-circle-o-notch fa-spin"></i>');

        // Requesting stop prediction information here to avoid getting information ahead
        // marker.on('click', function (e) {
        //     var popup = e.target.getPopup();
        //     popup.setContent('<i class="fa fa-circle-o-notch fa-spin"></i>');
        //     popup.update();

        //     console.log(e.target.extra);

        //     $.get(endPoint, {
        //         rs: routeId + '|' + e.target.extra.code,
        //         format: 'json'
        //     }).done(function (data) {
        //         var stopInfo = data.predictions[0];
        //         var prediction = data.predictions[0].dest[0].pred;
        //         var string = '<div class="stop-popup">' +
        //                 '<div class="popup-header"><h5>' +
        //                 stopInfo.stopName + ' (' + stopInfo.stopId + ')' +
        //             '</h5></div>';
        //         string += '<div class="popup-body">';
        //         string += '<strong>Route:</strong> ';
        //         string += stopInfo.routeShortName + '<br/>';
        //         string += '<strong>Predictions:</strong><br/>';
        //         string += '<ul>';

        //         for (var pred in prediction) {
        //             string += '<li>' + prediction[pred].min + 'mins ' + prediction[pred].sec % 60 + 'secs</li>';
        //         }

        //         string += '</ul>';
        //         string += '</div>';
        //         string += '</div>';

        //         popup.setContent(string);
        //         popup.update();
        //     });
        // });

        marker.addTo(busesGroup);
    }

    this.addedRouteBuses.push(busesGroup);
    busesGroup.addTo(this.activeMap);
    busesGroup.bringToFront();
};
