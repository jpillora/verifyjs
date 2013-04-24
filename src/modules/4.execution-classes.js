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
      //corresponding <Form|Field>Element class
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

      //deferred object
      this.d = this.restrictDeferred();
      this.d.always(this.executed);
    },

    toString: function() {
      return this._super() + (this.element || this.rule).toString();
    },

    //execute in sequence, stop on fail
    serialize: function(objs) {

      var fns = this.mapExecutables(objs);

      if(!$.isArray(fns) || fns.length === 0)
        return this.resolve();

      var pipeline = fns[0](),
          i = 1, l = fns.length;

      this.log("SERIALIZE", l);

      if(!pipeline || !pipeline.pipe)
        throw "Invalid Deferred Object";

      for(;i < l;i++)
        pipeline = pipeline.pipe(fns[i]);

      //link pipeline
      pipeline.done(this.resolve).fail(this.reject);

      return this.d.promise();
    },

    //execute all at once,
    parallelize: function(objs) {

      var fns = this.mapExecutables(objs);

      var _this = this,
          n = 0, i = 0, l = fns.length,
          rejected = false;

      this.log("PARALLELIZE", l);

      if(!$.isArray(fns) || l === 0)
        return this.resolve();

      function pass(result) {
        n++;
        if(n === l) _this.resolve(result);
      }

      function fail(result) {
        if(rejected) return;
        rejected = true;
        _this.reject(result);
      }

      //execute all at once
      for(; i<l; ++i ) {
        var dd = fns[i]();
        if(!dd || !dd.done || !dd.fail)
          throw "Invalid Deferred Object";
        dd.done(pass).fail(fail);
      }

      return this.d.promise();
    },

    mapExecutables: function(objs) {
      return $.map(objs, function(o) {
        if($.isFunction(o)) return o;
        if($.isFunction(o.execute)) return o.execute;
        throw "Invalid executable";
      });
    },

    execute: function() {

      var p = this.parent,
          ps = [];
      while(p) {
        ps.push(p.name);
        p = p.parent;
      }
      var gap = "(" + ps.join(' < ') + ")";

      this.log(this.parent ? gap : '', 'executing...');
      this.status = STATUS.RUNNING;
      if(this.domElem)
        this.domElem.triggerHandler("validating");
    },

    executed: function(exec) {
      this.status = STATUS.COMPLETE;

      if(exec) {
        this.skip = exec.skip;
        this.success = exec.success;
        this.result = exec.result;
        this.log(exec.success ? 'Passed' : 'Failed', this.result);
      } else {
        this.log('Did not execute');
        this.success = true;
      }

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
      var fn = resolve ? '__resolve' : '__reject';
      if(!this.d || !this.d[fn]) throw "Invalid Deferred Object";
      this.success = !!resolve;
      this.nextTick(this.d[fn], [this], 0);
      return this.d.promise();
    },
    restrictDeferred: function(d) {
      if(!d) d = $.Deferred();
      d.__reject = d.reject;
      d.__resolve = d.resolve;
      d.reject = d.resolve = function() {
        console.error("Use execution.resolve|reject()");
      };
      return d;
    },


    skipValidations: function() {
      //custom-form-elements.js hidden fields
      if(this.element.form.options.skipHiddenFields &&
         this.element.reskinElem.is(':hidden'))
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
      return this.parallelize(this.children);
    }

  });

  //set in plugin scope
  FieldExecution = Execution.extend({
    type: "FieldExecution",

    init: function(field, parent) {
      this._super(field, parent);
      if(parent instanceof FormExecution)
        this.formExecution = parent;
      field.touched = true;
      this.children = [];
    },

    execute: function() {
      this._super();

      //execute rules
      var ruleParams = ruleManager.parseElement(this.element);

      this.skip = true;

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
        this.skip = false;
        this.children = $.map(ruleParams, $.proxy(function(r) {
          if(r.rule.type === 'group')
            return new GroupRuleExecution(r, this);
          else
            return new RuleExecution(r, this);
        }, this));

        // this.log("exec rules #%s", this.children.length);
        this.serialize(this.children);
      }

      if(this.skip) return this.resolve();

      return this.d.promise();
    },

    executed: function(exec) {
      this._super(exec);
      // if(exec.result !== undefined)
      this.element.handleResult(exec);
    }

  });

  //set in private scope
  var RuleExecution = Execution.extend({
    type: "RuleExecution",

    init: function(ruleParamObj, parent) {
      this._super(null, parent);

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
      this.log(this.rule.name + " (cb#" + this.callbackCount + "): " + result);
      if(this.callbackCount > 1) return;

      if(result === undefined)
        this.warn("Undefined result");

      this.result = result;

      var passed = result === true;

      //success
      if(passed)
        this.resolve();
      else
        this.reject();

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
        console.error("Error caught in validation rule: '" + this.rule.name +
                      "', skipping.\nERROR: " + e.toString() + "\nSTACK:" + e.stack);
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
          domElem: this.element.reskinElem,
          result: this.result
        }];
      else if(!$.isArray(this.result))
        this.result = [{
          domElem: this.element.reskinElem,
          result: null
        }];
    }

  });

  var GroupRuleExecution = RuleExecution.extend({

    type: "GroupRuleExecution",

    init: function(ruleParamObj, parent) {
      this._super(ruleParamObj, parent);
      this.groupName = ruleParamObj.name;
      this.id = ruleParamObj.id;
      this.scope = ruleParamObj.scope || 'default';
      this.group = this.element.groups[this.groupName][this.scope];
      if(!this.group)
        throw "Missing Group Set";
      if(this.group.size() === 1)
        this.warn("Group only has 1 field. Consider a field rule.");
    },

    execute: function() {

      var sharedExec = this.group.exec,
          parentExec = this.parent,
          originExec = parentExec && parentExec.parent,
          groupOrigin = originExec instanceof GroupRuleExecution,
          fieldOrigin = !originExec,
          formOrigin = originExec instanceof FormExecution,
          _this = this, i, j, field, exec, child;

      if(!sharedExec || sharedExec.status === STATUS.COMPLETE) {
        this.log("MASTER")
        this.members = [this];
        this.executeGroup = this._super;
        sharedExec = this.group.exec = this;
      } else {
        this.log("SLAVE (", sharedExec.name, ")")
        this.linkExec(sharedExec);
        this.members = sharedExec.members;
        this.members.push(this);
      }

      if(fieldOrigin)
      for(i = 0; i < this.group.size(); ++i) {
        field = this.group.get(i);

        if(this.element === field)
          continue;

        this.log("CHECK:", field.name);
        //let the user make their way onto 
        // the field first - silent fail!
        if(!field.touched) {
          this.log("FIELD NOT READY: ", field.name);
          return this.reject();
        }

        exec = field.execution;
        if(exec && exec.status === STATUS.COMPLETE)
          exec.reject();

        this.log("STARTING ", field.name);
        exec = new FieldExecution(field, this);
        exec.execute();
      }


      if(this.group.size() === sharedExec.members.length) {
        sharedExec.log("RUN");
        sharedExec.executeGroup();
      } else {
        this.log("WAIT");
      }

      return this.d.promise();
    },

    linkExec: function(master) {
      //use the status of this group
      //as the status of each linked
      master.d.done(this.resolve);
      master.d.fail(this.reject);
      //silent fail if one of the linked fields' rules
      //fails prior to reaching the group validation
      if(master.parent)
        master.parent.d.fail(this.reject);
    },

    //override and add an extra
    transformResult: function() {

      if(this.result && !this.members)
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
          domElem: exec.element.reskinElem,
          result: result
        });
      }

      this.result = list;
    }

  });

})();