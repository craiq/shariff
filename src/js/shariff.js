'use strict';

/*globals shariff_l10n */

if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, ''); 
  };
}

if (!Object.keys) {
  Object.keys = function(obj) {
    var keys = [];

    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        keys.push(i);
      }
    }

    return keys;
  };
}

var $ = require('jquery');
var url = require('url');

var Shariff = function(element, options) {
    var self = this;
	
    // the DOM element that will contain the buttons
    this.element = element;

    // Ensure elemnt is empty
    $(element).empty();

    this.options = $.extend({}, this.defaults, options, $(element).data());

    // available services. /!\ Browserify can't require dynamically by now.
    var availableServices = [];
	
	if(process.env.addthis) {
		availableServices.push(require('./services/addthis'));
	}
	if(process.env.facebook) {
		availableServices.push(require('./services/facebook'));
	}
	if(process.env.facebooklike) {
		availableServices.push(require('./services/facebooklike'));
	}
	if(process.env.googleplus) {
		availableServices.push(require('./services/googleplus'));
	}
	if(process.env.googleplusplus) {
		availableServices.push(require('./services/googleplusplus'));
	}
	if(process.env.print) {
		availableServices.push(require('./services/print'));
	}
	if(process.env.xing) {
		availableServices.push(require('./services/xing'));
	}
	if(process.env.linkedin) {
		availableServices.push(require('./services/linkedin'));
	}
	if(process.env.flattr) {
		availableServices.push(require('./services/flattr'));
	}
	if(process.env.info) {
		availableServices.push(require('./services/info'));
	}
	if(process.env.mail) {
		availableServices.push(require('./services/mail'));
	}
	if(process.env.pinterest) {
		availableServices.push(require('./services/pinterest'));
	}
	if(process.env.reddit) {
		availableServices.push(require('./services/reddit'));
	}
	if(process.env.tumblr) {
		availableServices.push(require('./services/tumblr'));
	}
	if(process.env.twitter) {
		availableServices.push(require('./services/twitter'));
	}
	if(process.env.whatsapp) {
		availableServices.push(require('./services/whatsapp'));
	}
	if(process.env.diaspora) {
		availableServices.push(require('./services/diaspora'));
	}
	if(process.env.stumbleupon) {
		availableServices.push(require('./services/stumbleupon'));
	}
	if(process.env.bitcoin) {
		availableServices.push(require('./services/bitcoin'));
	}
	if(process.env.more) {
		availableServices.push(require('./services/more'));
	}
	
    // filter available services to those that are enabled and initialize them
    this.services = $.map(this.options.services, function(serviceName) {
        var service;
		$.each(availableServices, function(key, availableService) {
            availableService = availableService(self);
            if (availableService.name === serviceName) {
                service = availableService;
				if (process.env.lang && typeof shariff_l10n !== 'undefined') {
					if (typeof shariff_l10n.share !== 'undefined' && service.shareText.en === 'share') {
						$.extend(service.shareText, shariff_l10n.share.shareText);
					}
					if (typeof shariff_l10n[serviceName] !== 'undefined') {
						if (typeof shariff_l10n[serviceName].shareText !== 'undefined' && typeof service.shareText !== 'string') {
							$.extend(service.shareText, shariff_l10n[serviceName].shareText);
						}
						if (typeof shariff_l10n[serviceName].title !== 'undefined' && typeof service.title !== 'string') {
							$.extend(service.title, shariff_l10n[serviceName].title);
						}
						if (typeof shariff_l10n[serviceName].desc !== 'undefined' && typeof service.desc !== 'undefined' && typeof shariff_l10n[serviceName].desc !== 'string') {
							$.extend(service.desc, shariff_l10n[serviceName].desc);
						}
					}
				}
                return null;
            }
        });
        return service;
    });

    this._addButtonList();

    if (this.options.backendUrl !== null) {
        this.getShares().then( $.proxy( this._updateCounts, this ) );
    }

};

