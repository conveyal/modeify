module.exports = function(reactive) {
  reactive.bind('data-disabled', function(el, attr){
    this.change(function(){
      if(this.value(attr)) {
        el.setAttribute('disabled', true);
      }
      else {
        el.removeAttribute('disabled');
      }
    });
  });
};