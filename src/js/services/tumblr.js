'use strict';

var url = require('url');

module.exports = function(shariff) {
	var shareUrl = url.parse('https://www.tumblr.com/share/link', true);
    shareUrl.query.url = shariff.getURL();
    shareUrl.query.title = shariff.getTitle();
	shareUrl.protocol = 'https';
    delete shareUrl.search;


    return {
        popup: true,
        shareText: {
            'de': 'teilen',
            'en': 'share',
        },
        name: 'tumblr',
        faName: 'fa-tumblr',
        title: {
            'de': 'Bei Tumblr teilen',
            'en': 'Share on Tumblr',
        },
        shareUrl: url.format(shareUrl) + shariff.getReferrerTrack()
    };
};

