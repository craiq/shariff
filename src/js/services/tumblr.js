'use strict';

module.exports = function(shariff) {
    var url = encodeURIComponent(shariff.getURL());
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
        shareUrl: 'https://www.tumblr.com/share/link?url=' + url + shariff.getReferrerTrack()
    };
};
