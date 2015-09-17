'use strict';

module.exports = function(shariff) {
    var url = encodeURIComponent(shariff.getURL());
    return {
        popup: true,
        shareText: {
			'de': 'teilen',
			'en': 'share'
		},
        name: 'googleplus',
        faName: 'fa-google-plus',
        title: {
            'de': 'Bei Google+ teilen',
            'en': 'Share on Google+',
        },
        shareUrl: 'https://plus.google.com/share?url=' + url + shariff.getReferrerTrack()
    };
};

