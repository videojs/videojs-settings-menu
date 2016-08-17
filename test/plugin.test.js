import document from 'global/document';

import QUnit from 'qunit';
import sinon from 'sinon';
import videojs from 'video.js';

import SettingsMenuButton from '../src/components/settings-menu-button';
import SettingsMenuItem from '../src/components/settings-menu-item';

QUnit.module('videojs-settings-menu', {

  beforeEach() {

    // Mock the environment's timers because certain things - particularly
    // player readiness - are asynchronous in video.js 5. This MUST come
    // before any player is created; otherwise, timers could get created
    // with the actual timer methods!
    this.clock = sinon.useFakeTimers();

    this.fixture = document.getElementById('qunit-fixture');
    this.video = document.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = videojs(this.video);
  },

  afterEach() {
    this.player.dispose();
    this.clock.restore();
  }
});

QUnit.test('It registers the settings menu button component', function(assert) {
  assert.expect(1);

  assert.strictEqual(
    videojs.getComponent('SettingsMenuButton'),
    SettingsMenuButton,
    'Settings menu button was registered'
  );
});

QUnit.test('It registers the settings menu item component', function(assert) {
  assert.expect(1);

  assert.strictEqual(
    videojs.getComponent('SettingsMenuItem'),
    SettingsMenuItem,
    'Settings menu item was registered'
  );
});
