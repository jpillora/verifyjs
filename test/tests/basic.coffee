#=require ./index

#BASIC TESTS
describe "Basic validations", ->

  form = null
  html = """
    <div data-demo>
      <form>
        <input name='num1' value='42' data-validate='number'>
        <input name='num2' value='21' data-validate='number'>

        <input class='submit' type='submit'/>
      </form>
    </div>
  """

  beforeEach ->
    $('#fixtures').html html
    form = $("form")
    form.verify(skipHiddenFields: false)

  describe "When initialisation", ->
    it "should have jquery accessor functions", ->
      expect($.isFunction(form.verify)).to.equal true

    it "should have attached validation engine object", ->
      v = form.data("verify")
      expect(v).to.be.an "object"

  describe "When submitted", ->
    it "should be valid", (done)  ->
      form.validate (result) ->
        expect(result).to.be.true
        done()

    it "should be invalid", (done) ->
      #make invalid
      form.find("input:first").val "abc"
      form.validate (result) ->
        expect(result).to.be.false
        done()



