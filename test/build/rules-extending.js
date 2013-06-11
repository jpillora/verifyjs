describe("Extending validation rules", function() {
  var form, html;

  form = null;
  html = "<div data-demo>\n  <form>\n    <input name=\"field1\" value=\"abc\" data-validate=\"validator1\">\n    <input name=\"field2\" value=\"efg\" data-validate=\"validator2\">\n    <input name=\"field3\" value=\"def\">\n    <input class=\"submit\" type=\"submit\"/>\n  </form>\n</div>";
  $.verify.addFieldRules({
    validator1: {
      fn: function(r) {
        if (r.val() !== r.myVar) {
          return "Must equal '" + r.myVar + "' (not " + r.val() + ")";
        }
        return true;
      },
      myVar: "abc"
    },
    validator2: {
      extend: "validator1",
      myVar: "def"
    },
    validator3: {
      extend: "validator2",
      fn: function(r) {
        var myVar2x;

        myVar2x = r.myVar + r.myVar;
        if (r.val() !== myVar2x) {
          return "Must equal '" + myVar2x + "' (double)";
        }
        return true;
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
  return describe("Extending validations - When submitted", function() {
    it("extended validator should be invalid", function(done) {
      return form.validate(function(result) {
        expect(result).to.be["false"];
        return done();
      });
    });
    return describe("Make valid", function() {
      beforeEach(function() {
        return form.find("input[name=field2]").val("def");
      });
      it("extended validator should be valid", function(done) {
        return form.validate(function(result) {
          expect(result).to.be["true"];
          return done();
        });
      });
      return describe("Enable validator 3", function() {
        beforeEach(function() {
          return form.find("input[name=field3]").val("def").attr("data-validate", "validator3");
        });
        it("double extended validator should be invalid", function(done) {
          return form.validate(function(result) {
            expect(result).to.be["false"];
            return done();
          });
        });
        return it("double extended validator should be valid", function(done) {
          form.find("input[name=field3]").val("defdef");
          return form.validate(function(result) {
            expect(result).to.be["true"];
            return done();
          });
        });
      });
    });
  });
});
