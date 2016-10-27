/**
 * @file settings-menu-item.js
 */

import videojs from 'video.js';
import SettingsMenuItem from './settings-menu-item.js';

const MenuItem = videojs.getComponent('MenuItem');
const playbackRateMenuButton = videojs.getComponent('PlaybackRateMenuButton');
const component = videojs.getComponent('Component');

const toTitleCase = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * The specific menu item type for selecting a setting
 *
 * @param {Player|Object} player
 * @param {Object=} options
 * @param {String=} entry
 * @extends MenuItem
 * @class SettingsMenuItem
 */
class QualitySettingsMenuItem extends SettingsMenuItem {

  constructor(player, options, entry, menuButton) {
    super(player, options, entry, menuButton);

  }

  /**
   * Update the sub menus
   *
   * @method update
   */
  update(event) {
    console.log('update from QualitySettingsMenuItem');
  }

}

QualitySettingsMenuItem.prototype.contentElType = 'button';

videojs.registerComponent('QualitySettingsMenuItem', QualitySettingsMenuItem);
export default QualitySettingsMenuItem;
