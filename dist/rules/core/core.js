/**
 * Core Validation Rules
 * @author Jaime Pillora
 */
(function($) {
  $.verify.addFieldRules({
    /**
     * Ensures a valid email address
     * @name email
     * @type field
     * 
     * @valid dev@jpillora.com
     * @invalid devjpillora.com
     * @invalid dev@jpillora.c
     */
    email: {
      regex: /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      message: "Invalid email address"
    },
    /**
     * Ensures a valid URL
     * @name url
     * @type field
     *
     * @valid http://jpillora.com
     * @invalid jpillora.com
     * @invalid http://jpilloracom
     */
    url: {
      regex: /^https?:\/\/(\S+(\:\S*)?@)?((?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(\.([a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(\.([a-z\u00a1-\uffff]{2,}))(:\d{2,5})?(\/[^\s]*)?$/i,
      message: "Invalid URL"
    },
    /**
     * Ensures only alphanumeric characters are used
     * @name alphanumeric
     * @type field
     *
     * @valid abc123ABC
     * @invalid abc!123ABC
     */
    alphanumeric: {
      regex: /^[0-9A-Za-z]+$/,
      message: "Use digits and letters only"
    },
    /**
     * Ensures only numbers are used
     * @name number
     * @type field
     *
     * @valid 123
     * @invalid 123abc
     */
    number: {
      regex: /^\d+$/,
      message: "Use digits only"
    },
    /**
     * Ensures the field has filled in
     * @name required
     * @type field
     *
     * @valid abc
     * @invalid 
     */
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
      messages: {
        all: "This field is required",
        multiple: "Please select an option",
        single: "This checkbox is required"
      }
    },
    /**
     * Ensures the field matches the provided regular expression
     * @name regex
     * @param {String} regex The regular expression
     * @param {String} message The error message displayed (default: 'Invalid Format')
     * @type field
     * 
     * @valid #params(bcde) abcdef
     * @valid #params(^abc) abcdef
     * @invalid #params($cde) abcdef
     */
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

        if(!re.test(r.val()))
          return r.args[1] || r.message;
        return true;
      },
      message: "Invalid format"
    },
    /**
     * An alias to 'regex'
     * @name pattern
     * @type field
     */
    pattern: {
      extend: 'regex'
    },
    /**
     * Ensures the number of characters is at least a given length  
     * @name min
     * @param {Integer} min An integer representing the minimum number of characters
     * @type field
     *
     * @valid   #params(5) aaaaa
     * @valid   #params(3) aaaaa
     * @invalid #params(5) aaa
     */
    min: {
      fn:function(r) {
        var v = r.val();
        r.min = parseInt(r.args[0], 10);
        if(v.length < r.min)
          return r.message;
        return true;
      },
      message: "Must be at least {{ min }} characters"
    },
    /**
     * Ensures the number of characters is at most a given length  
     * @name max
     * @param {Integer} max An integer representing the maximum number of characters
     * @type field
     *
     * @valid   #params(5) aaaaa
     * @valid   #params(3) aaa
     * @invalid #params(3) aaaaa
     */
    max: {
      fn: function(r) {
        var v = r.val();
        r.max = parseInt(r.args[0], 10);
        if(v.length > r.max)
          return r.message;
        return true;
      },
      message: "Must be at most {{ max }} characters"
    },
    /**
     * Ensures the number of characters is a inside a given length range
     * @name size
     * @param {String} min An integer representing the minimum number of characters
     * @param {String} max An integer representing the maximum number of characters (default: min)
     * @type field
     *
     * @valid   #params(5) aaaaa
     * @valid   #params(3) aaa
     * @valid   #params(3,5) aaaa
     * @invalid #params(3,5) aaaaaaaa
     * @invalid #params(3,5) 
     */
    size: {
      fn: function(r){
        var len = r.val().length;
        r.min = parseInt(r.args[0], 10);
        r.max = parseInt(r.args[1], 10) || r.min;

        if(!r.min){
          r.warn("Invalid argument: "+r.args[0]);
          return true;
        }

        if(len < r.min || len > r.max)
          return r.messages[r.min === r.max ? 'exact' : 'range'];

        return true;
      },
      messages: {
        range: "Must be between {{ min }} and {{ max }} characters",
        exact: "Must be {{ min }} characters"
      }
    }
    /**
     */

  });

})(jQuery);