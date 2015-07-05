'use strict';
var $ = require('jquery');

module.exports = function(shariff) {
    var url = encodeURIComponent(shariff.getURL());
    return {
		popup: true,
        shareText: {
            'de': 'gefällt mir',
            'en': 'like'
        },
        name: 'facebooklike',
        faName: 'fa-facebook',
        title: {
            'de': 'Gefällt mir bei Facebook ',
            'en': 'Like on Facebook'
        },
        shareUrl: 'https://www.facebook.com/plugins/like.php?href=' + url + shariff.getReferrerTrack() + '&width=80&layout=button_count&action=like&show_faces=false&share=false&height=30'
    };
};
