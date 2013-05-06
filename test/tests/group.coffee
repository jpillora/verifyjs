#=require ./index

#BASIC TESTS
describe "Group validations (Simple)", ->

  runCount = 0
  form = null
  html = """
    <div data-demo>
      <form>
        <input name="f1" value="abc" data-validate="testGroup#1">
        <input name="f2" value="def" data-validate="testGroup#2">
        <input name="f3" value="xyz">
        <input class="submit" type="submit"/>
      </form>
    </div>
  """

  #validators used in this spec
  $.verify.addGroupRules
    testGroup: (r) ->
      runCount++
      return "1 should be abc" unless r.val("1") is "abc"
      return "2 should be def" unless r.field("2").val() is "def"
      return true

  beforeEach ->
    $('#fixtures').html html
    runCount = 0
    form = $("form")
    form.verify(skipHiddenFields: false)

  describe "Group validations (Simple) - Group count", ->
    it "should have 1 group", ->
      obj = form.data("verify")
      expect(_.size(obj.groups)).to.equal 1
      expect(obj.groups.testGroup).to.exist

  describe "Group validations (Simple) - When submitted (simple)", ->
    it "should be valid", (done) ->
      form.validate (result) ->
        expect(result).to.be.true
        expect(runCount).to.equal 1
        done()

    it "should be invalid", (done) ->
      #make invalid
      form.find("input:first").val "blah!"
      form.validate (result) ->
        expect(result).to.be.false
        expect(runCount).to.equal 1
        done()

  null
