
/* ===================================== *
 * jQuery Extensions
 * ===================================== */

$.fn.verifyScrollView = function(onComplete) {
  var field = $(this).first();
  if(field.length !== 1) return $(this);
  return $(this).verifyScrollTo(field, onComplete);
};

$.fn.verifyScrollTo = function( target, options, callback ){
  if(typeof options == 'function' && arguments.length == 2){ callback = options; options = target; }
  var settings = $.extend({
    scrollTarget  : target,
    offsetTop     : 50,
    duration      : 500,
    easing        : 'swing'
  }, options);
  return this.each(function(){
    var scrollPane = $(this);
    var scrollTarget = (typeof settings.scrollTarget == "number") ? settings.scrollTarget : $(settings.scrollTarget);
    var scrollY = (typeof scrollTarget == "number") ? scrollTarget : scrollTarget.offset().top + scrollPane.scrollTop() - parseInt(settings.offsetTop, 10);
    scrollPane.animate({scrollTop : scrollY }, parseInt(settings.duration, 10), settings.easing, function(){
      if (typeof callback == 'function') { callback.call(this); }
    });
  });
};

$.fn.equals = function(that) {
  if($(this).length !== that.length)
    return false;
  for(var i=0,l=$(this).length;i<l;++i)
    if($(this)[i] !== that[i])
      return false;
  return true;
};

