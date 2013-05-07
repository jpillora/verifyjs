/* ===================================== *
 * Utility class
 * ===================================== */



var Utils = {

  //object create implementation
  create: function (o) {
    function F() {}
    F.prototype = o;
    return new F();
  },

  //bind method
  bind: $.proxy,

  //check options - throws a warning if the option doesn't exist
  checkOptions: function(opts) {
    if(!opts) return;
    for(var key in opts)
      if(globalOptions[key] === undefined)
        warn("Invalid option: '" + key + "'");
  },

  //append to arguments[i]
  appendArg: function(args, expr, i) {
      if(!i) i = 0;
      var a = [].slice.call(args, i);
      a[i] = expr + a[i];
      return a;
  },

  //memoize.js - by @addyosmani, @philogb, @mathias
  // with a few useful tweaks from @DmitryBaranovsk
  memoize: function( fn ) {
    return function () {
      var args = Array.prototype.slice.call(arguments),
      hash = "",
      i  = args.length,
      currentArg = null;
      while(i--){
        currentArg = args[i];
        hash += (currentArg === Object(currentArg)) ?
              JSON.stringify(currentArg) : currentArg;
        fn.memoize || (fn.memoize = {});
      }
      return (hash in fn.memoize) ? fn.memoize[hash] :
      fn.memoize[hash] = fn.apply( this , args );
    };
  },

  dateToString: function(date) {
    return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
  },

  parseDate: function(dateStr) {
    //format check
    var m = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if(!m) return null;

    var date;
    //parse with jquery ui's date picker
    if($.datepicker !== undefined) {
      try {
        var epoch = $.datepicker.parseDate("dd/mm/yy", dateStr);
        date = new Date(epoch);
      } catch(e) { return null; }
    //simple regex parse
    } else {
      date = new Date(parseInt(m[3], 10),parseInt(m[2], 10)-1,parseInt(m[1], 10));
    }

    return date;
  },

  /**
   * returns true if we are in a RTLed document
   * @param {jqObject} field
   */
  isRTL: function(field) {
    var $document = $(document);
    var $body = $('body');
    var rtl =
      (field && field.hasClass('rtl')) ||
      (field && (field.attr('dir') || '').toLowerCase()==='rtl') ||
      $document.hasClass('rtl') ||
      ($document.attr('dir') || '').toLowerCase()==='rtl' ||
      $body.hasClass('rtl') ||
      ($body.attr('dir') || '').toLowerCase()==='rtl';
    return Boolean(rtl);
  }
};
