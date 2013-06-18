fs = require("fs")
fetchUrl = require("fetch").fetchUrl

module.exports = (grunt) ->

  #build plugins
  grunt.loadNpmTasks "grunt-contrib-concat"
  grunt.loadNpmTasks "grunt-contrib-jshint"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks "grunt-contrib-copy"
  grunt.loadNpmTasks "grunt-wrap"
  #test plugins
  grunt.loadNpmTasks "grunt-mocha"
  grunt.loadNpmTasks "grunt-contrib-connect"
  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-templater"

  # Load local tasks
  grunt.task.loadTasks './tasks'

  #file lists
  files = [
    "src/vendor/jquery.console.js"
    "src/helper/*.js"
    "src/modules/*.js"
    "src/rules/core/core.js"
    "src/rules/numeric/numeric.js"
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
        src: "http://notifyjs.com/dist/notify-combined.js"
        dest: "src/vendor/notify.js"

      console:
        src: "http://jpillora.github.com/jquery.console/jquery.console.js"
        dest: "src/vendor/jquery.console.js"

    concat:
      options:
        stripBanners: true
      dist:
        src: files
        dest: "dist/<%= pkg.name %>.js"
      distNotify:
        src: ["src/vendor/notify.js"].concat(files)
        dest: "dist/<%= pkg.name %>.notify.js"

    wrap:
      dist:
        src: ['dist/*.js']
        dest: '.'
        wrapper: ["""
                  <%= banner %>
                  (function(window,document,$,undefined) {
                  """,
                  """
                  }(window,document,jQuery));
                  """]

    uglify:
      options:
        stripBanners: true
        banner: '<%= banner %>'

      dist:
        src: "dist/<%= pkg.name %>.js"
        dest: "dist/<%= pkg.name %>.min.js"

      distNotify:
        src: "dist/<%= pkg.name %>.notify.js"
        dest: "dist/<%= pkg.name %>.notify.min.js"

    watch:
      default:
        files: ['src/**/*.js']
        tasks: 'default'
        options:
          interval: 5000
      test:
        files: 'test/tests/*.coffee'
        tasks: 'test'
        options:
          interval: 5000

    jshint:
      build: [
        "src/*.js"
      ]
      rules: [
        "src/rules/*/*.js"
        "src/rules/*/lang/*.js"
      ]

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
          moment: true
          guid: true
          TypedSet: true
          Set: true
          Class: true
          console: true

    copy:
      rules:
        files: [{
          expand: true
          cwd: 'src/'
          src: 'rules/**/*.js'
          dest: 'dist/'
        }]

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
          expand: grunt.file.expand
          read: grunt.file.read
          parse: JSON.parse
    mocha:
      test:
        options:
          urls: ["http://localhost:61000/test/build/runner.html"]
          run: true

  #task groups
  grunt.registerTask "build", ["jshint:build","concat","wrap","uglify"]
  grunt.registerTask "rules", ["jshint:rules","dox","copy:rules"]
  grunt.registerTask "test", ["coffee:test","template:runner","connect","mocha:test"]
  grunt.registerTask "default", ["build","rules","test"]
