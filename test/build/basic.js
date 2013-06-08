describe("Basic validations", function() {
  var form, html;
  form = null;
  html = "<div data-demo>\n  <form>\n    <input name='num1' value='42' data-validate='number'>\n    <input name='num2' value='21' data-validate='number'>\n\n    <input class='submit' type='submit'/>\n  </form>\n</div>";
  beforeEach(function() {
    $('#fixtures').html(html);
    form = $("form");
    return form.verify({
      skipHiddenFields: false
    });
  });
  describe("When initialisation", function() {
    it("should have jquery accessor functions", function() {
      return expect($.isFunction(form.verify)).to.equal(true);
    });
    return it("should have attached validation engine object", function() {
      var v;
      v = form.data("verify");
      return expect(v).to.be.an("object");
    });
  });
  return describe("When submitted", function() {
    it("should be valid", function(done) {
      return form.validate(function(result) {
        expect(result).to.be["true"];
        return done();
      });
    });
    return it("should be invalid", function(done) {
      form.find("input:first").val("abc");
      return form.validate(function(result) {
        expect(result).to.be["false"];
        return done();
      });
    });
  });
});
