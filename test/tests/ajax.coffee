#=require ./index

#AJAX TESTS
describe "Ajax validations", ->

  form = null
  html = """
    <div data-demo>
      <form>
        <input name="field" value="abc" data-validate="testAjax">
        <input class="submit" type="submit"/>
      </form>
    </div>
  """

  #ajax test validator
  $.verify.addFieldRules
    testAjax:
      fn: (r) ->

        setTimeout ->
          if r.val() is "def"
            r.callback(true);
          else
            r.callback("My ajax test failed!")
        , 0
        `undefined`

  beforeEach ->
    $('#fixtures').html html
    form = $("form")
    form.verify(skipHiddenFields: false)

  describe "On submission", ->
    #valid test
    it "should be invalid", (done) ->
      form.validate (result) ->
        expect(result).to.be.false
        done()

    #invalid test
    it "should be valid", (done) ->
      #make invalid
      $("input:first").val("def")
      form.validate (result) ->
        expect(result).to.be.true
        done()



