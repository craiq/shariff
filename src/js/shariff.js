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
        require('./services/googleplus'),
        require('./services/info'),
        require('./services/linkedin'),
        require('./services/mail'),
        require('./services/pinterest'),
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

        mailBody: function() { return '<' + this.getURL() + '>'; },

        // Media (e.g. image) URL to be shared
        mediaUrl: null,


        // horizontal/vertical
        orientation: 'horizontal',

        // a string to suffix current URL
        referrerTrack: null,

        // services to be enabled in the following order
        services   : [ 'facebook', 'facebooklike','twitter', 'googleplus'],

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
        this.services.forEach(function(service) {
            var $li = $('<li class="shariff-button">').append('<div>').addClass(service.name);
            var $shareText = '<span class="share_text">' + self.getLocalized(service, 'shareText');
//			var $sharecount_test = '<span class="share_count">10';
//			$('.shariff').addClass('backend');

            var $shareLink = $('<a><div>')
              .attr('href', service.shareUrl);
			  
			  $shareLink.children('div')
			  .append($shareText);

            if (typeof service.faName !== 'undefined') {
                $shareLink.children('div').prepend('<span class="fa ' +  service.faName + '">');
            }
			
//			$shareLink.find('span:first').after($sharecount_test);
			
            if(service.width){
                $shareLink.data('width',service.width);
            }
			if(service.desc){
				$shareLink.data('desc', self.getLocalized(service, 'desc'));
			}

            if (service.popup) {
                $shareLink.attr('rel', 'popup');
            } else if(service.tooltip){
                $shareLink.attr('rel', 'tooltip');
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
				desc = '',
				offset = '',
				loaded = 0;

            if ($(this).data('width')){
                $(this).parent().width($(this).data('width'));
            }
            if ($(this).data('desc')){
                desc = '<p>' + $(this).data('desc') + '</p>';
            }

			if($('.shariff-tooltip').length > 0) {
				$('.shariff-tooltip').remove();
			}
			if($(window).width() - $(this).offset().left - $(this).width() < 180) {
				$(this).closest('div').css('position', 'static');
				var bottom = $(this).closest('ul').height() - $(this).height() - $(this).position().top;
				offset = ' style="right:0;bottom:' + (bottom + 34) + 'px"';
			}

            $(this).parent().append('' +
            '<div class="shariff-tooltip"' + offset + '>' +
			desc +
            '<iframe src="' + url + '"></iframe></div>' +
            '</div>' +
            '');

            // closes tooltip again
            /* global document */
            $(document).on('click', function(event) {
				if($(event.target).closest('a').attr('href') !== url && event.target !== $('.shariff-tooltip')[0] && event.target !== $('.shariff-tooltip p')[0]) {
					$('.shariff-tooltip').remove();
					if(!!offset) {
						$(this).closest('div').css('position', '');
					}
					$(this).off(event);
				}
            });
			$('.shariff-tooltip iframe').on('load', function(event) {
				if(loaded > 0) {
					$('.shariff-tooltip').remove();
					if(!!offset) {
						$(this).closest('div').css('position', '');
					}
					$(this).off(event);
					loaded = 0;
				}
				loaded++;
			});
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
})