(function($) {
  $.verify.addFieldRules({
    postcode: {
      regex: /^\d{4}$/,
      message: "Invalid postcode"
    },

    phone: function(r) {
      r.val(r.val().replace(/\D/g,''));
      var v = r.val();
      if(!v.match(/^\+?[\d\s]+$/))
        return "Use digits and spaces only";
      if(v.match(/^\+/))
        return true; //allow all international
      if(!v.match(/^0/))
        return "Number must start with 0";
      if(v.replace(/\s/g,"").length !== 10)
        return "Must be 10 digits long";
      return true;
    }
  });
})(jQuery);