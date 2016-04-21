var analytics = require('analytics');
var d3 = require('d3');
var convert = require('convert');
var Feedback = require('feedback-modal');
var mouseenter = require('mouseenter');
var mouseleave = require('mouseleave');
var Calculator = require('route-cost-calculator');
var RouteDirections = require('route-directions-table');
var RouteModal = require('route-modal');
var routeSummarySegments = require('route-summary-segments');
var routeResource = require('route-resource');
var session = require('session');
var optionsView = require('options-view');
//var transitive = require('transitive');
var view = require('view');
var mapView = require('map-view');
/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function (view, model) {
    view.isSelected = false;
    view.mouseenter = function () {
        if (optionsView.lastCardSelected && optionsView.lastCardSelected.model.index !== view.model.index) {
            return;
        }
        clearTimeout();
        var itineration = JSON.parse(localStorage.getItem('itineration'));
        for (var i = 0; i < itineration.length; i++) {
            var r3 = d3.selectAll(".iteration-" + i);
            if (i != model.index) {
                r3.transition().duration(500).style("stroke", "#E0E0E0");
                r3.attr("data-show", "0");

                var rec2 = d3.selectAll(".circle-fade-" + i);
                rec2.attr('class', 'leaflet-marker-icon leaflet-div-icon2 circle-fade-' + i + ' leaflet-zoom-hide');
            } else {
                r3.attr("data-show", "1");
            }
        }

        var orden = 0;
        d3.selectAll(".iteration-200").each(function (e) {
            var element = d3.select(this);
            var parent = d3.select(element.node().parentNode);
            parent.attr("class", "g-element");
            parent.attr("data-orden", orden.toString());
            if (Boolean(parseInt(element.attr("data-show")))) {
                parent.attr("data-show", "1");
            } else {
                parent.attr("data-show", "0");
            }

            orden++;
        });


        d3.selectAll(".g-element").each(function (a, b) {
            if (Boolean(parseInt(d3.select(this).attr("data-show")))) {
                d3.select(this).node().parentNode.appendChild(this);
            }
        });
    };

    mouseenter(view.el, view.mouseenter);

    view.mouseleave = function () {
        if (view.isSelected) {
            return;
        }

        if (optionsView.lastCardSelected && optionsView.lastCardSelected.model.index !== view.model.index) {
            return;
        }

        var itineration = JSON.parse(localStorage.getItem('itineration'));
        for (var i = 0; i < itineration.length; i++) {
            var rec2 = d3.selectAll(".circle-fade-" + i);
            rec2.attr('class', 'leaflet-marker-icon leaflet-div-icon1 circle-fade-' + i + ' leaflet-zoom-hide');
        }

        var layer_ordenados = [];
        d3.selectAll(".g-element").each(function (a, b) {
            var orden = parseInt(d3.select(this).attr("data-orden"));
            layer_ordenados[orden] = this;

        });

        for (i in layer_ordenados) {
            var element = d3.select(layer_ordenados[i]);
            var child = element.select("path");
            element.attr("data-show", "1");

            child.transition().duration(500).style("stroke", function (i, v) {
                return d3.select(this).attr("stroke");

            });
            child.attr("data-show", "1");
            setTimeout(function () {
                element.node().parentNode.appendChild(layer_ordenados[i]);
            }, 500);
        }
    };
    mouseleave(view.el, view.mouseleave);
});

View.prototype.calculator = function () {
    return new Calculator(this.model);
};

View.prototype.directions = function () {
    return new RouteDirections(this.model);
};

View.prototype.segments = function () {
    return routeSummarySegments(this.model);
};

View.prototype.costSavings = function () {
    return convert.roundNumberToString(this.model.costSavings());
};

View.prototype.timeSavingsAndNoCostSavings = function () {
    return this.model.timeSavings() && !this.model.costSavings();
};

View.prototype.selectRoute = function (e) {
    var el = $(e.target).closest('li'),
        routes = $(el).closest('ul').find('li');
    e.preventDefault();

    if ($(routes).hasClass('route-selected')) {
        this.mouseleave();
    }

    if ($(el).hasClass('route-selected')) {
        $(el).removeClass('route-selected');
    } else {
        $(routes).removeClass('route-selected');
        $(el).addClass('route-selected');
        this.mouseenter();
    }
};

/**
 * Show/hide
 */

View.prototype.showDetails = function (e) {
    if (optionsView.lastCardSelected && optionsView.lastCardSelected.model.index !== this.model.index) {
        optionsView.lastCardSelected.isSelected = false;
        optionsView.lastCardSelected.mouseleave();
        optionsView.lastCardSelected.hideDetails(e);
        this.mouseenter();
    }

    var _this = this;
    optionsView.lastCardSelected = _this;

    e.preventDefault();
    mapView.removeRouteStops();
    var el = this.el;
    var expanded = document.querySelector('.option.expanded');
    if (expanded) expanded.classList.remove('expanded');

    el.classList.add('expanded');

    analytics.track('Expanded Route Details', {
        plan: session.plan().generateQuery(),
        route: {
            modes: this.model.modes(),
            summary: this.model.summary()
        }
    });

    var scrollable = document.querySelector('.scrollable');
    scrollable.scrollTop = el.offsetTop - 52;

    this.isSelected = true;
    console.log(this);
    mapView.mapRouteStops(this.model.attrs.plan.legs);
    mapView.activeMap.on('zoomend', function () {
        if (optionsView.lastCardSelected) {
            setTimeout(function () {
                optionsView.lastCardSelected.mouseenter();
            }, 0);
        }
    });
};

View.prototype.hideDetails = function (e) {
    optionsView.lastCardSelected = null;
    e.preventDefault();
    var list = this.el.classList;
    if (list.contains('expanded')) {
        list.remove('expanded');
    }

    this.isSelected = false;
    mapView.removeRouteStops();
};

/**
 * Get the option number for display purposes (1-based)
 */

View.prototype.optionNumber = function () {
    return this.model.index + 1;
};

/**
 * View
 */

View.prototype.feedback = function (e) {
    e.preventDefault();
    Feedback(this.model).show();
};

/**
 * Select this option
 */

View.prototype.selectOption = function () {
    var route = this.model;
    var plan = session.plan();
    var tags = route.tags(plan);

    analytics.send_ga({
        category: 'route-card',
        action: 'select route',
        label: JSON.stringify(tags),
        value: 1
    });
    routeResource.findByTags(tags, function (err, resources) {
        var routeModal = new RouteModal(route, null, {
            context: 'route-card',
            resources: resources
        });
        routeModal.show();
        routeModal.on('next', function () {
            routeModal.hide();
        });
    });
};
