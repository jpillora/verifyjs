  //set in private scope
  var GroupExecution = Execution.extend({
    type: "GroupExecution",

    init: function(fieldset, parent) {
      this._super(fieldset, parent);
    },

    execute: function() {
      this._super();

      if(this.skipValidations())
        return $.Deferred().always(this.executed).resolve().promise();

      this.log('getting group rules');
      var ruleParams = getElementRulesAndParams(this.element);

      //map group rules into before/after groups
      var ruleExes = $.map(ruleParams, $.proxy(function(r) {
        return new RuleExecution(r, this);
      },this));

      this.beforeRules = [];
      this.afterRules = [];

      for(var i = 0, l = ruleExes.length; i<l; ++i){
        var ruleExe = ruleExes[i];
        if(ruleExe.rule.userObj &&
           ruleExe.rule.userObj.run === 'after')
          this.afterRules.push(ruleExe);
        else
          this.beforeRules.push(ruleExe);
      }

      //decide which fields to include
      //in this group execution
      if(this.parent instanceof FieldExecution &&
         this.afterRules.length === 0) {
        //if executed from a field and there are no 'after' rules
        //only validate the one field
        var field = this.parent;
        field.group = this;
        this.fields = [field];
      } else {
        //if executed from a form or there are 'after' rules
        //validate all fields in the group (fieldset)
        this.fields = this.element.fields.map($.proxy(function(f) {
          return new FieldExecution(f, this);
        },this));
      }

      this.log("exec");

      var executables = [];

      if(this.beforeRules.length > 0)
        executables.push(this.execBefore);

      executables.push(this.execFields);

      if(this.afterRules.length > 0)
        executables.push(this.execAfter);

      //execute in 3 stages
      return this.serialize(executables).always(this.executed);
    },

    //group validators
    execBefore: function() {
      this.log("before rules #%s", this.beforeRules.length);
      return this.serialize(this.beforeRules).always(this.executedBefore);
    },

    //field validators
    execFields: function() {
      this.log("exec fields #%s", this.fields.length);
      return this.parallelize(this.fields).always(this.executedFields);
    },

    //more group validators
    execAfter: function() {
      this.log("after rules #%s", this.afterRules.length);
      return this.serialize(this.afterRules).always(this.executedAfter);
    },

    executedBefore: function(result) {
      this.executedBeforeAfter(result);
    },

    executedFields: function(result) {
    },

    executedAfter: function(result) {
      this.executedBeforeAfter(result);
    },

    executedBeforeAfter: function(result) {

      var errored = !!result;
      var opts = this.element.form.options;

      
      this.element.fields.each(function(f) {
        opts.prompt(f.elem, false);
        if(opts.errorClass)
          opts.errorContainer(f.elem)
            .toggleClass(opts.errorClass, errored);
      });

      var elem = this.triggerField();
      if(!elem) elem = this.element.fields.array[0] && this.element.fields.array[0].elem;
      if(elem) opts.prompt(elem, result);

      if(this.parent instanceof FieldExecution)
        this.parent.element.options.track(
          'Validate Group',
          this.parent.element.name + ';' +
            (this.domElem.attr(opts.validateAttribute) || 'non_group'),
          errored ? result : 'Valid',
          errored ? 0 : 1
        );
    },

    executed: function(result) {
      this._super();
      var errored = !!result;
    },

    triggerField: function() {
      if(this.parent instanceof FieldExecution)
        return this.parent.domElem;
      return null;
    }

  });


  
  /* ===================================== *
   * Field Set Wrapper
   * ===================================== */

  var ValidationGroup = ValidationElement.extend({

    //class/default variables
    type: "ValidationGroup",
    nongroup: false,

    init: function(elem, form) {

      //elem is allowed to be an empty selector
      //represents a 'no_group' set - the set of individual fields

      this._super(elem);
      //sanity checks
      if(!elem || !elem.jquery)
        return;

      if(!elem.length) {
        this.nongroup = true;
        this.name += "_nongroup";
      }

      this.form = form;
      this.options = form.options;
      this.fields = new TypedSet(ValidationField);
    }
  });