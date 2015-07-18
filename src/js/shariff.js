'use strict';

var $ = require('jquery');
var url = require('url');
$(function(){
var Shariff = function(element, options) {
    var self = this;

    // the DOM element that will contain the buttons
    this.element = element;

    // Ensure elemnt is empty
    $(element).empty();

    this.options = $.extend({}, this.defaults, options, $(element).data());

    // available services. /!\ Browserify can't require dynamically by now.
    var availableServices = [
        require('./services/facebook'),
        require('./services/facebooklike'),
        require('./services/flattr'),
        require('./services/googleplus'),
        require('./services/googleplusplus'),
        require('./services/info'),
        require('./services/linkedin'),
        require('./services/mail'),
        require('./services/pinterest'),
        require('./services/print'),
        require('./services/tumblr'),
        require('./services/twitter'),
        require('./services/whatsapp'),
        require('./services/xing')
    ];

    // filter available services to those that are enabled and initialize them
    this.services = $.map(this.options.services, function(serviceName) {
        var service;
        availableServices.forEach(function(availableService) {
            availableService = availableService(self);
            if (availableService.name === serviceName) {
                service = availableService;
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
        theme      : 'white',

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

        mailBody: function() { return '<' + this.getURL() + '>'; },

        // Media (e.g. image) URL to be shared
        mediaUrl: null,


        // horizontal/vertical
        orientation: 'horizontal',

        // a string to suffix current URL
        referrerTrack: null,

        // services to be enabled in the following order
        services   : [ 'facebook', 'facebooklike','twitter', 'googleplus', 'print'],

        title: function() {
            return $('title').text();
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
	
	getFlattrID: function() {
		return this.options.flattrid;
	},

	getFlattrURL: function() {
		return this.options.flattrurl;
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
/*		return $.ajax({
			dataType: "json",
			url: url.format(baseUrl),
		});*/
        return $.getJSON(url.format(baseUrl));
    },

    // add value of shares for each service
    _updateCounts: function(data) {
        var self = this;
		$('.shariff').addClass('backend');
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
        var serviceCountClass = 'col-' + this.options.services.length;

        var $buttonList = $('<ul>').addClass(themeClass).addClass(serviceCountClass);
		
		if(this.options.orientation !== 'horizontal') {
			$buttonList.addClass('orientation-' + this.options.orientation);
		}

        // add html for service-links
        this.services.forEach(function(service, key) {
            var $li = $('<li class="shariff-button">').append('<div>').addClass(service.name);
            var $shareText = '<span class="share_text">' + self.getLocalized(service, 'shareText');
//			var $sharecount_test = '<span class="share_count">10';
//			$('.shariff').addClass('backend');

            var $shareLink = $('<a><div>')
				.data('key', key)
				.attr('target', '_blank');
			  
			$shareLink.children('div').append($shareText);
			
			if (typeof service.shareUrl !== 'undefined') {
				$shareLink.attr('href', service.shareUrl);
			} else {
				$shareLink.attr('href', '#');
			}
			
            if (typeof service.faName !== 'undefined') {
                $shareLink.children('div').prepend('<span class="fa ' +  service.faName + '">');
            }
			
//			$shareLink.find('span:first').after($sharecount_test);
			
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

/*			if ($('.shariff-tooltip').length > 0) {
				$('.shariff-tooltip').remove();
			}*/
			$(this).closest('div').css('position', '');
			if($(window).width() - $(this).offset().left < w) {
				$(this).closest('div').css('position', 'static');
				$shariffTooltip
					.css('right', '4px')
					.css('bottom', $(this).closest('ul').height() - $(this).height() - $(this).position().top + 36);
			}
			
			if(url !== '#') {
				$shariffTooltip.append('<iframe src="' + url + '"></iframe></div>');
			} else if(service.snippet !== 'undefined'){
				$shariffTooltip.append(service.snippet);
			}
			
			$(this).parent().append($shariffTooltip);

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
    if (!this.hasOwnProperty('shariff')) {
        this.shariff = new Shariff(this);
    }
});
});