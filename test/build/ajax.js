describe("Ajax validations", function() {
  var form, html;

  form = null;
  html = "<div data-demo>\n  <form>\n    <input name=\"field\" value=\"abc\" data-validate=\"testAjax\">\n    <input class=\"submit\" type=\"submit\"/>\n  </form>\n</div>";
  $.verify.addFieldRules({
    testAjax: {
      fn: function(r) {
        setTimeout(function() {
          if (r.val() === "def") {
            return r.callback(true);
          } else {
            return r.callback("My ajax test failed!");
          }
        }, 0);
        return undefined;
      }
    }
  });
  beforeEach(function() {
    $('#fixtures').html(html);
    form = $("form");
    return form.verify({
      skipHiddenFields: false
    });
  });
  return describe("On submission", function() {
    it("should be invalid", function(done) {
      return form.validate(function(result) {
        expect(result).to.be["false"];
        return done();
      });
    });
    return it("should be valid", function(done) {
      $("input:first").val("def");
      return form.validate(function(result) {
        expect(result).to.be["true"];
        return done();
      });
    });
  });
});
