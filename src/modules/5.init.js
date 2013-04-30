
/* ===================================== *
 * Plugin Public Interface
 * ===================================== */

$.fn.validate = function(callback) {
  var validator = $(this).data('verify');
  if(validator)
    validator.validate(callback);
  else
    warn("element does not have verifyjs attached");
};

$.fn.validate.version = VERSION;

$.fn.verify = function(userOptions) {
  return this.each(function() {

    //get existing form class this element
    var form = $.verify.forms.find($(this));

    //unbind and destroy form
    if(userOptions === false || userOptions === "destroy") {
      if(form) {
        form.unbindEvents();
        $.verify.forms.remove(form);
      }
      return;
    }

    Utils.checkOptions(userOptions);
    if(form) {
      form.extendOptions(userOptions);
      form.updateFields();
    } else {
      form = new ValidationForm($(this), userOptions);
      $.verify.forms.add(form);
    }

  });
};

$.verify = function(options) {
  Utils.checkOptions(options);
  $.extend(globalOptions, options);
};

$.extend($.verify, {
  version: VERSION,
  updateRules: ruleManager.updateRules,
  addRules: ruleManager.addFieldRules,
  addFieldRules: ruleManager.addFieldRules,
  addGroupRules: ruleManager.addGroupRules,
  log: info,
  warn: warn,
  defaults: globalOptions,
  globals: globalOptions,
  utils: Utils,
  forms: new TypedSet(ValidationForm, [], "FormSet"),
  _hidden: {
    ruleManager: ruleManager
  }
});

/* ===================================== *
 * Auto attach on DOM ready
 * ===================================== */

$(function() {
  if(globalOptions.autoInit)
  $("form").filter(function() {
    return $(this).find("[" + globalOptions.validateAttribute + "]").length > 0;
  }).verify();
});

log("plugin added.");

