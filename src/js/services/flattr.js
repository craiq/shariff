'use strict';

module.exports = function(shariff) {

    var url = encodeURIComponent(shariff.options.flattrurl);
	var id = shariff.options.flattrid;

    return {
		blank: true,
        shareText: {
            'en': 'flattr',
        },
        name: 'flattr',
        faName: 'fa-money',
        title: {
            'de': 'Mit Flattr spenden',
            'en': 'spend with Flattr',
        },
        shareUrl: 'https://flattr.com/submit/auto?url=' + url + '&amp;user_id=' + id
    };
};
