(function($) {

  if($.verify === undefined) {
    window.alert("Please include verify.js before each rule file");
    return;
  }

  $.verify.addFieldRules({
    /* Regex validators
     * - at plugin load, 'regex' will be transformed into validator function 'fn' which uses 'message'
     */
    currency: {
      regex: /^\-?\$?\d{1,2}(,?\d{3})*(\.\d+)?$/,
      message: window.verifyMessages.currency
    },
    email: {
      regex: /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      message: window.verifyMessages.email
    },
    url: {
      regex: /^https?:\/\/[\-A-Za-z0-9+&@#\/%?=~_|!:,.;]*[\-A-Za-z0-9+&@#\/%=~_|]/,
      message: window.verifyMessages.url
    },
    alphanumeric: {
      regex: /^[0-9A-Za-z]+$/,
      message: window.verifyMessages.alphanumeric
    },
    street_number: {
      regex: /^\d+[A-Za-z]?(-\d+)?[A-Za-z]?$/,
      message: window.verifyMessages.street_number
    },
    number: {
      regex: /^\d+$/,
      message: window.verifyMessages.number
    },
    numberSpace: {
      regex: /^[\d\ ]+$/,
      message: window.verifyMessages.numberSpace
    },
    postcode: {
      regex: /^\d{4}$/,
      message: window.verifyMessages.postcode
    },
    date: {
      fn: function(r) {
        if($.verify.utils.parseDate(r.val()))
          return true;
        return r.message;
      },
      message: window.verifyMessages.date.invalid
    },
    required: {

      fn: function(r) {
        return r.requiredField(r, r.field);
      },

      requiredField: function(r, field) {
        var v = field.val();

        switch (field.prop("type")) {
          case "radio":
          case "checkbox":
            var name = field.attr("name");
            var group = field.data('fieldGroup');

            if(!group) {
              group = r.form.find("input[name='" + name + "']");
              field.data('fieldGroup', group);
            }

            if (group.is(":checked"))
              break;

            if (group.size() === 1)
              return r.messages.single;

            return r.messages.multiple;

          default:
            if (! $.trim(v))
              return r.messages.all;
            break;
        }
        return true;
      },
      messages: window.verifyMessages.required
    },
    regex: {
      fn: function(r) {
        var re;
        try {
          var str = r.args[0];
          re = new RegExp(str);
        } catch(error) {
          r.warn("Invalid regex: " + str);
          return true;
        }

        if(!r.val().match(re))
          return r.args[1] || r.message;
        return true;
      },
      message: window.verifyMessages.regex
    },
    //an alias
    pattern: {
      extend: 'regex'
    },
    asyncTest: function(r) {

      r.prompt(r.field, "Please wait...");
      setTimeout(function() {
        r.callback();
      },2000);

    },
    phone: function(r) {
      r.val(r.val().replace(/\D/g,''));
      var v = r.val();
      if(!v.match(/^\+?[\d\s]+$/))
        return window.verifyMessages.phone[0];
      if(v.match(/^\+/))
        return true; //allow all international
      if(!v.match(/^0/))
        return window.verifyMessages.phone[1];
      if(v.replace(/\s/g,"").length !== 10)
        return window.verifyMessages.phone[2];
      return true;
    },
    size: function(r){
      var v = r.val(), exactOrLower = r.args[0], upper = r.args[1];
      if(exactOrLower !== undefined && upper === undefined) {
        var exact = parseInt(exactOrLower, 10);
        if(r.val().length !== exact)
          return window.verifyMessages.size[0].replace("%s", exact);
      } else if(exactOrLower !== undefined && upper !== undefined) {
        var lower = parseInt(exactOrLower, 10);
        upper = parseInt(upper, 10);
        if(v.length < lower || upper < v.length)
          return window.verifyMessages.size[1].replace("%s", lower).replace("%s", upper);
      } else {
        r.warn("size validator parameter error on field: " + r.field.attr('name'));
      }

      return true;
    },
    min: function(r) {
      var v = r.val(), min = parseInt(r.args[0], 10);
      if(v.length < min)
        return window.verifyMessages.min.replace("%s", min);
      return true;
    },
    max: function(r) {
      var v = r.val(), max = parseInt(r.args[0], 10);
      if(v.length > max)
        return window.verifyMessages.max.replace("%s", max);
      return true;
    },

    decimal: function(r) {
      var vStr = r.val(),
          places = r.args[0] ? parseInt(r.args[0], 10) : 2;

      if(!vStr.match(/^\d+(,\d{3})*(\.\d+)?$/))
        return window.verifyMessages.decimal;

      var v = parseFloat(vStr.replace(/[^\d\.]/g,'')),
          factor = Math.pow(10,places);

      v = (Math.round(v*factor)/factor);
      r.field.val(v);

      return true;
    },
    minVal: function(r) {
      var v = parseFloat(r.val().replace(/[^\d\.]/g,'')),
          suffix = r.args[1] || '',
          min = parseFloat(r.args[0]);
      if(v < min)
        return window.verifyMessages.minVal.replace("%s", min + suffix);
      return true;
    },
    maxVal: function(r) {
      var v = parseFloat(r.val().replace(/[^\d\.]/g,'')),
          suffix = r.args[1] || '',
          max = parseFloat(r.args[0]);
      if(v > max)
        return window.verifyMessages.maxVal.replace("%s", max + suffix);
      return true;
    },
    rangeVal: function(r) {
      var v = parseFloat(r.val().replace(/[^\d\.]/g,'')),
          prefix = r.args[2] || '',
          suffix = r.args[3] || '',
          min = parseFloat(r.args[0]),
          max = parseFloat(r.args[1]);
      if(v > max || v < min)
        return window.verifyMessages.rangeVal.replace("%s", prefix + min + suffix).replace("%s", prefix + max + suffix);
      return true;
    },

    agreement: function(r){
      if(!r.field.is(":checked"))
        return window.verifyMessages.agreement;
      return true;
    },
    minAge: function(r){
      var age = parseInt(r.args[0],10);
      if(!age || isNaN(age)) {
        console.log("WARNING: Invalid Age Param: " + age);
        return true;
      }
      var currDate = new Date();
      var minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - age);
      var fieldDate = $.verify.utils.parseDate(r.val());

      if(fieldDate === "Invalid Date")
        return window.verifyMessages.date.invalid;
      if(fieldDate > minDate)
        return window.verifyMessages.minAge.replace("%s", age);
      return true;
    },
    compare: function (r) {
      if ($(r.args[0]).val() === r.val())
        return true;
      return window.verifyMessages.compare.replace("%s", r.args[1] || r.args[0].replace('#',''));
    },
    check: function (r) {
      $.get(r.args[0].replace('%s', r.val()), function (data) {
        if (!data || data.err || data.error)
          return r.callback(r.args[1] || window.verifyMessages.check);
        r.callback(true);
      });
    }
  });

  // Group validation rules
  $.verify.addGroupRules({

    dateRange: function(r) {
      var start = r.field("start"),
          end = r.field("end");

      if(start.length === 0 || end.length === 0) {
        r.warn("Missing dateRange fields, skipping...");
        return true;
      }

      var startDate = $.verify.utils.parseDate(start.val());
      if(!startDate)
        return window.verifyMessages.date.start;

      var endDate = $.verify.utils.parseDate(end.val());
      if(!endDate)
        return window.verifyMessages.date.end;

      if(startDate >= endDate)
        return window.verifyMessages.date.startEnd;

      return true;
    },

    requiredAll: {
      extend: 'required',
      fn: function(r) {

        var size = r.fields().length,
            message,
            passes = [], fails = [];

        r.fields().each(function(i, field) {
          message = r.requiredField(r, field);
          if(message === true)
            passes.push(field);
          else
            fails.push({ field: field, message:message });
        });

        if(passes.length > 0 && fails.length > 0) {
          $.each(fails, function(i, f) {
            r.prompt(f.field, f.message);
          });
          return false;
        }

        return true;
      }
    }

  });

})(jQuery);