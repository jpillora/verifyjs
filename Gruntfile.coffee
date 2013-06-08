fs = require("fs")
fetchUrl = require("fetch").fetchUrl

#global module:false
module.exports = (grunt) ->

  #build plugins
  grunt.loadNpmTasks "grunt-contrib-concat"
  grunt.loadNpmTasks "grunt-contrib-jshint"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks "grunt-wrap"
  #test plugins
  grunt.loadNpmTasks "grunt-mocha"
  grunt.loadNpmTasks "grunt-contrib-connect"
  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-templater"

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
      notify:
        src: "https://raw.github.com/jpillora/notifyjs/master/dist/notify-combined.js"
        dest: "src/vendor/notify.js"

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
        src: ["src/vendor/notify.js"].concat(files)
        dest: "dist/<%= pkg.name %>.notify.js"

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
        src: "dist/<%= pkg.name %>.notify.js"
        dest: "dist/<%= pkg.name %>.notify.min.js"

    watch:
      default:
        files: 'src/**/*.js'
        tasks: 'default'
        options:
          interval: 5000
      test:
        files: 'test/tests/*.coffee'
        tasks: 'test'
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

    #test tasks
    coffee:
      test:
        options:
          bare: true
        expand: true
        flatten: true
        cwd: 'test/tests/'
        src: ['*.coffee']
        dest: 'test/build/'
        ext: '.js'

    connect:
      test:
        options:
          port: 61000

    template:
      runner:
        src: 'test/runner.html.ejs',
        dest: 'test/build/runner.html',
        variables:
          libs: fs.readdirSync 'test/lib/'
          tests: fs.readdirSync 'test/build/'

    mocha:
      test:
        options:
          urls: ["http://localhost:61000/test/build/runner.html"]
          run: true

  #task groups
  grunt.registerTask "build", ["jshint","concat","wrap","uglify"]
  grunt.registerTask "test", ["coffee:test","template:runner","connect","mocha:test"]
  grunt.registerTask "default", ["build","test"]
