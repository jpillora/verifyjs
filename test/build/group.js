describe("Group validations (Ajax)", function() {
  var $ajax, form, html, stubAjax, unstubAjax;
  form = null;
  html = "<div data-demo>\n  <form>\n    <input name=\"f1\" value=\"abc\" data-validate=\"testGroupAjax#1\">\n    <input name=\"f2\" value=\"def\" data-validate=\"testGroupAjax#2\">\n    <input name=\"f3\" value=\"xyz\">\n    <input class=\"submit\" type=\"submit\"/>\n  </form>\n</div>";
  $ajax = $.ajax;
  stubAjax = function() {
    return $.ajax = function(o) {
      return setTimeout(function() {
        return o.success({
          result: true
        });
      }, 0);
    };
  };
  unstubAjax = function() {
    return $.ajax = $ajax;
  };
  $.verify.addGroupRules({
    testGroupAjax: function(r) {
      return r.ajax({
        url: './data/pass.json',
        success: function(data) {
          return r.callback(data.result || 'Failed');
        }
      });
    }
  });
  beforeEach(function() {
    var runCount;
    $('#fixtures').html(html);
    runCount = 0;
    form = $("form");
    form.verify();
    return stubAjax();
  });
  afterEach(function() {
    return unstubAjax();
  });
  describe("Group validations (Ajax) - When submitted", function() {
    return it("should be valid", function(done) {
      var input;
      input = $("input").first();
      return input.validate(function(result) {
        expect(result).to.be["false"];
        return input.next().validate(function(result) {
          expect(result).to.be["true"];
          return done();
        });
      });
    });
  });
  return null;
});

describe("Group validations (Simple)", function() {
  var form, html, runCount;
  runCount = 0;
  form = null;
  html = "<div data-demo>\n  <form>\n    <input name=\"f1\" value=\"abc\" data-validate=\"testGroup#1\">\n    <input name=\"f2\" value=\"def\" data-validate=\"testGroup#2\">\n    <input name=\"f3\" value=\"xyz\">\n    <input class=\"submit\" type=\"submit\"/>\n  </form>\n</div>";
  $.verify.addGroupRules({
    testGroup: function(r) {
      runCount++;
      if (r.val("1") !== "abc") {
        return "1 should be abc";
      }
      if (r.field("2").val() !== "def") {
        return "2 should be def";
      }
      return true;
    }
  });
  beforeEach(function() {
    $('#fixtures').html(html);
    runCount = 0;
    form = $("form");
    return form.verify({
      skipHiddenFields: false
    });
  });
  describe("Group validations (Simple) - Group count", function() {
    return it("should have 1 group", function() {
      var obj;
      obj = form.data("verify");
      expect(_.size(obj.groups)).to.equal(1);
      return expect(obj.groups.testGroup).to.exist;
    });
  });
  describe("Group validations (Simple) - When submitted (simple)", function() {
    it("should be valid", function(done) {
      return form.validate(function(result) {
        expect(result).to.be["true"];
        expect(runCount).to.equal(1);
        return done();
      });
    });
    return it("should be invalid", function(done) {
      form.find("input:first").val("blah!");
      return form.validate(function(result) {
        expect(result).to.be["false"];
        expect(runCount).to.equal(1);
        return done();
      });
    });
  });
  return null;
});
