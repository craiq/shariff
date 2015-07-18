'use strict';

module.exports = function(shariff) {
    var url = encodeURIComponent(shariff.getFlattrURL());
    return {
        shareText: {
            'en': 'flattr',
        },
        name: 'flattr',
        faName: 'fa-money',
        title: {
            'de': 'Mit Flattr spenden',
            'en': 'spend with Flattr',
        },
        shareUrl: 'https://flattr.com/submit/auto?url=' + url + '&amp;user_id=' + shariff.getFlattrID()
    };
};
