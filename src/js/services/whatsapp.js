'use strict';

module.exports = function(shariff) {
    var url = encodeURIComponent(shariff.getURL());
    var title = shariff.getTitle();

    return {
        popup: false,
        shareText: {
            'de': 'teilen',
            'en': 'share',
        },
        name: 'whatsapp',
        faName: 'fa-whatsapp',
        title: {
            'de': 'Bei Whatsapp teilen',
            'en': 'Share on Whatsapp',
        },
        shareUrl: 'whatsapp://send?text=' + encodeURIComponent(title) + '%20' + url + shariff.getReferrerTrack()
    };
};
