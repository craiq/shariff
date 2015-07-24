'use strict';

module.exports = function(shariff) {
    var url = encodeURIComponent(shariff.getURL());
    return {
        popup: true,
        shareText: {
            'de': 'teilen',
            'en': 'share',
        },
        name: 'reddit',
        faName: 'fa-reddit',
        title: {
            'de': 'Bei Reddit teilen',
            'en': 'Share on Reddit',
        },
        shareUrl: 'https://reddit.com/submit?url=' + url + shariff.getReferrerTrack()
    };
};
