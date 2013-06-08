/* ===================================== *
 * Validation Classes
 * ===================================== */

var ValidationForm = null;
(function() {

  /* ===================================== *
   * Element Super Class
   * ===================================== */

  var ValidationElement = BaseClass.extend({

    type: "ValidationElement",
    init: function(domElem) {

      if(!domElem || !domElem.length)
        throw "Missing Element";

      this.domElem = domElem;
      this.bindAll();
      this.name = this.domElem.attr('name') ||
                  this.domElem.attr('id') ||
                  guid();
      this.execution = null;

      if(domElem.data('verify'))
        return false;

      domElem.data('verify',this);
      return true;
    },

    equals: function(that) {
      var e1, e2;

      if( this.domElem )
        e1 = this.domElem;
      else
        return false;

      if( that.jquery )
        e2 = that;
      else if( that instanceof ValidationElement && that.domElem )
        e2 = that.domElem;

      if(e1 && e2)
        return e1.equals(e2);

      return false;
    }

  });

  /* ===================================== *
   * Field Wrapper
   * ===================================== */

  var ValidationField = ValidationElement.extend({

    //class variables
    type: "ValidationField",
    init: function(domElem, form) {

      this._super(domElem);

      //instance variables
      this.form = form;
      this.options = form.options;
      this.groups = form.groups;
      this.ruleNames = null;
      this.touched = false;
    },

    //for use with $(field).validate(callback);
    validate: function(callback) {
      if(!callback) callback = $.noop;

      var exec = new FieldExecution(this);

      exec.execute().done(function() {
        callback(true);
      }).fail(function() {
        callback(false);
      });
      return;
    },

    update: function() {
      this.rules = ruleManager.parseElement(this);

      //manage this field within shared groups
      for(var i = 0; i < this.rules.length; ++i) {
        var r = this.rules[i];
        //skip uninitialised and field rules
        if(!r.rule) continue;
        if(r.rule.type !== 'group') continue;
        //shared groups map
        if(!this.groups[r.name])
          this.groups[r.name] = {};
        //calculate scope
        var scope = r.scope || 'default';
        if(!this.groups[r.name][scope])
          this.groups[r.name][scope] = new TypedSet(ValidationField);
        //add self to group
        this.groups[r.name][scope].add(this);
      }

    },

    handleResult: function(exec) {

      var opts = this.options,
          reskinElem = opts.reskinContainer(this.domElem);

      if(!reskinElem || !reskinElem.length)
        return this.warn("No reskin element found. Check 'reskinContainer' option.");

      //handle first error
      // if(!exec.success &&
      //    exec.parent.type === 'FormExecution' &&
      //    !exec.parent.handledError) {
      //   exec.parent.handledError = true;
      //   this.scrollFocus(reskinElem);
      // }

      //show prompt
      if(opts.showPrompt)
        opts.prompt(reskinElem, exec.response);

      //toggle error classes
      var container = opts.errorContainer(reskinElem);
      if(container && container.length)
        container.toggleClass(opts.errorClass, !exec.success);

      //track event
      this.options.track(
        'Validate',
        [this.form.name,this.name].join(' '),
        exec.success ? 'Valid' : exec.response ? '"'+exec.response+'"' : 'Silent Fail'
      );
    },

    //listening for 'validate' event
    scrollFocus: function(reskinElem) {

      var callback = $.noop;
      if(this.options.focusFirstField)
        callback = function() {
          reskinElem.focus();
        };

      if (this.options.scroll)
        reskinElem.verifyScrollView(callback);
      else if(this.options.focusFirstField)
        field.focus();
    }

  });

  /* ===================================== *
   * Form Wrapper
   * ===================================== */

  ValidationForm = ValidationElement.extend({

    /* ===================================== *
     * Instance variables
     * ===================================== */
    type: "ValidationForm",

    init: function(domElem, options) {
      //sanity checks
      this._super(domElem);

      if(!domElem.is("form"))
        throw "Must be a form";

      this.options = new CustomOptions(options);

      this.fields = new TypedSet(ValidationField);
      this.groups = {};
      this.fieldByName = {};
      this.invalidFields = {};
      this.fieldHistory = {};
      this.submitResult = undefined;
      this.submitPending = false;
      this.cache = {
        ruleNames: {},
        ajax: { loading: {}, loaded: {} }
      };

      $(document).ready(this.domReady);
    },

    extendOptions: function(opts) {
      $.extend(true, this.options, opts);
    },

    domReady: function() {
      this.bindEvents();
      this.updateFields();
      this.log("bound to " + this.fields.size() + " elems");
    },

    bindEvents: function() {
      this.domElem
        .on("keyup.jqv", "input", this.onKeyup)
        .on("blur.jqv", "input[type=text]:not(.hasDatepicker),input:not([type].hasDatepicker)", this.onValidate)
        .on("change.jqv", "input[type=text].hasDatepicker,select,[type=checkbox],[type=radio]", this.onValidate)
        .on("submit.jqv", this.onSubmit)
        .trigger("initialised.jqv");
    },

    unbindEvents: function() {
      this.domElem.off(".jqv");
    },

    updateFields: function() {
      var sel = "["+this.options.validateAttribute+"]";
      this.domElem.find(sel).each(this.updateField);
    },

    //creates new validation elements
    //adds them to the form
    updateField: function(i, domElem) {
      if(i.jquery !== undefined) domElem = i;
      if(domElem.jquery === undefined)
        domElem = $(domElem);

      var fieldSelector = "input:not([type=hidden]),select,textarea",
          field, fieldElem;

      if(!domElem.is(fieldSelector))
        return this.warn("Validators will not work on container elements ("+domElem.prop('tagName')+"). Please use INPUT, SELECT or TEXTAREA.");

      fieldElem = domElem;

      field = this.fields.find(fieldElem);

      if(!field) {
        field = new ValidationField(fieldElem, this);
        this.fields.add(field);
      }

      field.update();

      return field;
    },

    /* ===================================== *
     * Event Handlers
     * ===================================== */

    onSubmit: function(event) {

      var submitForm = false;

      if(this.submitPending)
        this.warn("pending...");

      //no result -> begin
      if(!this.submitPending &&
          this.submitResult === undefined) {

        this.submitPending = true;
        this.validate(this.doSubmit);

      //have result
      } else if (this.submitResult !== undefined) {
        submitForm = this.options.beforeSubmit.call(this.domElem, event, this.submitResult);
      }

      if(!submitForm) event.preventDefault();
      return submitForm;
    },

    doSubmit: function(success) {
      this.log('doSubmit', success);
      this.submitPending = false;
      this.submitResult = success;
      this.domElem.submit(); //trigger onSubmit, though with a result
      this.submitResult = undefined;
    },

    onKeyup: function(event) {
      if(this.options.hideErrorOnChange)
        this.options.prompt($(event.currentTarget), null);
    },

    //user triggered validate field event
    onValidate: function(event) {
      var domElem = $(event.currentTarget);
      var field = domElem.data('verify') || this.updateField(domElem);
      field.log("validate");
      field.validate($.noop);
    },

    /* ===================================== *
     * Validate Form
     * ===================================== */

    validate: function(callback) {
      if(!callback) callback = $.noop;

      this.updateFields();

      var exec = new FormExecution(this);

      exec.execute().done(function() {
        callback(true);
      }).fail(function() {
        callback(false);
      });
      return;
    }
  });

})();