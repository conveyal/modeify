module.exports = function(reactive) {
  reactive.bind('reactive', function(el, attr){
    this.change(function(){
      var view = this.reactive.view;
      view.children || (view.children = {});
      var parent = el.parentNode;
      var child = this.value(attr);
      if(!child) return;
      parent.replaceChild(child.el, el);
      view.children[attr] = child;
    });
  });
};