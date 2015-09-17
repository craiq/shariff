'use strict';

module.exports = function(shariff) {

    var url = encodeURIComponent(shariff.options.flattrurl),
		id = '';
	if (typeof shariff.options.flattrid !== 'undefined') {
		id = '&amp;user_id=' + shariff.options.flattrid;
	}

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
        shareUrl: 'https://flattr.com/submit/auto?url=' + url + id
    };
};
