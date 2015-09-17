'use strict';

module.exports = function(shariff) {
    var url = encodeURIComponent(shariff.getURL());

    var title = shariff.getMeta('DC.title');
    var creator = shariff.getMeta('DC.creator');

    if (title.length > 0 && creator.length > 0) {
        title += ' - ' + creator;
    } else {
        title = shariff.getTitle();
    }

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

