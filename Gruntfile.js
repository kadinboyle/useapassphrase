module.exports = function(grunt) {

  grunt.initConfig({
    inline: {
      dist: {
        src: 'index.html',
        dest: 'dist/index.html'
      }
    },
    assemble: {
      options: {
        marked: {
          breaks: false,
          gfm: true,
          },
          noEscape:true,
      },
      site: {
        src: ['dist/index.html'],
        dest: 'dist/index.html'
      }
    }
  });

  grunt.loadNpmTasks('grunt-inline');
  grunt.loadNpmTasks('grunt-assemble');

  grunt.registerTask('default', ['inline', 'assemble']);

};
