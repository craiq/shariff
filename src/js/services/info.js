'use strict';

module.exports = function(shariff) {
    return {
        blank: true,
        popup: false,
        shareText: 'Info',
        name: 'info',
        faName: 'fa-info',
        title: {
            'de': 'weitere Informationen',
            'en': 'more information',
        },
        shareUrl: shariff.getInfoUrl()
    };
};
