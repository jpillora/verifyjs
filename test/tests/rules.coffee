#BASIC TESTS
describe "Validation rules", ->

  form = null
  field = null
  html = """
    <div data-demo>
      <form>
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

  #create tests
  _.each MANIFEST, (obj) ->
    describe "rule-namespace: '#{obj.namespace}'", ->
      _.each obj.rules, (rule) ->
        # console.log "creating tests for #{rule.name}"
        describe "rule: '#{rule.name}'", ->
          #tests
          _.each ['valids','invalids'], (type) ->
            t = type.substr(0,type.length-1)
            _.each rule.tests[type], (testcase) ->
              params = ''
              fields = []
              value = testcase.replace /#(\w+)\(([^\)]+)\)/g, (str,name,value) ->
                if name is 'params'
                  params = value
                else
                  fields.push {name,value}
                ''

              value = value.replace /^\s+|\s+$/g,''
              if value or fields.length is 0
                fields.push {name:null, value}
              
              params = "(#{params})" if params

              it "'#{testcase}' should be #{t}", (done) ->

                _.each fields, (f) ->
                  field = $("<input/>")
                  id = if f.name then "##{f.name}" else ""
                  field.attr('data-validate', "required,#{rule.name}#{id}#{params}")
                  field.val(f.value)
                  form.prepend field

                # form.attr 'id', rule.name
                # console.log form[0]

                form.validate (result) ->
                  expect(result).to.equal t is 'valid'
                  done()

