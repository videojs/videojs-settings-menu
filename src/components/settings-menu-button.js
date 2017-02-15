
/**
 * @file settings-menu-button.js
 */
import videojs from 'video.js';
import SettingsMenuItem from './settings-menu-item.js';
const MenuButton = videojs.getComponent('MenuButton');
const Menu = videojs.getComponent('Menu');
const Component = videojs.getComponent('Component');

/**
 * The component for controlling the settings menu
 *
 * @param {Player|Object} player
 * @param {Object=} options
 * @extends MenuButton
 * @class SettingsMenuButton
 */
class SettingsMenuButton extends MenuButton {

  constructor(player, options) {
    super(player, options);

    this.el_.setAttribute('aria-label', 'Settings Menu');
    videojs.dom.addClass(this.$('.vjs-icon-placeholder'), 'vjs-icon-cog');

    this.on('mouseleave', videojs.bind(this, this.hideChildren));
  }

  /**
   * Allow sub components to stack CSS class names
   *
   * @return {String} The constructed class name
   * @method buildCSSClass
   */
  buildCSSClass() {
    return `vjs-settings-menu ${super.buildCSSClass()}`;
  }

  createItems() {
    const entries = this.options_.entries;
    const player = this.player();
    const opts = this.options_;

    const items = entries.map((entry) => new SettingsMenuItem(player, opts, entry))

    return items;
  }

  /**
   * Hide all the sub menus
   */
  hideChildren() {
    for (let menuChild of this.menu.children()) {
      menuChild.hideSubMenu();
    }
  }

}

SettingsMenuButton.prototype.controlText_ = 'Settings Menu';

Component.registerComponent('SettingsMenuButton', SettingsMenuButton);
export default SettingsMenuButton;
