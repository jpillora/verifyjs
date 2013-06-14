(function($) {

  var DEFAULT_FORMAT = 'YYYY-MM-DD';

  $.verify.addFieldRules({
    /**
     * Ensures a valid date
     * @name date
     * @param {String} format The expected string format (defaults to 'YYYY-MM-DD')
     * @type field
     */
    date: {
      fn: function(r) {

        var format = r.args[0] || DEFAULT_FORMAT;
        //TODO
        if($.verify.utils.parseDate(r.val()))
          return true;
        return r.message;
      },
      message: "Invalid date"
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
        return "Invalid Date";
      if(fieldDate > minDate)
        return "You must be at least " + age;
      return true;
    }
  });

  // Group validation rules
  $.verify.addGroupRules({

    dateRange: function(r) {
      var start = r.field("start"),
          end = r.field("end");

      if(start.length === 0 || end.length === 0) {
        r.warn("Missing 'dateRange' fields, skipping...");
        return true;
      }

      var startDate = $.verify.utils.parseDate(start.val());
      if(!startDate)
        return "Invalid Start Date";

      var endDate = $.verify.utils.parseDate(end.val());
      if(!endDate)
        return "Invalid End Date";

      if(startDate >= endDate)
        return "Start Date must come before End Date";

      return true;
    }
  });
})(jQuery);