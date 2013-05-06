#=require ./index

#BASIC TESTS
describe "Group validations (Ajax)", ->

  form = null
  html = """
    <div data-demo>
      <form>
        <input name="f1" value="abc" data-validate="testGroupAjax#1">
        <input name="f2" value="def" data-validate="testGroupAjax#2">
        <input name="f3" value="xyz">
        <input class="submit" type="submit"/>
      </form>
    </div>
  """

  $ajax = $.ajax
  stubAjax = ->
    $.ajax = (o) ->
      setTimeout ->
        o.success result: true
      , 0
  unstubAjax = ->
    $.ajax = $ajax

  #validators used in this spec
  $.verify.addGroupRules
    testGroupAjax: (r) ->
      r.ajax
        url: './data/pass.json'
        success: (data) ->
          r.callback data.result || 'Failed'

  beforeEach ->
    $('#fixtures').html html
    runCount = 0
    form = $("form")
    form.verify()
    stubAjax()

  afterEach ->
    unstubAjax()

  describe "Group validations (Ajax) - When submitted", ->
    it "should be valid", (done) ->
      input = $("input").first()
      #silent error, since group not ready
      input.validate (result) ->
        expect(result).to.be.false
        #group ready, validate success
        input.next().validate (result) ->
          expect(result).to.be.true
          done()

  null
