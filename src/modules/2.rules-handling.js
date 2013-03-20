/* ===================================== *
 * Rule Class
 * ===================================== */

// the Rule class will store all state relating to
// the user definition, all rule state from the DOM
// will be passes into the function inside an
// instance of a RuleExecution

var Rule = BaseClass.extend({

  init: function(name, userObj){
    this.name = name;
    this.buildFn(userObj);
  },

  //extracts the validation function out of the user defined object
  buildFn: function(userObj) {

    if(!$.isPlainObject(userObj))
      return this.warn("rule definition must be a function or an object");
    
    //clone object to keep a canonical version intact
    this.userObj = $.extend(true, {}, userObj);

    this.type = userObj.type;

    //handle object.extend (may inherit a object.fn)
    while($.type(this.userObj.extend) === 'string') {
      //extend using another validator -> validator name
      var otherName = this.userObj.extend;
      delete this.userObj.extend;

      var otherUserObj = ruleManager.getRawRule(otherName);
      //check not extending itself
      if(this.userObj === otherUserObj)
        return this.warn("Cannot extend self");

      //type check
      if($.isPlainObject(otherUserObj))
        this.userObj = $.extend(true, {}, otherUserObj, this.userObj);
      else
        return this.warn("Cannot extend: '"+otherName+"'");
    }

    //handle object.fn
    if($.isFunction(this.userObj.fn)) {

      //move function into the rule
      this.fn = this.userObj.fn;
      delete this.userObj.fn;

    //handle object.regexp
    } else if($.type(this.userObj.regex) === "regexp") {

      //build regex function
      this.fn = (function(regex) {
        return function(r) {
          var re = new RegExp(regex);
          if(!r.val().match(re))
            return r.message || "Invalid Format";
          return true;
        };

      })(this.userObj.regex);

      delete this.userObj.regex;

    } else {
      return this.warn("rule definition lacks a function");
    }

    this.ready = true;
    //function built
  },


  //the 'this's in these interface mixins
  //refer to the rule 'r' object
  defaultInterface: {
    log: log,
    warn: warn,
    ajax: function(userOpts) {
      ajaxHelper(userOpts, this);
    }
  },

  defaultFieldInterface: {
    val: function() {
      return this.field.val.apply(this.field,arguments);
    }
  },

  defaultGroupInterface: {
    val: function(id, newVal) {
      var field = this.field(id);
      if(field) return newVal === undefined ? field.val() : field.val(newVal);
    },
    field: function(id) {
      var elems = $.grep(this._exec.members, function(exec) {
        return exec.id === id;
      });

      var elem = elems.length ? elems[0].element.domElem : null;

      if(!elem)
        this.warn("Cannot find group element with id: '" + id + "'");
      return elem;
    },
    fields: function() {
      return $().add($.map(this._exec.members, function(exec) {
        return exec.element.domElem;
      }));
    }
  },

  //build public ruleInterface the 'r' rule object
  buildInterface: function(exec) {
    var objs = [];

    objs.push({});
    //user object has lowest precedence!
    objs.push(this.userObj);
    objs.push(this.defaultInterface);
    if(this.type === 'field') {
      objs.push(this.defaultFieldInterface);
      objs.push({ field: exec.element.domElem });
    }
    if(this.type === 'group')
      objs.push(this.defaultGroupInterface);

    objs.push({
      form:  exec.element.form.domElem,
      callback: exec.callback,
      args: exec.args,
      _exec: exec
    });

    return $.extend.apply(this,objs);
  }
});

/* ===================================== *
 * Rules Manager (Plugin Wide)
 * ===================================== */

var ruleManager = null;
(function() {

  //cached token parser - must be in form 'one(1,2,two(3,4),three.scope(6,7),five)'
  var parseString = function(str) {

    var chars = str.split(""),
        rule, rules = [],
        c, m, depth = 0;

    //replace argument commas with semi-colons
    for(var i = 0, l = chars.length; i<l; ++i) {
      c = chars[i];
      if(c === '(') depth++;
      if(c === ')') depth--;
      if(depth > 1) return null;
      if(c === ',' && depth === 1) chars[i] = ";";
    }

    //bracket check
    if(depth !== 0) return null;

    //convert string in format: "name.scope#id(args...)" to object
    $.each(chars.join('').split(','), function(i, rule) {
      m = rule.match(/^(\w+)(\.(\w+))?(\#(\w+))?(\((\w+(\;\w+)*)\))?$/);
      if(!m) return warn("Invalid validate attribute: " + str);
      rule = {};
      rule.name = m[1];
      if(m[3]) rule.scope = m[3];
      if(m[5]) rule.id = m[5];
      rule.args = m[7] ? m[7].split(';') : [];
      rules.push(rule);
    });
    return rules;
  };

  var parseStringMemo = Utils.memoize(parseString);

  //privates
  var rawRules = {},
      builtRules = {};

  var addRules = function(type,obj) {
    //check format, insert type
    for(var name in obj){
      if(rawRules[name])
        warn("validator '%s' already exists", name);

      if($.isFunction(obj[name]))
        obj[name] = { fn: obj[name] };

      obj[name].type = type;
    }

    //deep extend rules by obj
    $.extend(true, rawRules, obj);
  };

  //public
  var addFieldRules = function(obj) {
    addRules('field', obj);
  };

  var addGroupRules = function(obj) {
    addRules('group', obj);
  };

  var getRawRule = function(name) {
    return rawRules[name];
  };

  var getRule = function(name) {
    var r = builtRules[name],
        obj = rawRules[name];

    if(!obj) {
      warn("Missing rule: " + name);
    } else if(!r) {
      r = new Rule(name, obj);
      builtRules[name] = r;
    }
    return r;
  };

  //extract an objectified version of the "data-validate" attribute
  var parseAttribute = function(element) {
    var attrName = element.form.options.validateAttribute,
        attr = element.domElem.attr(attrName);
    if(!attr) return null;
    return parseStringMemo(attr);
  };

  //add a rule property to the above object
  var parseElement = function(element) {

    var required = false,
        type = null,
        results = [];

    if(element.type !== 'ValidationField')
      return warn("Cannot get rules from invalid type");

    if(!element.domElem) return [];

    results = this.parseAttribute(element);

    if(!results) return [];

    //add rule instances
    results = $.map(results, function(result) {
      //special required case
      if(result.name === 'required')
        required = true;

      result.rule = getRule(result.name);
      return result;
    });
    results.required = required;
    return results;
  };

  //public interface
  ruleManager = {
    addFieldRules: addFieldRules,
    addGroupRules: addGroupRules,
    getRule: getRule,
    getRawRule: getRawRule,
    parseString: parseString,
    parseAttribute: parseAttribute,
    parseElement: parseElement
  };

}());

