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
     * @param symbol The currency symbol to expect
     * 
     * @valid $100.00
     * @valid -$100.00
     * @valid #params(*) -*100.00
     * @invalid 100.00
     * @invalid -*100.00
     */
    currency: {
      fn: function(r) {
        if(r.args[0]) r.symbol = r.args[0];
        if(!/^\-?(.)\d+(,?\d{3})*(\.\d+)?$/.test(r.val()))
          return r.message.invalidValue;
        if(!RegExp.$1 || RegExp.$1 !== r.symbol)
          return r.message.invalidCurrency;

        return true;
      },
      symbol: '$',
      message: {
        invalidValue: "Invalid monetary value",
        invalidCurrency: "Missing '{{ symbol }}' symbol"
      }
    },
    /**
     * Ensures valid decimal number and rounds it
     * @name decimal
     * @type field
     * @param places The numbers of places to round
     */
    decimal: {
      fn: function(r) {
        var vStr = r.val(),
            places = r.args[0] ? parseInt(r.args[0], 10) : 2;

        if(!vStr.match(/^\-?\d+(,\d{3})*(\.\d+)?$/))
          return r.message;

        var v = parseFloat(vStr.replace(/[^\d\.]/g,'')),
            factor = Math.pow(10,places);

        v = (Math.round(v*factor)/factor);
        r.field.val(v);

        return true;
      },
      message: "Invalid decimal value"
    },
    /**
     * Ensures the input is greater than the given value
     * @name minVal
     * @type field
     * @param min The minimum value
     */
    minVal: {
      fn:function(r) {
        var v = parseFloat(r.val().replace(/[^\d\.]/g,''));
        r.min = parseFloat(r.args[0]);
        if(r.args[1]) r.suffix = r.args[1];
        if(r.args[2]) r.suffix = r.args[2];
        if(v < r.min)
          return r.message;
        r.val(v);
        return true;
      },
      prefix: '',
      suffix: '',
      message: "Must be greater than { prefix }{ min }{ suffix }"
    },
    /**
     * Ensures the input is less than the given value
     * @name maxVal
     * @type field
     * @param max The maximum value
     */
    maxVal: {
      fn:function(r) {
        var v = parseFloat(r.val().replace(/[^\d\.]/g,''));
        r.max = parseFloat(r.args[0]);
        if(r.args[1]) r.suffix = r.args[1];
        if(r.args[2]) r.suffix = r.args[2];
        if(v > r.max)
          return r.message;
        r.val(v);
        return true;
      },
      prefix: '',
      suffix: '',
      message: "Must be less than { prefix }{ max }{ suffix }"
    },
    /**
     * Ensures the input is within the given range
     * @name rangeVal
     * @type field
     * @param min The minimum value
     * @param max The maximum value
     */
    rangeVal: {
      fn: function(r) {
        var v = parseFloat(r.val().replace(/[^\d\.]/g,''));

        r.min = parseFloat(r.args[0]);
        r.max = parseFloat(r.args[1]);
        if(r.args[2]) r.suffix = r.args[2];
        if(r.args[3]) r.suffix = r.args[3];

        if(v > r.max || v < r.min)
          return r.message;
        return true;
      },
      prefix: '',
      suffix: '',
      message: "Must be between { prefix }{ min }{ suffix }\nand { prefix }{ max }{ suffix }"
    }
    /** */
  });
})(jQuery);