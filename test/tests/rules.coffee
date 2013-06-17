#BASIC TESTS
describe "Validation rules", ->

  form = null
  field = null
  html = """
    <div data-demo>
      <form>
        <input id='field' data-validate=''>
        <input class='submit' type='submit'/>
      </form>
    </div>
  """

  beforeEach ->
    $('#fixtures').html html
    form = $("form")
    field = $("#field")
    form.verify(skipHiddenFields: false)

  afterEach ->
    form.verify(false)

  #create tests
  _.each MANIFEST, (obj) ->
    describe "rule set #{obj.namespace}", ->
      _.each obj.rules, (rule) ->
        console.log "creating tests for #{rule.name}"
        describe "rule #{rule.name}", ->
          #tests
          _.each ['valids','invalids'], (type) ->

            t = type.substr(0,type.length-1)

            _.each rule.tests[type], (testcase) ->
              m = testcase.match ///
                ^
                (
                \(
                ([^\)]+)
                \)
                )?
                (.*)$
              ///
              unless m
                console.warn "invalid testcase #{testcase}"
                return

              params = m[2]
              value = m[3]

              console.log "creating #{t} test case: (#{params}) = #{value}"

              it "'#{value}' should be #{t}", (done) ->
                field.attr('data-validate', "#{rule.name}(#{params})")
                field.val(value)
                field.validate (result) ->
                  expect(result).to.equal t is 'valid'
                  done()

