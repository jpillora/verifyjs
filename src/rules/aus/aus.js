/**
 * Australian Validation Rules
 * @author Jaime Pillora
 */
(function($) {
  $.verify.addFieldRules({
    /**
     * Ensures an australian postcode  
     * @name postcode
     * @type field
     *
     * @valid 2000
     * @invalid 90210
     */
    postcode: {
      regex: /^\d{4}$/,
      message: "Invalid postcode"
    },
    /**
     * Ensures an australian phone number  
     * @name phone
     * @type field
     *
     * @valid (02) 9555-1234
     * @valid 0411 123 456
     * @valid +61 1234 5678 9
     * @invalid 1234
     * @invalid (20) 9555-1234
     * @invalid xyz
     */
    phone: function(r) {
      r.val(r.val().replace(/[^\+\d]/g,''));
      var v = r.val();
      if(!v.match(/^\+?[\d\s]+$/))
        return "Use digits and spaces only";
      if(v.match(/^\+\d+$/))
        return true; //allow all international
      if(!v.match(/^0/))
        return "Number must start with 0";
      if(v.replace(/\s/g,"").length !== 10)
        return "Must be 10 digits long";
      return true;
    }
    /** */
  });
})(jQuery);