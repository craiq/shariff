'use strict';

module.exports = function(shariff) {
    var url = encodeURIComponent(shariff.getURL()),
	    title = encodeURIComponent(shariff.getTitle());
    return {
        popup: true,
        shareText: {
            'de': 'teilen',
            'en': 'share',
        },
        name: 'diaspora',
        faName: 'fa-times-circle',
        title: {
            'de': 'Bei Diaspora teilen',
            'en': 'Share on Diaspora',
        },
        shareUrl: 'https://sharetodiaspora.github.io/?url=' + url + '&title=' + title + shariff.getReferrerTrack()
    };
};
