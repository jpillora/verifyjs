/**
 * Date Validation Rules
 * @require moment.js
 * @author Jaime Pillora
 */

(function($) {

  $.verify.addFieldRules({
    /**
     * Ensures a valid date
     * @name date
     * @param {String} format The expected string format (defaults to 'YYYY-MM-DD')
     * @type field
     *
     * @valid 2013-06-17
     * @valid (YYYY/MM/DD) 2013/06/17
     * @valid (DD/MM/YYYY) 17/06/2013
     * @invalid 17/06/2013
     * @invalid 17-06-2013
     * @invalid 17th of June 2013
     * @invalid 
     */
    date: {
      fn: function(r) {
        if(!r.parse(r.args[0]))
          return r.message;
      },
      parse: function(format) {
        this.format = format || this.DEFAULT_FORMAT;
        var m = moment(this.val(), format);
        if(!m.isValid()) return null;
        return m;
      },
      DEFAULT_FORMAT: 'YYYY-MM-DD',
      message: "Must be in {{ format }} format"
    },

    /**
     * Ensures a valid date and that this date is g to a mimum age
     * @name minAge
     * @param {Number} age The minimum age
     * @type field
     *
     * @valid (18) 1980-06-17
     * @invalid (18) 2013-06-17
     */
    minAge: {
      extend: "date",
      fn: function(r) {
        r.age = parseInt(r.args[0],10);
        if(!r.age) {
          r.warn("Invalid Age Param: " + r.args[0]);
          return true;
        }
        var m = r.parse(r.args[1]);
        if(!m)
          return r.message;
        var past = moment().subtract(r.age, 'years');
        if(m.isAfter(past))
          return r.messageMinAge;
        return true;
      },
      messageMinAge: "You must be at least {{ age }}"
    }
    /** */
  });

  // Group validation rules
  $.verify.addGroupRules({

    /**
     * Ensures a birthdate equates to at least a given age
     * @name minAge
     * @param {Number} age The minimum age
     * @type field
     */
    dateRange: {
      fn: function(r) {
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

    }
    /** */
  });
})(jQuery);