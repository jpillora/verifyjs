#=require ./index

#EXTENDING TESTS
describe "Extending validation rules", ->

  form = null
  html = """
    <div data-demo>
      <form>
        <input name="field1" value="abc" data-validate="validator1">
        <input name="field2" value="efg" data-validate="validator2">
        <input name="field3" value="def">
        <input class="submit" type="submit"/>
      </form>
    </div>
  """

  #validators used in this spec
  $.verify.addFieldRules
    validator1:
      fn: (r) ->
        return "Must equal '" + r.myVar + "' (not " + r.val() + ")"  if r.val() isnt r.myVar
        true
      myVar: "abc"

    validator2:
      extend: "validator1"
      #validator1.myVar overridden !
      myVar: "def"

    validator3:
      extend: "validator2"
      #validator1.fn overridden !
      #validator2.myVar inherited !
      fn: (r) ->
        myVar2x = r.myVar + r.myVar
        return "Must equal '" + myVar2x + "' (double)"  if r.val() isnt myVar2x
        true

  beforeEach ->
    $('#fixtures').html html
    form = $("form")
    form.verify(skipHiddenFields: false)

  describe "Extending validations - When submitted", ->

    it "extended validator should be invalid", (done) ->
      form.validate (result) ->
        expect(result).to.be.false
        done()

    describe "Make valid", ->

      beforeEach ->
        form.find("input[name=field2]").val "def"

      it "extended validator should be valid", (done) ->
        form.validate (result) ->
          expect(result).to.be.true
          done()

      describe "Enable validator 3", ->

        beforeEach ->
          form.find("input[name=field3]").val("def").attr "data-validate", "validator3"

        it "double extended validator should be invalid", (done) ->
          form.validate (result) ->
            expect(result).to.be.false
            done()

        it "double extended validator should be valid", (done) ->
          form.find("input[name=field3]").val "defdef"
          form.validate (result) ->
            expect(result).to.be.true
            done()




