module.exports = function(grunt) {

    // Load Grunt tasks declared in the package.json file
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Configure Grunt
    grunt.initConfig({

        // Watch
        watch: {
            sass: {
                files: ['sass/*.scss'],
                tasks: ['sass']
            }
        },

        // Compile Sass
        sass: {
            dist: {
                options: {
                    style: 'expanded'
                },
                files: {
                    'public/css/main.css': 'sass/main.scss'
                }
            }
        }

    });

    grunt.registerTask('default', ['sass', 'watch']);
};
