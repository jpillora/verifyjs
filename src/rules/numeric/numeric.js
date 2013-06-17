/**
 * Numeric Validation Rules
 * @author Jaime Pillora
 */
(function($) {
  $.verify.addFieldRules({

    /**
     * Ensures valid currency
     * @name currency
     * @type field
     */
    currency: {
      fn: function(r) {
        if(r.args[0]) r.symbol = r.args[0];
        if(!/^\-?(.)\d{1,2}(,?\d{3})*(\.\d+)?$/.test(r.val()))
          return r.message.invalidValue;
        if(!RegExp.$1 || RegExp.$1 !== r.symbol)
          return r.message.invalidCurrency;

        return true;
      },
      symbol: '$',
      message: {
        invalidValue: "Invalid monetary value",
        invalidCurrency: "Invalid Currency {{ symbol }}"
      }
    },
    decimal: function(r) {
      var vStr = r.val(),
          places = r.args[0] ? parseInt(r.args[0], 10) : 2;

      if(!vStr.match(/^\-?\d+(,\d{3})*(\.\d+)?$/))
        return "Invalid decimal value";

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
        return "Must be greater than " + min + suffix;
      return true;
    },
    maxVal: function(r) {
      var v = parseFloat(r.val().replace(/[^\d\.]/g,'')),
          suffix = r.args[1] || '',
          max = parseFloat(r.args[0]);
      if(v > max)
        return "Must be less than " + max + suffix;
      return true;
    },
    rangeVal: function(r) {
      var v = parseFloat(r.val().replace(/[^\d\.]/g,'')),
          prefix = r.args[2] || '',
          suffix = r.args[3] || '',
          min = parseFloat(r.args[0]),
          max = parseFloat(r.args[1]);
      if(v > max || v < min)
        return "Must be between " + prefix + min + suffix + "\nand " + prefix + max + suffix;
      return true;
    }

  });
})(jQuery);