Shariff.prototype = {

    // Defaults may be over either by passing "options" to constructor method
    // or by setting data attributes.
    defaults: {
        theme      : 'color',

        // URL to backend that requests social counts. null means "disabled"
        backendUrl : null,

        // Link to the "about" page
        infoUrl: 'http://ct.de/-2467514',

        // localisation: "de" or "en"
        lang: 'de',

        // fallback language for not fully localized services
        langFallback: 'en',

        mailUrl: function() {
            var shareUrl = url.parse(this.getURL(), true);
            shareUrl.query.view = 'mail';
            delete shareUrl.search;
            return url.format(shareUrl);
        },

        // if
        mailSubject: function() {
            return this.getMeta('DC.title') || this.getTitle();
        },

        mailBody: function() { return this.getURL(); },

        // Media (e.g. image) URL to be shared
        mediaUrl: null,


        // horizontal/vertical
        orientation: 'horizontal',

        // a string to suffix current URL
        referrerTrack: null,

        // services to be enabled in the following order
        services   : [ 'facebook', 'facebooklike','twitter', 'googleplus', 'print'],

        title: function() {
            return $('head title').text();
        },

        twitterVia: null,

        // build URI from rel="canonical" or document.location
        url: function() {
            var url = global.document.location.href;
            var canonical = $('link[rel=canonical]').attr('href') || this.getMeta('og:url') || '';

            if (canonical.length > 0) {
                if (canonical.indexOf('http') < 0) {
                    canonical = global.document.location.protocol + '//' + global.document.location.host + canonical;
                }
                url = canonical;
            }

            return url;
        }
    },

    $socialshareElement: function() {
        return $(this.element);
    },

    getLocalized: function(data, key) {
        if (typeof data[key] === 'object') {
            if (typeof data[key][this.options.lang] === 'undefined') {
            	return data[key][this.options.langFallback];
            } else {
            	return data[key][this.options.lang];
            }
        } else if (typeof data[key] === 'string') {
            return data[key];
        }
        return undefined;
    },

    // returns content of <meta name="" content=""> tags or '' if empty/non existant
    getMeta: function(name) {
        var metaContent = $('meta[name="' + name + '"],[property="' + name + '"]').attr('content');
        return metaContent || '';
    },

    getInfoUrl: function() {
        return this.options.infoUrl;
    },

	getLang: function() {
		return this.options.lang;
	},
    
    getURL: function() {
        return this.getOption('url');
    },

    getOption: function(name) {
        var option = this.options[name];
        return (typeof option === 'function') ? $.proxy(option, this)() : option;
    },

    getTitle: function() {
        return this.getOption('title');
    },

    getReferrerTrack: function() {
        return this.options.referrerTrack || '';
    },

    // returns shareCounts of document
    getShares: function() {
        var baseUrl = url.parse(this.options.backendUrl, true);
        baseUrl.query.url = this.getURL();
        delete baseUrl.search;
		if(process.env.jsonp === true) {
			return $.ajax({
				  url: url.format(baseUrl),
				  dataType: 'jsonp',
			});
		} else {
			return $.getJSON(url.format(baseUrl));
		}
    },

    // add value of shares for each service
    _updateCounts: function(data) {
        var self = this;
		if(process.env.facebook && process.env.facebooklike) {
			if ($(self.element).find('.facebook').length === 1 && $(self.element).find('.facebooklike').length === 1) {
				data.facebook = data.facebook - data.facebooklike;
			}
		}
        $(self.element).find('ul').addClass('backend');
        $.each(data, function(key, value) {
            if(value >= 1000) {
                value = Math.round(value / 1000) + 'k';
            }
            $(self.element).find('.' + key + ' a span:first').after($('<span>').addClass('share_count').text(value).append('\n'));
			var a = $(self.element).find('.' + key + ' a'),
				aria = a.attr('aria-label');
			a.attr('aria-label', value + ' ' + aria);
			
        });
    },

    // add html for button-container
    _addButtonList: function() {
        var self = this;

        var $socialshareElement = this.$socialshareElement();

        var themeClass = 'theme-' + this.options.theme;
        var serviceCountClass = 'col-' + this.services.length;

        var $buttonList = $('<ul>').addClass(themeClass).addClass(serviceCountClass);
		
		if(this.options.orientation !== 'horizontal') {
			$buttonList.addClass('orientation-' + this.options.orientation);
		}

        // add html for service-links
		$.each(this.services, function (key, service) {
            var $li = $('<li>').addClass('shariff-button').addClass(service.name);
            var $shareText = $('<span>').addClass('share_text').text(self.getLocalized(service, 'shareText'));

            var $shareLink = $('<a>').data('key', key);
			  
			$shareLink.append($shareText);
			
			if (typeof service.shareUrl !== 'undefined') {
				$shareLink.attr('href', service.shareUrl);
			} else {
				$shareLink.attr('href', '#');
			}

            if (typeof service.faName !== 'undefined') {
                $shareLink.prepend($('<span>').addClass('fa').addClass(service.faName).attr('aria-hidden', 'true'));
            }

            if (service.popup) {
                $shareLink.attr('data-type', 'popup');
            } else if((process.env.facebooklike || process.env.googleplusplus) && service.tooltip){
                $shareLink.attr('data-type', 'tooltip');
            } else if(process.env.print && service.pageprint){
                $shareLink.attr('data-type', 'pageprint');
            } else if(process.env.more && service.more){
                $shareLink.attr('data-type', 'more')
					.data('more', 'true')
					.data('position', $buttonList.find('li').length + 1);
            } else if (service.blank) {
                $shareLink.attr('target', '_blank');
            }
            $shareLink.attr('title', self.getLocalized(service, 'title'));

            // add attributes for screen readers
			/*$shareLink.attr('role', 'button');*/
            $shareLink.attr('aria-label', self.getLocalized(service, 'title'));
			
			$shareLink.attr('rel', 'nofollow');

            $li.append($shareLink);

            $buttonList.append($li);
			
			if (service.more) {
				$buttonList.addClass('more-' + $buttonList.find('li').length);
			}
        });

        // event delegation
        $buttonList.on('click', '[data-type="popup"]', function(e) {
            e.preventDefault();

            var url = $(this).attr('href');
            var windowName = '_blank';
            var windowSizeX = '600';
            var windowSizeY = '460';
            var windowSize = 'width=' + windowSizeX + ',height=' + windowSizeY;

            global.window.open(url, windowName, windowSize);

        });

        if(process.env.facebooklike || process.env.googleplusplus) {
			$buttonList.on('click', '[data-type="tooltip"]', function(e) {
				e.preventDefault();
				var url = $(this).attr('href'),
					tool = this,
					loaded = 0,
					w = 180,
					service = self.services[$(this).data('key')];
				
				var $shariffTooltip =$('<div>').addClass('shariff-tooltip');
				
				if (service.width !== 'undefined'){
					$(this).parent().width(service.width);
				}
				if (service.desc !== 'undefined'){
					$shariffTooltip.append($('<p>').text(self.getLocalized(service, 'desc')));
				}
	
				$(this).closest('li').css('position', '');
				if(url !== '#') {
					$shariffTooltip.append($('<iframe>').attr('src', url));
				} else if(service.snippet !== 'undefined'){
					$shariffTooltip.append(service.snippet);
				}
				
				if($(window).width() - $(this).offset().left < w) {
					$(this).closest('li').css('position', 'static');
					$shariffTooltip
						.css('right', '4px')
						.css('bottom', $(this).closest('ul').height() - $(this).height() - $(this).position().top + 36);
				}
				
				$(this).parent().append($shariffTooltip);
				
				if($(this).offset().top - $(window).scrollTop() < $('.shariff-tooltip').height() + 50) {
					$shariffTooltip
						.css('bottom', 'auto')
						.css('top', '36px');
				}
	
			   // closes tooltip again
				/* global document */
				$(document).on('click', function(event) {
					if($(event.target).closest('li').find('a')[0] !== tool && $(event.target).closest('.shariff-tooltip').length === 0) {
						$(tool).siblings('.shariff-tooltip').remove();
						$(this).off(event);
					}
				});
				$('.shariff-tooltip iframe').on('load', function(event) {
					if(loaded > 0) {
						$(tool).siblings('.shariff-tooltip').remove();
						$(this).off(event);
						loaded = 0;
					}
					loaded++;
				});
			});
		}
		
		if(process.env.print) {
			$buttonList.on('click', '[data-type="pageprint"]', function(e) {
            e.preventDefault();
			window.print();
        });
		}
		
		if(process.env.more) {
			
			if($buttonList.find('.shariff-button.more').length > 0) {
				var i = $buttonList.find('li').index($buttonList.find('.shariff-button.more'));
				$buttonList.find('li:nth-child(n+' + (i + 2) + ')').attr('data-more', 'hide').insertBefore($buttonList.find('li.more')).hide();
				$buttonList.find('li.more a').attr('aria-expanded', 'false');
			}
	
			$buttonList.on('click', '[data-type="more"]', function(e) {
				e.preventDefault();
				var more = $(this).data('more') === 'true' ? true : false,
					posi = $(this).data('position'),
					service = self.services[$(this).data('key')];
				if (more) {
					$(this).find('.fa-plus').removeClass('fa-plus').addClass('fa-minus');
					$(this).find('.share_text').text(self.getLocalized(service, 'lessText'));
					$(this).closest('ul').removeClass('more-' + posi);
					$(this).closest('li').siblings('[data-more="hide"]').show();
					$(this).data('more', 'false').attr('aria-expanded', 'true');
				} else {
					$(this).find('.fa-minus').removeClass('fa-minus').addClass('fa-plus');
					$(this).find('.share_text').text(self.getLocalized(service, 'shareText'));
					$(this).closest('ul').addClass('more-' + posi);
					$(this).closest('li').siblings('[data-more="hide"]').hide();
					$(this).data('more', 'true').attr('aria-expanded', 'false');
				}
			});
		}
		
		$buttonList
			.on('mouseenter focusin', function() {
				if($(this).closest('ul').is('.theme-circle-color, .theme-circle-white, .theme-circle-grey')) {
					$(this).find('span.share_count').css('margin-top', '-20px').siblings('.fa').css('margin-top', '-35px');
				}
		})
			.on('mouseleave focusout', function() {
				if($(this).closest('ul').is('.theme-circle-color, .theme-circle-white, .theme-circle-grey')) {
					$(this).find('span.share_count').css('margin-top', '').siblings('.fa').css('margin-top', '');
				}
		});

        $socialshareElement.append($buttonList);
    }
};

module.exports = Shariff;

// export Shariff class to global (for non-Node users)
global.Shariff = Shariff;

// initialize .shariff elements
$('.shariff').each(function() {
    if (typeof this.shariff === 'undefined') {
        this.shariff = new Shariff(this);
    }
});
