describe("Group validation rules", function() {
  var form;

  form = null;
  beforeEach(function() {
    form = $("form");
    return form.verify({
      skipHiddenFields: false
    });
  });
  return describe("'requireAll' rule", function() {
    return beforeEach(function() {
      return $('#fixtures').html("<div data-demo>\n  <form>\n    <input name=\"field1\" value=\"abc\" data-validate=\"validator1\">\n    <input name=\"field2\" value=\"efg\" data-validate=\"validator2\">\n    <input name=\"field3\" value=\"def\">\n    <input class=\"submit\" type=\"submit\"/>\n  </form>\n</div>");
    });
  });
});
