'use strict';

var fs = require('fs');
var jsonminify = require('jsonminify');

var browsers = [
    'last 2 versions',
	'ie 8',
    'ie 9',
    'ie 10',
    'Firefox ESR',
    'Opera 12.1'
];

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        meta: {
            banner: '\n/*!\n * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("dd.mm.yyyy") %>\n' +
                ' * <%= pkg.homepage %>\n' +
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>, <%= _.pluck(pkg.contributors, "name").join(", ") %>\n' +
                ' * Licensed under the <%= pkg.license %> license\n */\n\n'
        },

        browserify: {
            options: {
                browserifyOptions: {
                    fullPaths: false
                },
                banner: '<%= meta.banner %>'
            },
            dev_demo: {
                options: {
                    browserifyOptions: {
                        debug: true
                    },
                    keepAlive: true,
                    watch: true
                },
                src: 'src/js/shariff.js',
                dest: 'demo/app.min.js'
            },
            dist_complete_min: {
                options: {
                    transform: [ 
						['uglifyify', { global: true } ] ,
						['envify', config('js')]
					],
                },
                src: 'src/js/shariff.js',
                dest: 'build/shariff.complete.js'
            },
            dist_min: {
                options: {
                    transform: [
                        ['uglifyify', { global: true } ],
                        ['browserify-shim', { global: true } ],
						['envify', config('js')]
                    ]
                },
                src: 'src/js/shariff.js',
                dest: 'build/shariff.min.js'
            },
            demo: {
                options: {
                    transform: [ 
						['uglifyify', { global: true } ] ,
						['envify', config('js')]
					],
                    watch: true
                },
                src: 'src/js/shariff.js',
                dest: 'demo/app.min.js'
            }
        },

        copy: {
            demo: {
                files: [
                    {
                        expand: true,
                        cwd: 'node_modules/font-awesome',
                        src: '{fonts,css}/*',
                        dest: 'demo/'
                    },
                    {
                        src: 'build/*',
                        dest: 'demo/'
                    }
                ]
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            files: [
                'src/js/*.js',
                'src/js/services/*.js'
            ]
        },

        less: {
            options: {
                banner: '<%= meta.banner %>',
                paths: [
                    'node_modules/font-awesome/less',
                    'node_modules/shariff/src/style'
                ],
                plugins: [
                    new (require('less-plugin-autoprefix'))({browsers: browsers}),
                    new (require('less-plugin-clean-css'))({keepSpecialComments: 1})
                ],
                strictMath: true
            },
            demo: {
                options: {
                    modifyVars: {
                        'fa-font-path': config('fontpath_demo'),
						'service': config('css'),
 						'additional': addservice(),
						'services': config('count'),
						'custom': config('custom'),
						'circle': config('circle'),
						'tooltip': config('tooltip')
                   },
                    sourceMap: true,
                    outputSourceFiles: true,
                    sourceMapFileInline: true,
                    plugins: [
                        new (require('less-plugin-autoprefix'))({
                            browsers: browsers,
                            map: true
                        }),
                        new (require('less-plugin-clean-css'))()
                    ],
                },
                src: 'src/style/demo.less',
                dest: 'demo/app.min.css'
            },
            dist: {
                options: {
					modifyVars: {
                        'fa-font-path': config('fontpath'),
						'service': config('css'),
						'additional': addservice(),
						'services': config('count'),
						'custom': config('custom'),
						'circle': config('circle'),
						'tooltip': config('tooltip')
                    }
                },
                src: 'src/style/shariff-complete.less',
                dest: 'build/shariff.complete.css'
            },
            dist_min: {
                options: {
					modifyVars: {
						'service': config('css'),
						'additional': addservice(),
						'services': config('count'),
						'custom': config('custom'),
						'circle': config('circle'),
						'tooltip': config('tooltip')
                    }
                },
                src: 'src/style/shariff.less',
                dest: 'build/shariff.min.css'
            }
        },

        hapi: {
            shariff: {
                options: {
                    server: require('path').resolve('./node_modules/shariff-backend-node/server.js'),
                    // noasync: true,
                }
            }
        },

        connect: {
            demo: {
                options: {
                    hostname: '0.0.0.0',
                    // hostname: 'localhost',
                    port: 8080,
                    base: 'demo',
                    keepalive: true,
                    // livereload: true,
                    // open: true,
                    // debug: true,
                    middleware: function (connect, options, middlewares) {
                        var proxy = require('grunt-connect-proxy/lib/utils').proxyRequest;
                        return [
                            proxy,
                            connect.static(options.base[0]),
                            connect.directory(options.base[0])
                        ];
                    }
                },
                proxies: [
                    {
                        rewrite: {
                            '^/shariff': ''
                        },
                        context: '/shariff/',
                        host: 'localhost',
                        port: 3001,
                        https: false,
                        xforward: false
                    }
                ]
            }
        }
    });
	
	function config(type) {
		var data = fs.readFileSync('config.json', 'utf8', function (err, data) {
			if (err) {
				throw err;
			}
			return data;
		});
		var services_data = fs.readFileSync('services.json', 'utf8', function (err, data) {
			if (err) {
				throw err;
			}
			return data;
		});

		var aviableservices = JSON.parse(services_data);
		var conf = JSON.parse(data);

		if(type === 'count') {
			return conf.services.length;
		}
		if(type === 'fontpath') {
			if(typeof conf.fontpath !== 'undefined') {
				return '"' + conf.fontpath + '"';
			} else {
				return '"https://netdna.bootstrapcdn.com/font-awesome/4.3.0/fonts"';
			}
		}
		if(type === 'fontpath_demo') {
			if(typeof conf.fontpath_demo !== 'undefined') {
				return '"' + conf.fontpath_demo + '"';
			} else {
				return '"https://netdna.bootstrapcdn.com/font-awesome/4.3.0/fonts"';
			}
		}
		if(type === 'custom') {
			if(typeof conf.css !== 'undefined') {
				return '"' + conf.css + '"';
			} else {
				return '""';
			}
		}

		if(type === 'circle') {
			if(typeof conf.circle !== 'undefined' && conf.circle === false) {
				return 'false';
			} else {
				return 'true';
			}
		}

		if(type === 'tooltip') {
			if ( conf.services.indexOf('facebooklike') >= 0 || conf.services.indexOf('googleplusplus') >= 0 ) {
				return 'true';
			} else {
				return 'false';
			}
		}

		var js = {};
		var css = '';
		for(var e in aviableservices) {
			if (aviableservices.hasOwnProperty(e)) {
				var obj = aviableservices[e];
				if(conf.services.indexOf(e) >= 0 && typeof obj.col !== 'undefined') {
					
					js[e] = true;
					
					css += ', ';
					css += e;
					css += ' ' + obj.col;
					if(typeof obj.col_highlighted !== 'undefined') {
						css += ' ' + obj.col_highlighted;
					} else {
						css += ' lighten(' + obj.col + ', @lighten)';
					}
					if(typeof obj.col_counter !== 'undefined') {
						css += ' ' + obj.col_counter;
					} else {
						css += ' darken(' + obj.col + ', @darken)';
					}
					if(typeof obj.col_counterbg !== 'undefined') {
						css += ' ' + obj.col_counterbg;
					} else {
						css += ' lighten(' + obj.col + ', @lighten_bg)';
					}
					if(typeof obj.fa_var !== 'undefined') {
						css += ' ' + obj.fa_var;
					} else {
						css += ' ' + e;
					}
					if(typeof obj.size !== 'undefined') {
						css += ' ' + obj.size;
					} else {
						css += ' 19px';
					}
					if(typeof obj.count !== 'undefined') {
						css += ' true';
					} else {
						css += ' false';
					}
					
					
				} else if (conf.services.indexOf(e) >= 0 && typeof obj.predefined !== 'undefined') {
					js[e] = true;
				} else {
					js[e] = false;
				}
			}
		}

		if(typeof conf.jsonp !== 'undefined' && conf.jsonp === true) {
			js.jsonp = true;
		} else {
			js.jsonp = false;
		}
		
		if(typeof conf.lang !== 'undefined' && conf.lang === false) {
			js.lang = false;
		} else {
			js.lang = true;
		}
		
		if(typeof conf.circle !== 'undefined' && conf.circle === false) {
			js.circle = false;
		} else {
			js.circle = true;
		}
		
		css = css.substring(1);
		
		if( type === 'js' ) {
			return js;
		}
		if( type === 'css' ) {
			return css;
		}
	}
	function addservice() {
		var data = fs.readFileSync('config.json', 'utf8', function (err, data) {
			if (err) {
				throw err;
			}
			return data;
		});

		var conf = JSON.parse(data);

		var add = ['facebooklike', 'googleplusplus', 'info', 'more', 'print'];
		var adds = '';
		
		add.forEach(function(service) {
			if(conf.services.indexOf(service) >= 0) {
				adds += ', ' + service;
			}
		});
		return adds.substring(1);
	}

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-connect-proxy');
    grunt.loadNpmTasks('grunt-hapi');

	grunt.registerTask('l10n', function() {
		var done = this.async();
		
		fs.readFile('src/l10n.json', 'utf8', function (err, data) {
			if (err) {
				throw err;
			}
			var jsonp = 'var shariff_l10n = ' + JSON.minify(data);
			
			fs.writeFile('build/shariff.l10n.js', jsonp, function (err) {
				if (err) {
					throw err;
				}
				done();
			});
		});
	});
    grunt.registerTask('test', ['jshint']);
    grunt.registerTask('build', ['test', 'less:demo', 'less:dist', 'less:dist_min', 'browserify:dist_complete_min', 'browserify:dist_min', 'browserify:demo', 'l10n']);
    grunt.registerTask('demo', ['copy:demo', 'less:demo', 'browserify:demo', 'hapi', 'configureProxies:demo', 'connect']);
    grunt.registerTask('default', ['test', 'demo']);
};
