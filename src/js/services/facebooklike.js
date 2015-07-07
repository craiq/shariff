'use strict';

module.exports = function(shariff) {
    var url = encodeURIComponent(shariff.getURL());
    return {
		tooltip: true,
        shareText: {
            'en': 'like'
        },
        name: 'facebooklike',
        faName: 'fa-facebooklike',
        title: {
            'de': 'Gefällt mir bei Facebook ',
            'en': 'Like on Facebook'
        },
		desc: {
			'de': 'Aus Datenschutzgründen bitte bestätigen',
			'en': 'For privacy reasons, please confirm'
		},
        shareUrl: 'https://www.facebook.com/plugins/like.php?href=' + url + shariff.getReferrerTrack() + '&width=80&layout=button&action=like&show_faces=false&share=false&height=30'
    };
};
