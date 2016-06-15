# videojs-settings-menu

A plugin to create a settings menu consisting of sub menus for the video.js controlbar

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
- [Usage](#usage)
  - [`<script>` Tag](#script-tag)
  - [Browserify](#browserify)
  - [RequireJS/AMD](#requirejsamd)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```sh
npm install --save videojs-settings-menu
```

## Usage

To create a videojs-settings-menu you simply have to put a menu inside the `settingsMenuButton` as an entry. The `settingsMenuButton` is placed as a child inside the `controlBar`. Don't forget to remove the menus from the `controlBar` as children, because otherwise the menu will also been shown in the controlbar instead of only in the settings menu. Examples and methods can be found below.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.js"></script>
<script src="//path/to/videojs-settings-menu.js"></script>
<script>
	var player = videojs('videojs-settings-menu-player', {
		'playbackRates': [0.5, 1, 1.5, 2],
		controlBar: {
			children: {
				'playToggle':{},
				'muteToggle':{},
				'volumeControl':{},
				'currentTimeDisplay':{},
				'timeDivider':{},
				'durationDisplay':{},
				'liveDisplay':{},

				'flexibleWidthSpacer':{},
				'progressControl':{},

				'settingsMenuButton': {
					entries : [
						'subtitlesButton',
						'playbackRateMenuButton'
					]
				},
				'fullscreenToggle':{}
			}
		}
	});
</script>
```

### Browserify

When using with Browserify, install videojs-settings-menu via npm and `require` the plugin as you would any other module.

```js
var videojs = require('video.js');

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require('videojs-settings-menu');

var player = videojs('my-video', { /* options as above */});
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(['video.js', 'videojs-settings-menu'], function(videojs) {
  var player = videojs('my-video', { /* options as above */});
});
```

## License

MIT. Copyright (c) Fruitsapje &lt;hero@streamone.nl&gt;


[videojs]: http://videojs.com/
