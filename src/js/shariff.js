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
    var availableServices = [
        require('./services/addthis'),
        require('./services/facebook'),
        require('./services/facebooklike'),
        require('./services/googleplus'),
        require('./services/googleplusplus'),
        require('./services/linkedin'),
        require('./services/print'),
        require('./services/xing'),
        require('./services/flattr'),
        require('./services/info'),
        require('./services/mail'),
        require('./services/pinterest'),
        require('./services/reddit'),
        require('./services/tumblr'),
        require('./services/twitter'),
        require('./services/whatsapp'),
        require('./services/diaspora'),
        require('./services/stumbleupon'),
        require('./services/bitcoin'),
    ];

    // filter available services to those that are enabled and initialize them
    this.services = $.map(this.options.services, function(serviceName) {
        var service;
		$.each(availableServices, function(key, availableService) {
            availableService = availableService(self);
            if (availableService.name === serviceName) {
                service = availableService;
				if (typeof shariff_l10n !== 'undefined') {
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
        return $.getJSON(url.format(baseUrl));
    },

    // add value of shares for each service
    _updateCounts: function(data) {
        var self = this;
        if ($(self.element).find('.facebook').length === 1 && $(self.element).find('.facebooklike').length === 1) {
            data.facebook = data.facebook - data.facebooklike;
        }
        $(self.element).addClass('backend');
        $.each(data, function(key, value) {
            if(value >= 1000) {
                value = Math.round(value / 1000) + 'k';
            }
            $(self.element).find('.' + key + ' a span:first').after('<span class="share_count">' + value);
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
            var $li = $('<li class="shariff-button">').append('<div>').addClass(service.name);
            var $shareText = '<span class="share_text">' + self.getLocalized(service, 'shareText');

            var $shareLink = $('<a><div>')
				.data('key', key);
			  
			$shareLink.children('div').append($shareText);
			
			if (typeof service.shareUrl !== 'undefined') {
				$shareLink.attr('href', service.shareUrl);
			} else {
				$shareLink.attr('href', '#');
			}

            if (typeof service.faName !== 'undefined') {
                $shareLink.children('div').prepend('<span class="fa ' +  service.faName + '">');
            }

            if (service.popup) {
                $shareLink.attr('rel', 'popup');
            } else if(service.tooltip){
                $shareLink.attr('rel', 'tooltip');
            } else if(service.pageprint){
                $shareLink.attr('rel', 'pageprint');
            } else if (service.blank) {
                $shareLink.attr('target', '_blank');
            }
            $shareLink.attr('title', self.getLocalized(service, 'title'));

            // add attributes for screen readers
            $shareLink.attr('role', 'button');
            $shareLink.attr('aria-label', self.getLocalized(service, 'title'));

            $li.children('div').append($shareLink);

            $buttonList.append($li);
        });

        // event delegation
        $buttonList.on('click', '[rel="popup"]', function(e) {
            e.preventDefault();

            var url = $(this).attr('href');
            var windowName = '_blank';
            var windowSizeX = '600';
            var windowSizeY = '460';
            var windowSize = 'width=' + windowSizeX + ',height=' + windowSizeY;

            global.window.open(url, windowName, windowSize);

        });

        $buttonList.on('click', '[rel="tooltip"]', function(e) {
            e.preventDefault();
            var url = $(this).attr('href'),
				tool = this,
				loaded = 0,
				w = 180,
				service = self.services[$(this).data('key')];
			
            var $shariffTooltip =$('<div class="shariff-tooltip"></div>');
			
            if (service.width !== 'undefined'){
                $(this).parent().width(service.width);
            }
			if (service.desc !== 'undefined'){
                $shariffTooltip.append('<p>' + self.getLocalized(service, 'desc') + '</p>');
			}

			$(this).closest('div').css('position', '');
			if(url !== '#') {
				$shariffTooltip.append('<iframe src="' + url + '"></iframe></div>');
			} else if(service.snippet !== 'undefined'){
				$shariffTooltip.append(service.snippet);
			}
			
			if($(window).width() - $(this).offset().left < w) {
				$(this).closest('div').css('position', 'static');
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
		
		$buttonList.on('click', '[rel="pageprint"]', function(e) {
            e.preventDefault();
			window.print();
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
