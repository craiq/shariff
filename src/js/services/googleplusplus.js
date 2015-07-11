'use strict';

module.exports = function(shariff) {
    var url = encodeURIComponent(shariff.getURL());
    return {
        tooltip: true,
        shareText: '+1',
        name: 'googleplusplus',
        faName: 'fa-google-plus',
        title: {
            'en': 'Google+ +1',
        },
		desc: {
			'de': 'Aus Datenschutzgründen bitte bestätigen',
			'en': 'For privacy reasons, please confirm'
		},
		snippet: '<div class="g-plusone" data-annotation="none" data-href="' + url + '"></div><script type="text/javascript">window.___gcfg = {lang: "' + shariff.getLang() + '"}; (function() { var po = document.createElement("script"); po.type = "text/javascript"; po.async = true; po.src = "https://apis.google.com/js/platform.js"; var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(po, s); })(); </script>'
    };
};

