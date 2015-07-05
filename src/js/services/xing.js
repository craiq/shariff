'use strict';

module.exports = function(shariff) {
    var url = encodeURIComponent(shariff.getURL());
    return {
        popup: true,
        shareText: {
            'de': 'teilen',
            'en': 'share',
            'es': 'compartir',
        },
        name: 'xing',
        faName: 'fa-xing',
        title: {
            'de': 'Bei XING teilen',
            'en': 'Share on XING',
            'es': 'Compartir en XING',
        },
        shareUrl: 'https://www.xing.com/social_plugins/share?url=' + url + shariff.getReferrerTrack()
    };
};
