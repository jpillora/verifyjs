
/* ===================================== *
 * jQuery Extensions
 * ===================================== */

$.fn.scrollView = function(onComplete) {
  
  var field = $(this).first();
  if(field.length === 1) {
    if(field.is(".styled")) field = field.siblings("span");
    $('html, body').animate({
        scrollTop: Math.max(0,field.offset().top - 100)
    }, {
        duration: 1000,
        complete: onComplete || $.noop
    });
  }

  return $(this);
};

$.fn.equals = function(that) {
  if($(this).length !== that.length)
    return false;
  for(var i=0,l=$(this).length;i<l;++i)
    if($(this)[i] !== that[i])
      return false;
  return true;
};

$.Deferred.serialize = function(fns) {
  if(!$.isArray(fns) || fns.length === 0)
    return $.Deferred().resolve().promise();

  var pipeline = fns[0](),
      i = 1, l = fns.length;

  if(!pipeline || !pipeline.pipe)
    throw "Invalid Deferred Object";

  for(;i < l;i++)
    pipeline = pipeline.pipe(fns[i]);

  return pipeline;
};

$.Deferred.parallelize = function(fns) {

  var d = $.Deferred(),
      n = 0, i = 0, l = fns.length,
      rejected = false;

  if(!$.isArray(fns) || l === 0)
    return d.resolve();

  function pass(result) {
    n++;
    if(n === l) d.resolve(result);
  }

  function fail(result) {
    if(rejected) return;
    rejected = true;
    d.reject(result);
  }

  //execute all at once
  for(; i<l; ++i ) {
    var dd = fns[i]();
    if(!dd || !dd.done || !dd.fail)
      throw "Invalid Deferred Object";
    dd.done(pass).fail(fail);
  }
    

  return d.promise();
};