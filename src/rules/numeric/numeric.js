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
     * @valid #params(X) -X100.00
     * @invalid 100.00
     * @invalid -X100.00
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
     *
     * @valid 1.00
     * @valid 100.00
     * @valid 333
     * @invalid 33.33.00
     * @invalid -$100
     */
    decimal: {
      fn: function(r) {
        var vStr = r.val(),
            places = r.args[0] ? parseInt(r.args[0], 10) : 2;

        if(!vStr.match(/^\-?\d+(,\d{3})*(\.\d+)?$/))
          return r.message;

        var v = parseFloat(vStr.replace(/,/g,'')),
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
     *
     * @valid xxxx
     * @valid #params(2.5) 3 
     * @invalid #params(2.5) 2
     */
    minVal: {
      fn:function(r) {
        var v = parseFloat(r.val().replace(/[^\d\.]/g,''));
        r.min = parseFloat(r.args[0]);
        if(!r.min) {
          r.warn('minVal: No minimum set');
          return true;
        }
        r.preffix = r.args[1] || '';
        r.suffix =  r.args[2] || '';
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
     *
     * @valid xxxx
     * @valid #params(2.5) 2 
     * @invalid #params(2.5) 3
     */
    maxVal: {
      fn:function(r) {
        var v = parseFloat(r.val().replace(/[^\d\.]/g,''));
        r.max = parseFloat(r.args[0]);
        if(!r.max) {
          r.warn('maxVal: No maximum set');
          return true;
        }
        r.preffix = r.args[1] || '';
        r.suffix =  r.args[2] || '';
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
     *
     * @valid missingparams
     * @valid #params(2.5) missingparam
     * @valid #params(2.5,6.5) 3
     * @valid #params(2.5,6.5) 6.45
     * @invalid #params(2.5,6.5) 1.45
     * @invalid #params(2.5,6.5) 7.45
     */
    rangeVal: {
      fn: function(r) {
        var v = parseFloat(r.val().replace(/[^\d\.]/g,''));

        r.min = parseFloat(r.args[0]);
        if(!r.min) {
          r.warn('rangeVal: No minimum set');
          return true;
        }
        r.max = parseFloat(r.args[1]);
        if(!r.max) {
          r.warn('rangeVal: No maximum set');
          return true;
        }
        r.preffix = r.args[2] || '';
        r.suffix =  r.args[3] || '';
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