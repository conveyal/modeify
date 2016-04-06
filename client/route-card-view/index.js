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

      var itineration = JSON.parse(localStorage.getItem('itineration'));

      console.log("obj itineration 1 ->", itineration.length);
      var element = [];
      for (var i=0; i<itineration.length;i++) {
           var r3 = d3.selectAll(".iteration-"+i);
           if (i!=model.index){

                r3.transition().duration(500).style("stroke", "#E0E0E0");
                r3.attr("color", "#ffffff");
                //.transition().duration(400).classed("hide-route", true);
                /*
                rec.setAttribute('data-color', function(d){
                    return this.stroke;
                })
                */
                //.transition().duration(400).style("stroke", "#E0E0E0");
                //.style("opacity", 1)
                //.transition().duration(500).style("opacity", 0);
               //.transition().duration(400).style("stroke", "#E0E0E0");
               //.style("opacity", 1)
           }else {
                r3.attr("color", "#000000");
           }
      }

      var todos = d3.selectAll(".iteration-200");
      todos[0].sort(function(a,b){
            console.log("tiene", a ,d3.select(a));
      });



  /*
    showMapView.cleanPolyline();
    showMapView.cleanMarkerpoint();
    showMapView.cleanMarkerCollision();
    showMapView.marker_collision_group = [];

    var sesion_plan = JSON.parse(localStorage.getItem('dataplan'));
    sesion_plan = sesion_plan.plan;

     var index_ = model.index;
     var stroke;
     var itineraries = sesion_plan.itineraries;
      for (var i= 0; i < itineraries.length; i++) {
          if (i != index_){
            stroke = {'stroke':true, 'class_name':true}
          }else{
            stroke = {'stroke':false, 'class_name':false}
          }
          for (var j=0; j < itineraries[i].legs.length; j++) {
             showMapView.drawRouteAmigo(itineraries[i].legs[j], itineraries[i].legs[j].mode, stroke);
          }
      }
      showMapView.drawMakerCollision();
    */
  });

  mouseleave(view.el, function() {

  var itineration = JSON.parse(localStorage.getItem('itineration'));
   console.log("obj itineration 2->", itineration.length);
   for (var i=0; i<itineration.length;i++) {


        if (i!=model.index){

            var element = d3.selectAll(".iteration-"+i)
            .transition().duration(500)
            .style('stroke', function(d){
                    return this.stroke;
                });

            console.log(element);
            /*
                d3.selectAll(".iteration-"+i).transition()
                .attr('stroke', function(d){
                    console.log(this);
                    return this["data-color"];
                });
                */
                //.transition().duration(500).style("opacity", 1);
                //.style("opacity", 0)
               //.transition().duration(400).style("stroke", "#E0E0E0");
               //.style("opacity", 0)
        }
   }
  /*
    if (!view.el.classList.contains('expanded')) {
      showMapView.cleanPolyline();
      showMapView.cleanMarkerpoint();
      showMapView.cleanMarkerCollision();
      showMapView.marker_collision_group = [];

      var option_draw = {'stroke':false, 'class_name':false};
      var sesion_plan = JSON.parse(localStorage.getItem('dataplan'));
      sesion_plan = sesion_plan.plan;
      var itineraries = sesion_plan.itineraries;
      for (i = 0; i < itineraries.length; i++) {
          for (ii=0; ii < itineraries[i].legs.length; ii++) {
            showMapView.drawRouteAmigo(itineraries[i].legs[ii], itineraries[i].legs[ii].mode, option_draw);
          }
      }
      showMapView.drawMakerCollision();

    }
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
