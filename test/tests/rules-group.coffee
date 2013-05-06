#=require ./index

#EXTENDING TESTS
describe "Group validation rules", ->

  form = null

  beforeEach ->
    form = $("form")
    form.verify(skipHiddenFields: false)


  describe "'requireAll' rule", ->

    beforeEach ->
      $('#fixtures').html """
        <div data-demo>
          <form>
            <input name="field1" value="abc" data-validate="validator1">
            <input name="field2" value="efg" data-validate="validator2">
            <input name="field3" value="def">
            <input class="submit" type="submit"/>
          </form>
        </div>
      """



