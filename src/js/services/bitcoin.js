'use strict';

module.exports = function(shariff) {
	var btc = encodeURIComponent(shariff.options.btc),
		param = [];
	if (typeof shariff.options.btclabel !== 'undefined') {
		param.push('label=' + encodeURIComponent(shariff.options.btclabel));
	}
	if (typeof shariff.options.btcamount !== 'undefined') {
		param.push('amount=' + encodeURIComponent(shariff.options.btcamount));
	}
	if (typeof shariff.options.btcmessage !== 'undefined') {
		param.push('message=' + encodeURIComponent(shariff.options.btcmessage));
	}
	if (param.length > 0) {
		btc += '?' + param.join('&');
	}
	
    return {
        blank: true,
        popup: false,
        shareText: {
			'de':'spenden',
			'en':'donate'
		},
        name: 'bitcoin',
        faName: 'fa-btc',
        title: {
            'de': 'Bitcoins spenden',
            'en': 'donate Bitcoins',
        },
        shareUrl: 'bitcoin:' + btc
    };
};
