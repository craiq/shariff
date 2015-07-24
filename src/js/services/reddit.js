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
        name: 'reddit',
        faName: 'fa-reddit',
        title: {
            'de': 'Bei Reddit teilen',
            'en': 'Share on Reddit',
        },
        shareUrl: 'https://reddit.com/submit?url=' + url + '&title=' + title + shariff.getReferrerTrack()
    };
};
