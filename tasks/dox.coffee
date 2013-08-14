
dox = require "dox"
path = require "path"

module.exports = (grunt) ->

  grunt.registerTask "dox", "Dox stuff.", ->
    
    results = []

    #for each rule namespace
    for dir in grunt.file.expand 'src/rules/*'

      namespace = /([^\/]+)$/.test(dir) and RegExp.$1
      main = path.join dir, "#{namespace}.js"

      continue unless grunt.file.exists main

      result = 
        namespace: namespace
        rules:[]
        dependencies:[]
        langs: grunt.file.expand("#{dir}/lang/*")

      #load main file
      code = grunt.file.read main
      rules = dox.parseComments code

      continue unless rules and rules.length

      #rules found, do transform
      for meta in rules

        rule = { namespace, params: [], tests: { valids: [], invalids: [] } }
        continue unless meta.tags

        for t in meta.tags
          result.dependencies.push t.string if t.type is 'require'
          #name required!
          rule.name = t.string if t.type is 'name'
          continue unless rule.name
          rule.type = t.types[0] if t.type is 'type'
          rule.tests.valids.push t.string if t.type is 'valid'
          rule.tests.invalids.push t.string if t.type is 'invalid'
          if t.type is 'param'
            rule.params.push {
              name: t.name
              type: t.types[0]
              description: t.description
            }


        rule.description = meta.description?.full
        rule.code = meta.code

        result.rules.push rule

      results.push result

    grunt.file.write 'dist/rules/manifest.json', JSON.stringify results, null, 2
