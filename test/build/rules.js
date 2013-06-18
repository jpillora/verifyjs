describe("Validation rules", function() {
  var field, form, html;

  form = null;
  field = null;
  html = "<div data-demo>\n  <form>\n    <input class='submit' type='submit'/>\n  </form>\n</div>";
  beforeEach(function() {
    $('#fixtures').html(html);
    form = $("form");
    return form.verify({
      skipHiddenFields: false
    });
  });
  afterEach(function() {
    return form.verify(false);
  });
  return _.each(MANIFEST, function(obj) {
    return describe("rule-namespace: '" + obj.namespace + "'", function() {
      return _.each(obj.rules, function(rule) {
        return describe("rule: '" + rule.name + "'", function() {
          return _.each(['valids', 'invalids'], function(type) {
            var t;

            t = type.substr(0, type.length - 1);
            return _.each(rule.tests[type], function(testcase) {
              var fields, params, value;

              params = '';
              fields = [];
              value = testcase.replace(/#(\w+)\(([^\)]+)\)/g, function(str, name, value) {
                if (name === 'params') {
                  params = value;
                } else {
                  fields.push({
                    name: name,
                    value: value
                  });
                }
                return '';
              });
              value = value.replace(/^\s+|\s+$/g, '');
              if (value || fields.length === 0) {
                fields.push({
                  name: null,
                  value: value
                });
              }
              if (params) {
                params = "(" + params + ")";
              }
              return it("'" + testcase + "' should be " + t, function(done) {
                _.each(fields, function(f) {
                  var id;

                  field = $("<input/>");
                  id = f.name ? "#" + f.name : "";
                  field.attr('data-validate', "required," + rule.name + id + params);
                  field.val(f.value);
                  return form.prepend(field);
                });
                return form.validate(function(result) {
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
