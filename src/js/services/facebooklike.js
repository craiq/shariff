'use strict';

module.exports = function(shariff) {
    var url = encodeURIComponent(shariff.getURL());
    return {
		popup: true,
//        tooltip: true,
//		width: 200,
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
        shareUrl: 'https://www.facebook.com/plugins/like.php?href=' + url + shariff.getReferrerTrack() + '&width=80&layout=button_count&action=like&show_faces=false&share=false&height=30',
        popupInfoText: {
            'de': 'Zum Schutz Ihrer Daten nehmen wir erst jetzt Kontakt mit Facebook auf. Klicken Sie bitte den nachfolgenden Button um diese Seite zu liken.'
        }
    };
};
