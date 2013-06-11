describe("Options", function() {
  var form1, form2, html;

  form1 = null;
  form2 = null;
  html = "<div data-demo>\n  <form id=\"form1\"></form>\n  <form id=\"form2\"></form>\n</div>";
  beforeEach(function() {
    $('#fixtures').html(html);
    form1 = $("#form1");
    return form2 = $("#form2");
  });
  return describe("Options - Inheritance", function() {
    beforeEach(function() {
      form1.verify({
        errorClass: "warning"
      });
      form2.verify();
      return $.verify({
        errorClass: "invalid"
      });
    });
    it("should have custom option set", function() {
      return expect(form1.data('verify').options.errorClass).to.equal("warning");
    });
    return it("should have global option set", function() {
      return expect(form2.data('verify').options.errorClass).to.equal("invalid");
    });
  });
});
