module.exports = (grunt) ->
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