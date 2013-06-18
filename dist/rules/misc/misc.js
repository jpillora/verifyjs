/**
 * Miscellaneous Validation Rules
 * @author Jaime Pillora
 */
 (function($) {
  $.verify.addFieldRules({
    /**
     * Ensures a checkbox or radio is checked
     * @name agreement
     * @type field
     */
    agreement: {
      fn: function(r){
        if(!r.field.is(":checked"))
          return r.message;
        return true;
      },
      message:  "You must agree to continue"
    },
    /**
     * Ensures a valid street number
     * @name streetNumber
     * @type field
     *
     * @valid 1
     * @valid 1-5
     * @valid 1a
     * @valid 1a-5b
     * @invalid a
     * @invalid a-5b
     */
    streetNumber: {
      regex: /^\d+[A-Za-z]?(-\d+[A-Za-z]?)?$/,
      message: "Street Number only"
    }
    /** */
  });
})(jQuery);