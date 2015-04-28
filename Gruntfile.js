module.exports = function (grunt) {

  // load plugins
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-bump');

  // project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      lintFiles: grunt.file.expand(['Gruntfile.js', 'bin/postman', 'lib/**/*.js', 'test/**/*.js']),
      testFiles: grunt.file.expand(['test/**/*.js'])
    },

    bump: {
      options: {
        pushTo: 'origin'
      }
    },

    // Configure a mochaTest task
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          captureFile: 'build/results.txt',
          quiet: false,
          clearRequireCache: false
        },
        src: '<%= meta.testFiles %>'
      }
    },

    jshint: {
      files: '<%= meta.lintFiles %>',
      options: {
        jshintrc: '.jshintrc'
      }
    },

    jscs: {
      src: '<%= meta.lintFiles %>',
    }

  });

  grunt.registerTask('before-test', ['jshint', 'jscs']);
  grunt.registerTask('test', ['mochaTest']);

  // release task
  grunt.registerTask('release', 'bump version, build, commit, tag, push', function (versionType) {
    grunt.task.run(['bump-only:' + (versionType || ''), 'default', 'bump-commit']);
  });

  // Default task.
  grunt.registerTask('default', ['before-test', 'test']);

};
