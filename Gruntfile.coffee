fs = require("fs")
fetchUrl = require("fetch").fetchUrl

#global module:false
module.exports = (grunt) ->
  
  #write out a manifest of all the tests
  tests = []
  fs.readdirSync("test/tests/").forEach (t) ->
    tests.push "tests/" + t

  fs.writeFileSync "test/specs.json", JSON.stringify(tests)
  
  #file lists
  files = [
    "src/vendor/jquery.console.js"
    "src/helper/*.js"
    "src/modules/*.js"
    "src/<%= pkg.name %>.rules.js"
  ]  
  # Project configuration.
  grunt.initConfig
    pkg: grunt.file.readJSON('component.json')
    banner: 
      "/** <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today(\"yyyy/mm/dd\") %>\n"+
      " * <%= pkg.homepage %>\n" +
      " * Copyright (c) <%= grunt.template.today(\"yyyy\") %> <%= pkg.author.name %> - MIT\n"+
      " */\n"
    webget:
      prompt:
        src: "http://jpillora.github.com/jquery.prompt/dist/jquery.prompt.js"
        dest: "src/vendor/jquery.prompt.js"

      console:
        src: "http://jpillora.github.com/jquery.console/jquery.console.js"
        dest: "src/vendor/jquery.console.js"

    concat:
      options: 
        stripBanners: true
          # 
      dist:
        src: files
        dest: "dist/<%= pkg.name %>.js"

      distPrompt:
        src: ["src/vendor/jquery.prompt.js"].concat(files)
        dest: "dist/<%= pkg.name %>.prompt.js"

    wrap: 
      dist: 
        src: ['dist/*.js']
        dest: '.'
        wrapper: ["<%= banner %>\n(function(window,document,undefined) {\n","\n}(window,document));"]
    
    uglify:
      options: 
        stripBanners: true
        banner: '<%= banner %>' 
      
      dist:
        src: "dist/<%= pkg.name %>.js"
        dest: "dist/<%= pkg.name %>.min.js"

      distPrompt:
        src: "dist/<%= pkg.name %>.prompt.js"
        dest: "dist/<%= pkg.name %>.prompt.min.js"

    watch:
      scripts:
        files: 'src/**/*.js'
        tasks: 'default'
        options:
          interval: 5000

    jshint:
      all: ["src/*.js"]

      options:
        eqeqeq: true
        immed: true
        latedef: true
        newcap: true
        noarg: true
        sub: true
        undef: true
        boss: true
        eqnull: true
        browser: true
        globals:
          require: true
          jQuery: true
          ParamParser: true
          guid: true
          TypedSet: true
          Set: true
          Class: true
          console: true

    mocha:
      all: ["test/**/*.html"]

  grunt.loadNpmTasks "grunt-contrib-concat"
  grunt.loadNpmTasks "grunt-contrib-jshint"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks "grunt-wrap"
  grunt.loadNpmTasks "grunt-mocha"
  
  # Fetcher task
  grunt.registerMultiTask "webget", "Web get stuff.", ->
    done = @async()
    name = @target
    src = @data.src
    dest = @data.dest
    grunt.log.writeln "Web Getting: '" + name + "'"
    fetchUrl src, (error, meta, body) ->
      if error
        grunt.log.writeln "Error: '" + error + "'"
        done false
        return
      grunt.log.writeln "Saved: '" + src + "' as '" + dest + "'"
      fs.writeFileSync dest, body
      done true

  # Default task.           webget  
  grunt.registerTask "default", "jshint concat wrap uglify mocha".split(' ')
