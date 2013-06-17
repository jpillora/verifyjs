describe("Validation rules", function() {
  var field, form, html;

  form = null;
  field = null;
  html = "<div data-demo>\n  <form>\n    <input id='field' data-validate=''>\n    <input class='submit' type='submit'/>\n  </form>\n</div>";
  beforeEach(function() {
    $('#fixtures').html(html);
    form = $("form");
    field = $("#field");
    return form.verify({
      skipHiddenFields: false
    });
  });
  afterEach(function() {
    return form.verify(false);
  });
  return _.each(MANIFEST, function(obj) {
    return describe("rule set " + obj.namespace, function() {
      return _.each(obj.rules, function(rule) {
        console.log("creating tests for " + rule.name);
        return describe("rule " + rule.name, function() {
          return _.each(['valids', 'invalids'], function(type) {
            var t;

            t = type.substr(0, type.length - 1);
            return _.each(rule.tests[type], function(testcase) {
              var m, params, value;

              m = testcase.match(/^(\(([^\)]+)\))?(.*)$/);
              if (!m) {
                console.warn("invalid testcase " + testcase);
                return;
              }
              params = m[2];
              value = m[3];
              console.log("creating " + t + " test case: (" + params + ") = " + value);
              return it("'" + value + "' should be " + t, function(done) {
                field.attr('data-validate', "" + rule.name + "(" + params + ")");
                field.val(value);
                return field.validate(function(result) {
                  expect(result).to.equal(t === 'valid');
                  return done();
                });
              });
            });
          });
        });
      });
    });
  });
});
