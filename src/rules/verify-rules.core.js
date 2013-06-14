(function($) {
  $.verify.addFieldRules({
    /**
     * Ensures a valid email address
     * @name email
     * @type field
     */
    email: {
      regex: /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      message: "Invalid email address"
    },
    /**
     * Ensures a valid URL
     * @name url
     * @type field
     */
    url: {
      regex: /^https?:\/\/[\-A-Za-z0-9+&@#\/%?=~_|!:,.;]*[\-A-Za-z0-9+&@#\/%=~_|]/,
      message: "Invalid URL"
    },
    /**
     * Ensures only alphanumeric characters are used
     * @name alphanumeric
     * @type field
     */
    alphanumeric: {
      regex: /^[0-9A-Za-z]+$/,
      message: "Use digits and letters only"
    },
    /**
     * Ensures only numbers are used
     * @name number
     * @type field
     */
    number: {
      regex: /^\d+$/,
      message: "Use digits only"
    },

    /**
     * Ensures the field has filled in
     * @name required
     * @type field
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
        "all": "This field is required",
        "multiple": "Please select an option",
        "single": "This checkbox is required"
      }
    },
    /**
     * Ensures the field matches the provided regular expression
     * @name regex
     * @param {String} regex The regular expression
     * @param {String} message The error message displayed
     * @type field
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

        if(!r.val().match(re))
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
     */
    min: function(r) {
      var v = r.val(), min = parseInt(r.args[0], 10);
      if(v.length < min)
        return "Must be at least " + min + " characters";
      return true;
    },
    /**
     * Ensures the number of characters is at most a given length  
     * @name max
     * @param {Integer} max An integer representing the maximum number of characters
     * @type field
     */
    max: function(r) {
      var v = r.val(), max = parseInt(r.args[0], 10);
      if(v.length > max)
        return "Must be at most " + max + " characters";
      return true;
    },
    /**
     * Ensures the number of characters is a inside a given length range
     * @name size
     * @param {String} min An integer representing the minimum number of characters
     * @param {String} max An integer representing the maximum number of characters (Defaults to 'min' resulting in exact length)
     * @type field
     */
    size: function(r){
      var v = r.val(), exactOrLower = r.args[0], upper = r.args[1];
      if(exactOrLower !== undefined && upper === undefined) {
        var exact = parseInt(exactOrLower, 10);
        if(r.val().length !== exact)
          return  "Must be "+exact+" characters";
      } else if(exactOrLower !== undefined && upper !== undefined) {
        var lower = parseInt(exactOrLower, 10);
        upper = parseInt(upper, 10);
        if(v.length < lower || upper < v.length)
          return "Must be between "+lower+" and "+upper+" characters";
      } else {
        r.warn("size validator parameter error on field: " + r.field.attr('name'));
      }

      return true;
    }
    /**
     */

  });

})(jQuery);