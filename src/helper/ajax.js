/* ===================================== *
 * Ajax Helper Class
 * ===================================== */

//plugin wide ajax cache
var ajaxCache = { loading: {}, loaded: {} } ;

//callable from user defined rules. alias: r.ajax
function ajaxHelper(userOpts, r) {

  var defaults = {
        method: "GET",
        timeout: 15 * 1000
      },
      exec = r._exec,
      promptContainer = exec.type === "GroupRuleExecution" ?
          exec.element.domElem :
          r.field,
      userSuccess = userOpts.success,
      userError   = userOpts.error,
      options = exec.element.options,
      serialised = JSON ? JSON.stringify(userOpts) : guid();

  function onErrorDefault(e) {
    log("ajax error");
    r.callback("There has been an error");
  }

  var userCallbacks = {
    success: userSuccess,
    error: userError || onErrorDefault
  };

  //already completed
  if(ajaxCache.loaded[serialised]) {

    var args = ajaxCache.loaded[serialised],
        success = userCallbacks.success;

    success.apply(r, args);
    return;
  }

  //this request is in progress,
  //store callbacks for when first request completes
  if(!ajaxCache.loading[serialised])
    ajaxCache.loading[serialised] = [];
  ajaxCache.loading[serialised].push(userCallbacks);

  if(ajaxCache.loading[serialised].length !== 1) return;

  options.prompt(promptContainer, "Checking...", "load");

  function intercept() {
    options.prompt(promptContainer, false);

    var reqs = ajaxCache.loading[serialised];
    while(reqs.length)
      reqs.pop().success.apply(r,arguments);

    ajaxCache.loaded[serialised] = arguments;
  }

  var realCallbacks = {
    success: intercept,
    error: intercept
  };

  exec.ajax = $.ajax($.extend(defaults, userOpts, realCallbacks));
}
