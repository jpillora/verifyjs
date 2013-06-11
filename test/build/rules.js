describe("Validation rules", function() {
  var form, html;

  form = null;
  html = "<div data-demo>\n  <form>\n    <input id='required' data-validate='required'>\n    <input id='number' data-validate='number'>\n\n    <input id='phone' data-validate='phone'>\n    <input id='currency' data-validate='currency'>\n\n    <input name='multiRequired' id='multiRequired' data-validate='required,number'>\n    <input name='multiOptional' id='multiOptional' data-validate='phone,number'>\n\n    <input name='minMax' id='minMax' data-validate='min(3),max(5)'/>\n\n    <input class='submit' type='submit'/>\n  </form>\n</div>";
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
  describe("number", function() {
    it("should be a number", function(done) {
      return $('#number').val('X').validate(function(result) {
        expect(result).to.be["false"];
        return done();
      });
    });
    return it("should be valid", function(done) {
      return $('#number').val('42').validate(function(result) {
        expect(result).to.be["true"];
        return done();
      });
    });
  });
  describe("required", function() {
    it("should be required", function(done) {
      return $('#required').validate(function(result) {
        expect(result).to.be["false"];
        return done();
      });
    });
    return it("should be valid", function(done) {
      return $('#required').val('X').validate(function(result) {
        expect(result).to.be["true"];
        return done();
      });
    });
  });
  describe("phone (aus)", function() {
    it("should start with 0", function(done) {
      return $('#phone').val('1299998888').validate(function(result) {
        expect(result).to.be["false"];
        return done();
      });
    });
    it("should be 10 chars", function(done) {
      return $('#phone').val('099998888').validate(function(result) {
        expect(result).to.be["false"];
        return done();
      });
    });
    return it("should be valid", function(done) {
      return $('#phone').val('0299998888').validate(function(result) {
        expect(result).to.be["true"];
        return done();
      });
    });
  });
  describe("multiple", function() {
    it("should be invalid (required)", function(done) {
      return $('#multiRequired').validate(function(result) {
        expect(result).to.be["false"];
        return done();
      });
    });
    it("should be invalid (number)", function(done) {
      return $('#multiRequired').val('hello').validate(function(result) {
        expect(result).to.be["false"];
        return done();
      });
    });
    it("should be valid", function(done) {
      return $('#multiRequired').val('42').validate(function(result) {
        expect(result).to.be["true"];
        return done();
      });
    });
    return it("should be invalid (NOT required but is word)", function(done) {
      return $('#multiOptional').val('hello').validate(function(result) {
        expect(result).to.be["false"];
        return done();
      });
    });
  });
  return describe("min-max chars", function() {
    it("should be invalid (min)", function(done) {
      return $('#minMax').val('aa').validate(function(result) {
        expect(result).to.be["false"];
        return done();
      });
    });
    it("should be invalid (max)", function(done) {
      return $('#minMax').val('aaaaaa').validate(function(result) {
        expect(result).to.be["false"];
        return done();
      });
    });
    return it("should be valid", function(done) {
      return $('#minMax').val('aaaa').validate(function(result) {
        expect(result).to.be["true"];
        return done();
      });
    });
  });
});
