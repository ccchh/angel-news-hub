module.exports = function(grunt) {
  "use strict";

  grunt.initConfig({
    uglify: {
      options: {
        sourceMap: 'static/js/source-map.js',
        sourceMapRoot: "",
        sourceMappingURL: 'static/js/source-map.js'
      },
      build: {
        src: ['static/js/**/**.js', '!static/js/angel-news-hub.min.js'],
        dest: 'static/js/angel-news-hub.min.js'
      }
    },

    jshint: {
      test: {
        src: ['static/js/**.js', 'modules/**/*.js', 'app.js', '!static/js/bootstrap/*', '!static/js/*.min.js', '!static/js/source-map.js']
      }
    },

    less: {
      dev: {
        files: {
          "static/css/styles.css": "static/less/styles.less",
          "static/css/bootstrap.css": "static/less/bootstrap/bootstrap.less"
        }
      },
      production: {
        options: {
          yuicompress: true
        },
        files: {
          "static/css/styles.min.css": "static/less/styles.less"
        }
      }
    },

    watch: {
      dev: {
        files: ['app.js', 'static/js/**/*.js', 'modules/**/*.js', 'static/less/**/*.less', '!*.css', '**/*.jade', 'static/**/*.html', '**/*.json', '!node_modules/'],
        tasks: ['less', 'jshint:test'],
        options: {
          livereload: true,
        },
      },
    }
  });


  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-notify');

  // JS distribution task.
  grunt.registerTask('default', ['jshint:test', 'less:dev', 'watch:dev']);
  grunt.registerTask('css', ['less:dev']);

};
