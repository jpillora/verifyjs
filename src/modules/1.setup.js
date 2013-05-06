
var VERSION = "0.0.1",
    cons = $.consoleNoConflict({ prefix: 'verify.js: ' }),
    log  = cons.log,
    warn = cons.warn,
    info = cons.info;



/* ===================================== *
 * Plugin Settings/Variables
 * ===================================== */

var globalOptions = {
  // Display log messages flag
  debug: false,
  // Auto initialise forms (on DOM ready)
  autoInit: true,
  // Attribute used to find validators
  validateAttribute: "data-validate",
  // Name of the event triggering field validation
  validationEventTrigger: "blur",
  // Automatically scroll viewport to the first error
  scroll: true,
  // Focus on the first input
  focusFirstField: true,
  // Hide error while the user is changing
  hideErrorOnChange: false,
  // Whether to skip the hidden fields
  skipHiddenFields: true,
  // Whether to skip the hidden fields
  skipDisabledFields: true,
  // What class name to apply to the 'errorContainer'
  errorClass: "error",
  // Filter method to find element to apply error class
  errorContainer: function (e) {
    return e;
  },
  // Filter method to find element which reskins the current element
  reskinContainer: function (e) {
    return e;
  },
  //Before form-submit hook
  beforeSubmit: function(e, result) {
    return result;
  },
  //tracking method
  track: $.noop,
  //whether to show prompts
  showPrompt: true,
  //prompt method,
  prompt: function(element, text, opts) {
    if($.type($.notify) === 'function') {
      if(!opts) opts = {color: 'red'};
      $.notify(element, text, opts);
    }
  }
};

//option object creator inheriting from globals
function CustomOptions(opts) {
  $.extend(true, this, opts);



}
CustomOptions.prototype = globalOptions;

/* ===================================== *
 * Base Class
 * ===================================== */

var BaseClass = Class.extend({
  name: "Class",
  toString: function() {
    return (this.type ? this.type + ": ":'') +
           (this.name ? this.name + ": ":'');
  },
  log: function() {
    if(!globalOptions.debug) return;
    log.apply(this, Utils.appendArg(arguments, this.toString()));
  },
  warn: function() {
    warn.apply(this, Utils.appendArg(arguments, this.toString()));
  },
  info: function() {
    info.apply(this, Utils.appendArg(arguments, this.toString()));
  },
  bind: function(name) {
    var prop = this[name];
    if(prop && $.isFunction(prop))
        this[name] = Utils.bind(prop,this);
  },
  bindAll: function() {
    for(var propName in this)
      this.bind(propName);
  },
  //enforce asynchronicity
  nextTick: function(fn, args, ms) {
    var _this = this;
    return window.setTimeout(function() {
      fn.apply(_this, args);
    }, ms || 0);
  }
});