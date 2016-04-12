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
//var transitive = require('transitive');
var view = require('view');
var showMapView = require('map-view');
/**
 * Expose `View`
 */

var View = module.exports = view(require('./template.html'), function(view, model) {
  mouseenter(view.el, function() {
      showMapView.cleanMarkerCollision();
      showMapView.drawItinerationMakerCollision(model.index);
      var itineration = JSON.parse(localStorage.getItem('itineration'));
      for (var i=0; i<itineration.length;i++) {
           var r3 = d3.selectAll(".iteration-"+i);
           if (i!=model.index){
                r3.transition().duration(600).style("stroke", "#E0E0E0");
                r3.attr("data-show","0");

              var rec2 = d3.selectAll(".circle-fade-"+i);
              rec2.attr('class', 'leaflet-marker-icon leaflet-div-icon2 circle-fade-'+i+ ' leaflet-zoom-hide');
           }else {
                r3.attr("data-show","1");
           }
      }

      var orden = 0;
      d3.selectAll(".iteration-200").each(function(e){
            var element = d3.select(this);
            var parent = d3.select(element.node().parentNode);
            parent.attr("class", "g-element");
            parent.attr("data-orden", orden.toString());
            if (Boolean(parseInt(element.attr("data-show")))) {
                parent.attr("data-show", "1");
            }else {
                parent.attr("data-show", "0");
            }

            orden++;
      });


      d3.selectAll(".g-element").each(function(a,b){
            if (Boolean(parseInt(d3.select(this).attr("data-show")))) {
                d3.select(this).node().parentNode.appendChild(this);
            }

      });
  });

  mouseleave(view.el, function() {

        var layer_ordenados = [];
        d3.selectAll(".g-element").each(function(a,b){
            var orden = parseInt(d3.select(this).attr("data-orden"));
            layer_ordenados[orden] = this;

        });

        for (i in layer_ordenados) {
            var element = d3.select(layer_ordenados[i]);
            var child = element.select("path");
            element.attr("data-show", "0");

            child.transition().duration(600).style("stroke",function(i,v){
                    console.log("d3 select ->" , d3.select(this));
                    return d3.select(this).attr("stroke");

            });
            child.attr("data-show", "0");

            element.node().parentNode.appendChild(layer_ordenados[i]);

        }
    /*
   showMapView.cleanPolyline();
   showMapView.cleanMarkerpoint();
   showMapView.cleanMarkerCollision();

    var sesion_plan = JSON.parse(localStorage.getItem('dataplan'));
    sesion_plan = sesion_plan.plan;

     var itineraries = sesion_plan.itineraries;
      for (var i= 0; i < itineraries.length; i++) {

          for (var j=0; j < itineraries[i].legs.length; j++) {
             showMapView.drawRouteAmigo(itineraries[i].legs[j], itineraries[i].legs[j].mode, i);
          }
      }
      showMapView.drawMakerCollision();
        */
  });
});

View.prototype.calculator = function() {
  return new Calculator(this.model);
};

View.prototype.directions = function() {
  return new RouteDirections(this.model);
};

View.prototype.segments = function() {
  return routeSummarySegments(this.model);
};

View.prototype.costSavings = function() {
  return convert.roundNumberToString(this.model.costSavings());
};

View.prototype.timeSavingsAndNoCostSavings = function() {
  return this.model.timeSavings() && !this.model.costSavings();
};

/**
 * Show/hide
 */

View.prototype.showDetails = function(e) {
  e.preventDefault();
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
};

View.prototype.hideDetails = function(e) {
  e.preventDefault();
  var list = this.el.classList;
  if (list.contains('expanded')) {
    list.remove('expanded');
  }
};

/**
 * Get the option number for display purposes (1-based)
 */

View.prototype.optionNumber = function() {
  return this.model.index + 1;
};

/**
 * View
 */

View.prototype.feedback = function(e) {
  e.preventDefault();
  Feedback(this.model).show();
};

/**
 * Select this option
 */

View.prototype.selectOption = function() {
  var route = this.model;
  var plan = session.plan();
  var tags = route.tags(plan);

  analytics.send_ga({
    category: 'route-card',
    action: 'select route',
    label: JSON.stringify(tags),
    value: 1
  });
  routeResource.findByTags(tags, function(err, resources) {
    var routeModal = new RouteModal(route, null, {
      context: 'route-card',
      resources: resources
    });
    routeModal.show();
    routeModal.on('next', function() {
      routeModal.hide();
    });
  });
};
