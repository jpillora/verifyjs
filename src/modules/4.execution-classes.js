/* ===================================== *
 * Execution Classes
 * ===================================== */

// only exposing two classes
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
        this.prevExec = element.execution;
        element.execution = this;
        this.options = this.element.options;
        this.domElem = element.domElem;
      }
      //parent Execution class
      this.parent = parent;
      this.name = '#'+guid();
      this.status = STATUS.NOT_STARTED;
      this.bindAll();

      //deferred object
      this.d = this.restrictDeferred();
      this.d.done(this.executePassed);
      this.d.fail(this.executeFailed);

    },

    isPending: function() {
      return this.prevExec && this.prevExec.status !== STATUS.COMPLETE;
    },

    toString: function() {
      return this._super() + "[" + this.element.name + (!this.rule ? "" : ":" + this.rule.name) + "] ";
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

      function pass(response) {
        n++;
        if(n === l) _this.resolve(response);
      }

      function fail(response) {
        if(rejected) return;
        rejected = true;
        _this.reject(response);
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

    linkPass: function(that) {
      that.d.done(this.resolve);
    },
    linkFail: function(that) {
      that.d.fail(this.reject);
    },
    link: function(that) {
      this.linkPass(that);
      this.linkFail(that);
    },

    execute: function() {

      var p = this.parent,
          ps = [];
      while(p) {
        ps.unshift(p.name);
        p = p.parent;
      }
      var gap = "(" + ps.join(' < ') + ")";

      this.log(this.parent ? gap : '', 'executing...');
      this.status = STATUS.RUNNING;
      if(this.domElem)
        this.domElem.triggerHandler("validating");

      return true;
    },

    executePassed: function(response) {
      this.success = true;
      this.response = this.filterResponse(response);
      this.executed();
    },
    executeFailed: function(response) {
      this.success = false;
      this.response = this.filterResponse(response);
      this.executed();
    },

    executed: function() {
      this.status = STATUS.COMPLETE;

      this.log((this.success ? 'Passed' : 'Failed') + ": " + this.response);

      if(this.domElem)
        this.domElem.triggerHandler("validated", this.success);
    },

    //resolves or rejects the execution's deferred object 'd'
    resolve: function(response) {
      return this.resolveOrReject(true, response);
    },
    reject: function(response) {
      return this.resolveOrReject(false, response);
    },
    resolveOrReject: function(success, response) {
      var fn = success ? '__resolve' : '__reject';
      if(!this.d || !this.d[fn]) throw "Invalid Deferred Object";
      this.nextTick(this.d[fn], [response], 0);
      return this.d.promise();
    },
    filterResponse: function(response) {
      if(typeof response === 'string')
        return response;
      return null;
    },
    restrictDeferred: function(d) {
      if(!d) d = $.Deferred();
      d.__reject = d.reject;
      d.__resolve = d.resolve;
      d.reject = d.resolve = function() {
        console.error("Use execution.resolve|reject()");
      };
      return d;
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

      if(this.isPending()) {
        this.warn("pending... (waiting for %s)", this.prevExec.name);
        return this.reject();
      }

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

      if(this.isPending()) {
        this.warn("pending... (waiting for %s)", this.prevExec.name);
        return this.reject();
      }

      //execute rules
      var ruleParams = ruleManager.parseElement(this.element);

      //skip check
      this.skip = this.skipValidations(ruleParams);
      if(this.skip)
        return this.resolve();

      //ready
      this.children = $.map(ruleParams, $.proxy(function(r) {
        if(r.rule.type === 'group')
          return new GroupRuleExecution(r, this);
        else
          return new RuleExecution(r, this);
      }, this));

      // this.log("exec rules #%s", this.children.length);
      return this.serialize(this.children);
    },

    skipValidations: function(ruleParams) {

      //no rules
      if(ruleParams.length === 0) {
        this.log("skip (no validators)");
        return true;
      }

      //not required
      if(!ruleParams.required && !$.trim(this.domElem.val())) {
        this.warn("skip (not required)");
        return true;
      }

      //custom-form-elements.js hidden fields
      if(this.options.skipHiddenFields &&
         this.options.reskinContainer(this.domElem).is(':hidden')) {
        this.log("skip (hidden)");
        return true;
      }

      //skip disabled
      if(this.options.skipDisabledFields &&
         this.domElem.is('[disabled]')) {
        this.log("skip (disabled)");
        return true;
      }

      return false;
    },

    executed: function() {
      this._super();

      //pass error to element
      var i, exec = this,
          children = this.children;
      for(i = 0; i < children.length; ++i)
        if(children[i].success === false) {
          exec = children[i];
          break;
        }
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
    callback: function(response) {
      clearTimeout(this.t);
      this.callbackCount++;
      this.log(this.rule.name + " (cb:" + this.callbackCount + "): " + response);

      if(this.callbackCount > 1)
        return;

      if(response === undefined)
        this.warn("Undefined result");

      //success
      if(response === true)
        this.resolve(response);
      else
        this.reject(response);

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

      var response;
      try {
        response = this.rule.fn(this.r);
      } catch(e) {
        response = true;
        console.error("Error caught in validation rule: '" + this.rule.name +
                      "', skipping.\nERROR: " + e.toString() + "\nSTACK:" + e.stack);
      }

      //used return statement
      if(response !== undefined)
        this.nextTick(this.callback, [response]);

      return this.d.promise();
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
          _this = this, i, j, field, exec, child,
          isMember = false;

      if(!sharedExec || sharedExec.status === STATUS.COMPLETE) {
        this.log("MASTER");
        this.members = [this];
        this.executeGroup = this._super;
        sharedExec = this.group.exec = this;

        if(formOrigin)
          sharedExec.linkFail(originExec);

      } else {

        this.members = sharedExec.members;
        for(i = 0; i < this.members.length; ++i)
          if(this.element === this.members[i].element)
            isMember = true;

        if(isMember) {
          //start a new execution - reject old
          this.log("ALREADY A MEMBER OF %s", sharedExec.name);
          this.reject();
          return;

        } else {
          this.log("SLAVE TO %s", sharedExec.name);
          this.members.push(this);
          this.link(sharedExec);
          if(this.parent) sharedExec.linkFail(this.parent);
        }
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
        //silent fail unfinished
        if(exec && exec.status !== STATUS.COMPLETE)
          exec.reject();

        this.log("STARTING ", field.name);
        exec = new FieldExecution(field, this);
        exec.execute();
      }

      var groupSize = this.group.size(),
          execSize = sharedExec.members.length;

      if(groupSize === execSize&&
         sharedExec.status === STATUS.NOT_STARTED) {
        sharedExec.log("RUN");
        sharedExec.executeGroup();
      } else {
        this.log("WAIT (" + execSize + "/" + groupSize + ")");
      }

      return this.d.promise();
    },

    filterResponse: function(response) {
      if(!response || !this.members.length)
        return this._super(response);

      var isObj = $.isPlainObject(response),
          isStr = (typeof response === 'string');

      if(isStr && this === this.group.exec) return response;
      if(isObj && response[this.id]) return response[this.id];

      return null;
    }

  });

})();