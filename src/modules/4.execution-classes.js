/* ===================================== *
 * Execution Classes
 * ===================================== */

//only exposing two classes
var FormExecution = null,
    FieldExecution = null;

//instantiated inside private scope
(function() {

  var STATUS = {
    NOT_STARTED: 0,
    RUNNING: 1,
    COMPLETE: 2
  };

  //super class
  //set in private scope
  var Execution = BaseClass.extend({

    type: "Execution",

    init: function(element, parent) {
      //corresponding <Form|Fieldset|Field>Element class
      this.element = element;
      if(element) {
        element.execution = this;
        this.options = this.element.options;
        this.domElem = element.domElem;
      }
      //parent Execution class
      this.parent = parent;
      this.name = guid();
      this.status = STATUS.NOT_STARTED;
      this.errorField = null;
      this.errors = [];
      this.bindAll();
    },


    toString: function() {
      return this._super() + (this.element || this.rule).toString();
    },

    //execute in sequence, stop on fail
    serialize: function(executables) {
      this.d = $.Deferred.serialize(
        $.map(executables, function(e) {
          return $.isFunction(e) ? e : e.execute;
        })
      );
      if(!this.d) throw "Invalid executable";
      return this.d.promise();

    },
    //execute all at once,
    parallelize: function(executables) {
      this.d = $.Deferred.parallelize(
        $.map(executables, function(e) {
          return $.isFunction(e) ? e : e.execute;
        })
      );
      if(!this.d) throw "Invalid executable";
      return this.d.promise();
    },

    execute: function() {
      // this.log('execute', true);
      this.status = STATUS.RUNNING;
      if(this.domElem)
        this.domElem.triggerHandler("validating");
    },

    executed: function(exec) {
      this.log(exec.success ? 'Passed' : 'Failed');
      // this.log('done: ' + (exec.rule ? exec.rule.name+': ' : '') + exec.success);
      this.status = STATUS.COMPLETE;
      this.skip = exec.skip;
      this.success = exec.success;
      this.result = exec.result;

      if(this.domElem)
        this.domElem.triggerHandler("validated", arguments);

      //fill the errors array per execution
      if(this.success)
        this.errors.push({domElem: this.element, msg: this.result});
    },

    //resolves or rejects the execution's deferred object 'd'
    resolve: function() {
      return this.resolveOrReject(true);
    },
    reject: function() {
      return this.resolveOrReject(false);
    },
    resolveOrReject: function(resolve) {
      var fn = resolve ? 'resolve' : 'reject';
      if(!this.d || !this.d[fn]) throw "Invalid Deferred Object";
      this.success = !!resolve;
      this.nextTick(this.d[fn], [this], 0);
      return this.d.promise();
    },


    skipValidations: function() {
      //custom-form-elements.js hidden fields
      if(this.element.form.options.skipHiddenFields &&
        ((!this.domElem.hasClass("styled") && this.domElem.is(':hidden')) ||
         (this.domElem.hasClass("styled") && this.domElem.parents(":hidden").length > 0)))
        return true;
      //skip disabled
      if(this.domElem.is('[disabled]'))
        return true;

      return false;
    }

  });

  //set in plugin scope
  FormExecution = Execution.extend({
    type: "FormExecution",

    init: function(form) {
      this._super(form);
      this.ajaxs = [];

      //prepare child executables
      this.children = this.element.fields.map($.proxy(function(f) {
        return new FieldExecution(f, this);
      }, this));
    },

    execute: function() {
      this._super();
      this.log("exec fields #" + this.children.length);
      return this.parallelize(this.children).always(this.executed);
    },

    executed: function(exec) {
      this._super(exec);
    }

  });

  //set in plugin scope
  FieldExecution = Execution.extend({
    type: "FieldExecution",

    init: function(field, parent) {
      this._super(field, parent);
      if(parent instanceof FormExecution)
        this.formExecution = parent;
      this.children = [];
    },

    execute: function() {
      this._super();

      //execute rules
      var ruleParams = ruleManager.parseElement(this.element);
      this.d = null;

      //skip check
      if(this.skipValidations()) {
        this.log("skip");
      } else if(this.options.skipNotRequired && 
                !ruleParams.required &&
                !$.trim(this.domElem.val())) {
        this.log("not required");
      } else if(ruleParams.length === 0) {
        this.log("no validators");
      
      //ready!
      } else {
        this.children = $.map(ruleParams, $.proxy(function(r) {
          if(r.rule.type === 'group')
            return new GroupRuleExecution(r, this);
          else
            return new RuleExecution(r, this);
        }, this));

        // this.log("exec rules #%s", this.children.length);
        this.serialize(this.children);
      }

      //pass when skipping
      this.skip = this.d === null;
      if(this.d === null) {
        this.d = $.Deferred();
        this.resolve();
      }

      this.d.always(this.executed);
      return this.d.promise();
    },

    executed: function(exec) {
      this._super(exec);
      this.element.handleResult(exec);
    }
    
  });

  //set in private scope
  var RuleExecution = Execution.extend({
    type: "RuleExecution",

    init: function(ruleParamObj, parent) {
      this._super(null, parent);

      this.d = $.Deferred();
      this.d.always(this.executed);

      this.rule = ruleParamObj.rule;
      this.args = ruleParamObj.args;
      this.element = this.parent.element;
      this.options = this.element.options;
      this.rObj = {};
    },

    //the function that gets called when
    //rules return or callback
    callback: function(result) {
      clearTimeout(this.t);
      this.callbackCount++;
      // this.log("callback #" + this.callbackCount + " with: " + result);
      if(this.callbackCount > 1) return;

      if(result === undefined)
        this.warn("Undefined result");

      var passed = result === true;

      //success
      if(passed) {
        this.resolve();
      } else {
        this.result = result;
        this.reject();
      }
    },

    timeout: function() {
      this.warn("timeout!");
      this.callback("Timeout");
    },

    execute: function() {
      this._super();
      this.callbackCount = 0;

      //sanity checks
      if(!this.element || !this.rule.ready) {
        this.warn(this.element ? 'not  ready.' : 'invalid parent.');
        return this.resolve();
      }

      this.t = setTimeout(this.timeout, 10000);
      this.r = this.rule.buildInterface(this);
      //finally execute validator

      var result;
      try {
        result = this.rule.fn(this.r);
      } catch(e) {
        this.skip = true;
        result = true;
        console.error("Error caught in validation rule: '" + this.rule.name + "', skipping.\nERROR: " + e.toString() + "\nSTACK:" + e.stack);
      }

      //used return statement
      if(result !== undefined)
        this.nextTick(this.callback, [result]);

      return this.d.promise();
    },

    executed: function(exec) {
      this.transformResult();
      this._super(this);
    },

    //transforms the result from the rule
    //into an array of elems and errors
    transformResult: function() {
      if(typeof this.result === 'string')
        this.result = [{ 
          domElem: this.element.domElem,
          result: this.result
        }];
      else if(!$.isArray(this.result))
        this.result = [{ 
          domElem: this.element.domElem,
          result: null
        }];
    }

  });

  var GroupRuleExecution = RuleExecution.extend({

    type: "GroupRuleExecution",

    init: function(ruleParamObj, parent) {
      this._super(ruleParamObj, parent);
      this.group = ruleParamObj.name;
      this.id = ruleParamObj.id;
      this.scope = ruleParamObj.scope || 'default';
    },

    execute: function() {

      var groupSet = this.element.groups[this.group][this.scope];

      if(!groupSet)
        throw "Missing Group Set";
      if(groupSet.size() === 1)
        this.warn("Group only has 1 field. Consider a field rule.");

      this.getMembers(groupSet);

      this.realExecute = $.proxy(this._super, this);
      return this.parent.formExecution ?
        this.executeAll() :
        this.executeOne();
    },

    //ensures that another execution is a member the group
    isMember: function(that) {
      return that instanceof GroupRuleExecution &&
             this.group === that.group &&
             this.scope === that.scope;
    },

    //gets an array of sibling executions which are ready to be linked
    getMembers: function(groupSet) {
      var ready = true, members = [], _this = this;
      //get all fields in the group
      groupSet.each(function(field) {
        //get field's current execution
        var f = field.execution;
        //no rules to check
        if(!f || !f.children.length)
          ready = false;
        //check child rule execs
        var last = null;
        if(ready)
        $.each(f.children, function(i, rule) {
          if(_this.isMember(rule)) {
            members.push(rule);
            //mark not ready if rule prior was incomplete or failed
            if(last && (last.status !== STATUS.COMPLETE || !last.success)) {
              ready = false;
              return false;
            }
          }
          last = rule;
        });
        //only keep checking if not cancelled
        return ready;
      });

      this.members = ready ? members : null;
    },

    //if run from editing the field
    //only trigger others if each sibling's last execution got up to the group
    executeOne: function(execute) {
      if(this.members)
        return this.realExecute();
      //mark skipped
      this.skip = true;
      return this.reject();
    },

    //if run from the form
    //wait for other fields, cancel if others fail before reaching the group
    executeAll: function() {
      // console.log("ALL");
      if(this.members) {
        // console.log("RUN");
        $.each(this.members, this.linkExec);
        return this.realExecute();
      }
      // console.log("WAIT");
      //not ready - wait for others
      return this.d.promise();
    },

    linkExec: function(i, rule) {
      if(this === rule) return;
      //use the status of this group
      //as the status of each linked
      this.d.done(rule.d.resolve);
      this.d.fail(rule.d.reject);
      //silent fail if one of the linked fields' rules
      //fails prior to reaching the group validation
      rule.parent.d.fail(this.d.reject);
    },

    //override and add an extra
    transformResult: function() {

      if(!this.members)
        return this._super();

      var list = [], exec, i, domElem, result,
          isObj = $.isPlainObject(this.result),
          isStr = (typeof this.result === 'string');

      for(i = 0; i < this.members.length; ++i) {
        exec = this.members[i];

        if(isStr)
          result = (this === exec) ? this.result : null;
        else if(isObj)
          result = this.result[exec.id];

        list.push({
          domElem: exec.element.domElem,
          result: result
        });
      }

      this.result = list;
    }

  });

})(); 