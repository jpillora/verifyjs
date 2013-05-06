#=require ./index

#BASIC TESTS
describe "Validation rules", ->

  form = null
  html = """
    <div data-demo>
      <form>
        <input id='required' data-validate='required'>
        <input id='number' data-validate='number'>

        <input id='phone' data-validate='phone'>
        <input id='currency' data-validate='currency'>

        <input name='multiRequired' id='multiRequired' data-validate='required,number'>
        <input name='multiOptional' id='multiOptional' data-validate='phone,number'>

        <input name='minMax' id='minMax' data-validate='min(3),max(5)'/>

        <input class='submit' type='submit'/>
      </form>
    </div>
  """

  beforeEach ->
    $('#fixtures').html html
    form = $("form")
    form.verify(skipHiddenFields: false)

  afterEach ->
    form.verify(false)

  describe "number", ->
    it "should be a number", (done) ->
      $('#number').val('X').validate (result) ->
        expect(result).to.be.false
        done()

    it "should be valid", (done) ->
      $('#number').val('42').validate (result) ->
        expect(result).to.be.true
        done()

  describe "required", ->
    it "should be required", (done) ->
      $('#required').validate (result) ->
        expect(result).to.be.false
        done()

    it "should be valid", (done) ->
      $('#required').val('X').validate (result) ->
        expect(result).to.be.true
        done()

  describe "phone (aus)", ->

    it "should start with 0", (done) ->
      $('#phone').val('1299998888').validate (result) ->
        expect(result).to.be.false
        done()

    it "should be 10 chars", (done) ->
      $('#phone').val('099998888').validate (result) ->
        expect(result).to.be.false
        done()

    it "should be valid", (done) ->
      $('#phone').val('0299998888').validate (result) ->
        expect(result).to.be.true
        done()


  describe "multiple", ->

    it "should be invalid (required)", (done) ->
      $('#multiRequired').validate (result) ->
        expect(result).to.be.false
        done()

    it "should be invalid (number)", (done) ->
      $('#multiRequired').val('hello').validate (result) ->
        expect(result).to.be.false
        done()

    it "should be valid", (done) ->
      $('#multiRequired').val('42').validate (result) ->
        expect(result).to.be.true
        done()

    it "should be invalid (NOT required but is word)", (done) ->
      $('#multiOptional').val('hello').validate (result) ->
        expect(result).to.be.false
        done()

    # it "should be valid (NOT required)", (done) ->
    #   form.verify skipNotRequired: true
    #   $('#multiOptional').validate (result) ->
    #     expect(result).to.be.true
    #     done()

  describe "min-max chars", ->

    it "should be invalid (min)", (done) ->
      $('#minMax').val('aa').validate (result) ->
        expect(result).to.be.false
        done()

    it "should be invalid (max)", (done) ->
      $('#minMax').val('aaaaaa').validate (result) ->
        expect(result).to.be.false
        done()

    it "should be valid", (done) ->
      $('#minMax').val('aaaa').validate (result) ->
        expect(result).to.be.true
        done()

