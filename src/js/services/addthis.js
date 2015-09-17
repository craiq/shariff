'use strict';

module.exports = function(shariff) {
    var url = encodeURIComponent(shariff.getURL());
    return {
        popup: true,
        shareText: {
            'de': 'teilen',
            'en': 'share',
        },
        name: 'addthis',
        faName: 'fa-addthis',
        title: {
            'de': 'Bei AddThis teilen',
            'en': 'Share on AddThis',
        },
        shareUrl: 'http://api.addthis.com/oexchange/0.8/offer?url=' + url + shariff.getReferrerTrack()
    };
};

