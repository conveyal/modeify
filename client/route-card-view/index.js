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
      var d3_sort_list = [];
      var number = 1;
      var itineration = JSON.parse(localStorage.getItem('itineration'));
      for (var i=0; i<itineration.length;i++) {
          number += 1;
          var class_ = ".iteration-"+i;

          var rec = d3.selectAll(".iteration-"+i);
          var rec_stroke = rec.style("stroke");
          var rec_stroke_width = rec.style("stroke-width");
          var rec_stroke_opacity= rec.style("stroke-opacity");

          var position = number;
           if (i==model.index){
               position = 1;
           }
          var new_dict = {'class_':class_, 'position':position,
                          'rec_stroke':rec_stroke, 'rec_stroke_width':rec_stroke_width,
                          'rec_stroke_opacity':rec_stroke_opacity };
          d3_sort_list.push(new_dict);
      }
      d3_sort_list.sort(function(a, b){return b.position-a.position});

      localStorage.setItem('d3_sort_list', JSON.stringify(d3_sort_list));

      for (var i=0; i<d3_sort_list.length;i++) {
          var r3 = d3.selectAll(".iteration-"+d3_sort_list[i].position);
          if (i != 1){
              r3.transition().duration(500).style("stroke", "#E0E0E0");
          }else{
              r3.style("stroke", d3_sort_list[i].rec_stroke);
              //r3.style("stroke-width", d3_sort_list[i].rec_stroke_width);
              //r3.style("stroke-opacity", d3_sort_list[i].rec_stroke_opacity);
          }

      }

       var rec2 = d3.selectAll(".leaflet-div-icon1");
       rec2.attr('class', 'leaflet-marker-icon leaflet-div-icon2 leaflet-zoom-hide');

  });

  mouseleave(view.el, function() {

  var d3_sort_list = JSON.parse(localStorage.getItem('d3_sort_list'));

   for (var i=0; i<d3_sort_list.length;i++) {

       var rec = d3.selectAll(".iteration-"+i);
       rec.attr('class', 'iteration-'+i);
       rec.style("stroke", d3_sort_list[i].rec_stroke);
       rec.style("stroke-width", d3_sort_list[i].rec_stroke_width);
       rec.style("stroke-opacity", d3_sort_list[i].rec_stroke_opacity);

   }
   var rec2 = d3.selectAll(".leaflet-div-icon2");
   rec2.attr('class', 'leaflet-marker-icon leaflet-div-icon1 leaflet-zoom-hide');

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
