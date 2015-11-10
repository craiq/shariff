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
	var gcfg = {
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
						['uglifyify', { global: true } ]
					],
                },
                src: 'src/js/shariff.js',
                dest: 'build/shariff.complete.js'
            },
            dist_min: {
                options: {
                    transform: [
                        ['uglifyify', { global: true } ],
                        ['browserify-shim', { global: true } ]
                    ]
                },
                src: 'src/js/shariff.js',
                dest: 'build/shariff.min.js'
            },
            demo: {
                options: {
                    transform: [ 
						['uglifyify', { global: true } ]
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
                    }
                },
                src: 'src/style/shariff-complete.less',
                dest: 'build/shariff.complete.css'
            },
            dist_min: {
                options: {
					modifyVars: {
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
    }
	
	var data = fs.readFileSync('config.json', 'utf8', function (err, data) {
		if (err) {
			console.log('Error in config.json');
			throw err;
		}
		return data;
	});
	var services_data = fs.readFileSync('services.json', 'utf8', function (err, data) {
		if (err) {
			console.log('Error in services.json');
			throw err;
		}
		return data;
	});

	var aviableservices = JSON.parse(services_data);
	var conf = JSON.parse(data);
	
	var lde = gcfg.less.demo.options.modifyVars;
	var ld = gcfg.less.dist.options.modifyVars;
	var ldm = gcfg.less.dist_min.options.modifyVars;

	var js = {};
	var css = '';
	for(var e in aviableservices) {
		if (aviableservices.hasOwnProperty(e)) {
			var obj = aviableservices[e];
			if(conf.services.indexOf(e) >= 0) {
				
				js[e] = true;
				var grey = false;
				if(typeof obj.col === 'undefined') {
					grey = true;
					obj.col = '#fff';
				}
				css += ', ';
				css += e; // 1
				css += ' ' + obj.col; // 2
				if(typeof obj.col_highlighted !== 'undefined') { // 3
					css += ' ' + obj.col_highlighted;
				} else {
					css += ' lighten(' + obj.col + ', @lighten)';
				}
				if(typeof obj.col_counter !== 'undefined') { // 4
					css += ' ' + obj.col_counter;
				} else {
					css += ' darken(' + obj.col + ', @darken)';
				}
				if(typeof obj.col_counterbg !== 'undefined') { // 5
					css += ' ' + obj.col_counterbg;
				} else {
					css += ' lighten(' + obj.col + ', @lighten_bg)';
				}
				if(typeof obj.symbol_name !== 'undefined') { // 6
					css += ' ' + obj.symbol_name;
				} else {
					css += ' ' + e;
				}
				if(typeof obj.symbol_code !== 'undefined') { // 7
					if ( obj.symbol_code.charAt(0) !== '@') {
					css += ' "\\' + obj.symbol_code + '"';
					} else {
						css += obj.symbol_code;
					}
				} else { 
					if( typeof obj.symbol_name !== 'undefined' ) {
						css += ' @fa-var-' + obj.symbol_name;
					} else {
						css += ' @fa-var-' + e;
					}
				}
				if(typeof obj.size !== 'undefined') { // 8
					css += ' ' + obj.size;
				} else if ( typeof conf.font !== 'undefined' && typeof conf.font.size !== 'undefined' ) {
					css += ' ' + conf.font.size;
				} else {
					css += ' 19px';
				}
				if(typeof obj.count !== 'undefined') { // 9
					css += ' true';
				} else {
					css += ' false';
				}
				if(grey) { // 10
					css += ' true';
				} else {
					css += ' false';
				}
				if(typeof obj.symbol2 !== 'undefined') {
					var symbol = obj.symbol2;
					if ( symbol.charAt(0) !== '@') {
						symbol = '"\\' + symbol + '"';
					}
					lde[e + '_symbol'] = ld[e + '_symbol'] = ldm[e + '_symbol'] = symbol;
				}
				
				
			} else if (conf.services.indexOf(e) >= 0 && typeof obj.predefined !== 'undefined') {
				js[e] = true;
			} else {
				js[e] = false;
			}
		}
	}

// CSS
	lde.services = 
	ld.services = 
	ldm.services = conf.services.length;

	css = css.substring(1);
	lde.service = ld.service = ldm.service = css;

	var add = ['facebooklike', 'googleplusplus', 'more', 'print'];
	var adds = '';
	
	add.forEach(function(service) {
		if(conf.services.indexOf(service) >= 0) {
			adds += ', ' + service;
		}
	});
	
	lde.additional = ld.additional = ldm.additional = adds.substring(1);
		
	if ( typeof conf.font !== 'undefined' ) {
		if ( typeof conf.font.path !== 'undefined') {
			lde['fa-font-path'] = 
			ld['fa-font-path'] = 
			ldm['fa-font-path'] = '"' + conf.font.path + '"';
		}
		if ( typeof conf.font.path_demo !== 'undefined') {
			lde['fa-font-path'] = '"' + conf.font.path_demo + '"';
		}
	
		if ( typeof conf.font.file !== 'undefined' && typeof conf.font.type !== 'undefined'  && typeof conf.font.family !== 'undefined' ) {
			lde.fontfam = ld.fontfam = ldm.fontfam = conf.font.family;
			var fontsrc = '';
			var fontsrc_demo = '';
			var path = '';
			var path_demo = '';
			if ( typeof conf.font !== 'undefined' && typeof conf.font.path !== 'undefined' ) {
				path = conf.font.path;
			} else {
				path = '.../fonts';
			}
			if ( typeof conf.font !== 'undefined' && typeof conf.font.path_demo !== 'undefined' ) {
				path_demo = conf.font.path_demo;
			} else {
				path_demo = path;
			}
			if ( conf.font.type.eot === true ) {
				ld['font-src-eot'] = ldm['font-src-eot'] = "url('" + path + "/" + conf.font.file + ".eot')";
				lde['font-src-eot'] = "url('" + path_demo + "/" + conf.font.file + ".eot')";
				
				fontsrc += ",url('" + path + "/" + conf.font.file + ".eot?#iefix') format('embedded-opentype')";
				fontsrc_demo += ",url('" + path_demo + "/" + conf.font.file + ".eot?#iefix') format('embedded-opentype')";
			}
			if ( conf.font.type.woff2 === true ) {
				fontsrc += ",url('" + path + "/" + conf.font.file + ".woff2') format('woff2')";
				fontsrc_demo += ",url('" + path_demo + "/" + conf.font.file + ".woff2') format('woff2')";
			}
			if ( conf.font.type.woff === true ) {
				fontsrc += ",url('" + path + "/" + conf.font.file + ".woff') format('woff')";
				fontsrc_demo += ",url('" + path_demo + "/" + conf.font.file + ".woff') format('woff')";
			}
			if ( conf.font.type.ttf === true ) {
				fontsrc += ",url('" + path + "/" + conf.font.file + ".ttf') format('truetype')";
				fontsrc_demo += ",url('" + path_demo + "/" + conf.font.file + ".ttf') format('truetype')";
			}
			if ( typeof conf.font.type.svg === 'string') {
				fontsrc += ",url('" + path + "/" + conf.font.file + ".svg?#" + conf.font.type.svg + "') format('truetype')";
				fontsrc_demo += ",url('" + path_demo + "/" + conf.font.file + ".svg?#" + conf.font.type.svg + "') format('truetype')";
			}
			
			fontsrc = fontsrc.substring(1);
			fontsrc_demo = fontsrc_demo.substring(1);
			
			ld['font-src'] = ldm['font-src'] = fontsrc;
			lde['font-src'] = fontsrc_demo;
		}
		
		if ( typeof conf.font.prefix !== 'undefined' ) {
			lde.cssprefix = ld.cssprefix = ldm.cssprefix = conf.font.prefix;
		}
	}
	
	if(typeof conf.css !== 'undefined') {
		lde.custom =
		ld.custom =
		ldm.custom = '"' + conf.css + '"';
	}

	if(typeof conf.circle !== 'undefined' && conf.circle === false) {
		lde.circle = 
		ld.circle = 
		ldm.circle = false;
	}
				
	if ( conf.services.indexOf('facebooklike') >= 0 || conf.services.indexOf('googleplusplus') >= 0 ) {
		lde.tooltip = 
		ld.tooltip = 
		ldm.tooltip = true;
	}

// Javascript
	if(typeof conf.font !== 'undefined' && typeof conf.font.prefix !== 'undefined') {
		js.cssprefix = conf.font.prefix;
	} else {
		js.cssprefix = 'fa';
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
	
	if ( typeof conf.default_services !== 'undefined' && conf.default_services.length > 0 ) {
		js.defs = conf.default_services;
	} else {
		js.defs = ['twitter', 'facebook', 'googleplus', 'info'];
	}
	
	gcfg.browserify.dist_complete_min.options.transform.push(['envify', js]);
	gcfg.browserify.dist_min.options.transform.push(['envify', js]);
	gcfg.browserify.demo.options.transform.push(['envify', js]);

    grunt.initConfig(gcfg);
	
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
