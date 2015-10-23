# Shariff – Give Social Media Buttons Some Privacy

Shariff enables website users to share their favorite content without compromising their privacy. [Demo](http://craiq.github.io/shariff/)

![Shariff Logo © 2015 Heise Medien](http://www.heise.de/icons/ho/shariff-logo.png)

Available Modules

    * addthis
	* Bitcoin
    * Diaspora
    * Facebook
    * Facebook like
    * Flattr
	* Google+
    * Google+ +1
    * Linkedin
    * Pinterest
    * Reddit
    * Stumbleupon
    * Tumblr
    * Twitter
    * Whatsapp
    * Xing
    * E-Mail
    * Print
    * Info
	* more

Facebook, Google+ and Twitter supply official sharing code snippets which quietly siphon personal data from all page visitors. Shariff enables visitors to see how popular your page is on Facebook and share your content with others without needless data leaks.

Shariff `(/ˈʃɛɹɪf/)` is an open-source, low-maintenance, high-privacy solution maintained by German computer magazine c't and heise online.

Shariff consists of two parts: a simple JavaScript client library and an optional server-side component. The latter fetches the number of likes, tweets and plus-ones. Share buttons and share counts work without a connection between your visitors' browsers and *social networks* (unless they decide to share, of course).

## Getting Started

1. Download the [latest release](https://github.com/heiseonline/shariff/releases/latest)
2. Include CSS in `<head>`:
    * `build/shariff.complete.css` contains all dependencies
    * use `build/shariff.min.css`, if [Font Awesome](https://github.com/FortAwesome/Font-Awesome) is already included in your site
3. Include JavaScript right before `</body>`:
    * `build/shariff.complete.js` contains all dependencies
    * use `build/shariff.min.js`, if [jQuery](https://github.com/jquery/jquery) is already included in your site
4. Insert one or more `<div class="shariff">` elements.
5. Customize the look using data-* attributes.

To enable the counters in the buttons, see section [Backends](#backends).

Usage example:

```html
<!DOCTYPE html>
<html>
<head>
    <link href="/path/to/shariff.min.css" rel="stylesheet">
</head>
<body>
    <h1>My article</h1>
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>

    <h2>Minimum buttons:</h2>
    <div class="shariff"></div>

    <h2>More advanced buttons:</h2>
    <div class="shariff" data-backend-url="/path/to/backend" data-url="http://www.example.com/my-article.html" data-theme="grey" data-orientation="vertical"></div>

    <!-- immediately before </body> -->
    <script src="/path/to/shariff.min.js"></script>
</body>
</html>
```

## Getting Started using `npm`

You can also use Shariff's node package by installing it via `npm`:

```sh
$ cd my-project
$ npm install shariff --save
```

Edit your JS main script, include Shariff and initialize it in one or more containers:

```js
// my-app.js
var Shariff = require('shariff');
var $ = require('jquery');
var buttonsContainer = $('.some-selector');
new Shariff(buttonsContainer, {
    orientation: 'vertical'
});
```

## Configure your own build

You can configure your own build by changing the config.json This allows you the smallest files you need.

| Attribute        | Description | Default |
|------------------|-------------|---------|
| "services" | Add just those services you need  | "" |
| "default_services" | Services that show, when you don't set data-services | ["twitter", "facebook", "googleplus", "info"] |
| "lang" | Set if you want to read in the shariff.l10n.js  | true |
| "fontpath" | Set your own fontpath  | online resource |
| "css" | Add some custom css to the css shariff class  | "" |
| "jsonp" | Asks the counts as jsonp  | false |
| "circle" | Support for circle themes | true |

Jsonp is just needed, when you get the counts from a remote server and use https.
You also have to modify your backend for this. Here is a [modified php version](https://github.com/craiq/shariff-backend-php).

## Add or change translations

By modifying the src/l10n.json file you can add or change the translations. Those need to be compiled with 

```sh
$ grunt l10n
```

The compiled file (build/shariff.l10n.js) then need to be placed before shariff.min/complete.js on your page. If you don't want this and don't like to waste the few bytes for the implementation you can add following to your config.json

```sh
...
],
"lang": false
}
```
## How to compile your own

After downloading Shariff, install its dependencies by running `npm install`.

```sh
$ git clone https://github.com/heiseonline/shariff.git
$ cd shariff
$ npm install
$ grunt build
```

Make sure you have installed the [Grunt CLI](http://gruntjs.com/getting-started#installing-the-cli). Run `grunt demo` to start a local web server which displays several button configurations. The demo page uses [`shariff-backend-node`](https://github.com/heiseonline/shariff-backend-node) to request and display share counts.

## Options (data attributes)

| Attribute        | Description | Default |
|------------------|-------------|---------|
| `data-backend-url` | The path to your Shariff backend, see below. Settings the value to `null` disables the backend feature. No counts will occur.  | `null` |
| `data-lang`      | The localisation to use. Available:  `de`, `en` | `de` |
| `data-mail-body` | If a `mailto:` link is used in `data-mail-url`, then this value is used as the mail body. | see `data-url`  |
| `data-mail-subject` | If a `mailto:` link is used in `data-mail-url`, then this value is used as the mail subject. | see `data-title` |
| `data-mail-url`  | The url target used for the `mail` service button | `?view=mail` |
| `data-media-url` | Media url to be shared (pinterest) | `null` |
| `data-orientation` | `vertical` will stack the buttons vertically. | `horizontal`  |
| `data-referrer-track` | A string that will be appended to the share url. Can be disabled using `null`. | `null` |
| `data-services`   | An entity-encoded JSON string containing an array of service names to be enabled. Example: `data-services="[&quot;facebook&quot;,&quot;googleplus&quot;]"` Available service names: `twitter`, `facebook`, `facebooklike`, `googleplus`, `googleplusplus`, `linkedin`, `pinterest`, `xing`, `tumblr`, `whatsapp`, `print`, `mail`, `more`, `info`, `diaspora`, `reddit`, `stumbleupon`, `bitcoin`, `addthis`, `flattr`, `tumblr` | Facebook, Facebook-Like, Google+, Twitter, print |
| `data-theme`       | We include 6 schemes, `color`, `grey`, `white`, `circle-color`, `circle-white` and `circle-grey`. | `color` |
| `data-title`       | Title to be used as share text in Twitter/Whatsapp | page's `DC.title`/`DC.creator` or `<title>` |
| `data-twitter-via` | Screen name of the user to attribute the Tweet to | `null` |
| `data-url`         | The canonical URL of the page to check. | page's canonical URL or `og:url` or current URL |
| `data-FlattrID`       | Your username on Flattr. | `undefined` |
| `data-FlattrURL`       | URL of the thing. | `undefined` |
| `data-btc`       | Bitcoin Adresse | `undefined` |
| `data-btcAmount`       | amount of Bitcoins | `undefined` |
| `data-btcLabel`       | Bitcoin Label | `undefined` |
| `data-btcMessage`       | Bitcoin Message | `undefined` |

## Backends

In order to display share counts with Shariff, you need one of the following backends:

* [shariff-backend-node](http://github.com/heiseonline/shariff-backend-node)
* [shariff-backend-perl](http://github.com/heiseonline/shariff-backend-perl)
* [shariff-backend-php](http://github.com/heiseonline/shariff-backend-php)

Third-party backends:
* [shariff-backend-java](http://github.com/headissue/shariff-backend-java)

Once you have one of these backends up and running, insert its URL into the `data-backend-url` attribute. For example, if the backend runs under `http://example.com/my-shariff-backend/`, the `data-backend-url` should be `/my-shariff-backend/`. The script will handle the rest.

## Third-party integrations

This is a list of integrations for third-party systems:

* [Contao integration](https://github.com/hofff/contao-shariff)
* [Drupal module](https://www.drupal.org/project/shariff)
* [Joomla 3.4+ Shariff Plugin](https://github.com/joomla-agency/plg_jooag_shariff)
* [Open Monograph Press Plugin](https://github.com/langsci/shariff)
* [SilverStripe Module](https://github.com/andrelohmann/silverstripe-shariff)
* [TYPO3 Plugin rx_shariff](http://typo3.org/extensions/repository/view/rx_shariff)
* [Wordpress Plugin shariff-sharing](https://wordpress.org/plugins/shariff-sharing/)
* [WordPress Plugin Shariff Wrapper](https://wordpress.org/plugins/shariff/)
* [Xenforo 1.4 Plugin](https://github.com/McAtze/-ITM-ctShariffSocialButtons)
* [Xenforo [WMTech] Social Share Privacy Plugin](https://wmtech.net/products/wmtech-social-share-privacy.41/)
