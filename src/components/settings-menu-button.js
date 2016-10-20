
/**
 * @file settings-menu-button.js
 */
import videojs from 'video.js';
import SettingsMenuItem from './settings-menu-item.js';
const MenuButton = videojs.getComponent('MenuButton');
const Button = videojs.getComponent('Button');
const Menu = videojs.getComponent('Menu');
const Component = videojs.getComponent('Component');

class SettingsButton extends Button {
  constructor(player, options) {
    super(player, options);

    this.dialog = player.addChild('settingsDialog');
    this.dialogEl = this.dialog.el_;
    this.dialogWidth = null;
    this.menu = null;

    this.panel = this.dialog.addChild('settingsPanel');

    // console.log('constructor');

    this.el_.setAttribute('aria-label', 'Settings Button');
    this.buildMenu();
  }

  buildCSSClass() {
    // vjs-icon-cog can be removed when the settings menu is integrated in video.js
    return `vjs-icon-cog ${super.buildCSSClass()}`;
  }

  // createEl() {
  //   super.createEl();
  //   console.log('createEl');
  // }

  handleClick() {
    if (this.dialog.hasClass('vjs-hidden')) {
      this.dialog.show();
      this.setDialogSize(this.getComponentSize(this.menu));
    }
    else {
      this.dialog.hide();
    }
  }

  getComponentSize(component) {
    let width = component.el_.offsetWidth;
    let height = component.el_.offsetHeight;
    return [width, height];
  }

  setDialogSize([width, height]) {
     this.dialogEl.style.width = `${width}px`;
     this.dialogEl.style.height = `${height}px`;
  }

  buildMenu() {
    this.menu = new Menu(this.player());
    let entries = this.options_.entries;

    if (entries) {

      const openSubMenu = function() {

        if (videojs.hasClass(this.el_, 'open')) {
          videojs.removeClass(this.el_, 'open');
        } else {
          videojs.addClass(this.el_, 'open');
        }

      };

      for (let entry of entries) {

        let settingsMenuItem = new SettingsMenuItem(this.player(), this.options_, entry);

         this.menu.addChild(settingsMenuItem);

        // Hide children to avoid sub menus stacking on top of each other
        // or having multiple menus open
        // settingsMenuItem.on('click', videojs.bind(this, this.hideChildren));

        // Wether to add or remove selected class on the settings sub menu element
        // settingsMenuItem.on('click', openSubMenu);
      }
    }

    // console.log(this.dialog);
    this.panel.addChild(this.menu);

  }

}

class SettingsPanel extends Component {
  constructor(player, options) {
    super(player, options);
  }

  /**
   * Create the component's DOM element
   *
   * @return {Element}
   * @method createEl
   */
  createEl() {
    return super.createEl('div', {
      className: 'vjs-settings-panel',
      innerHTML: '',
      tabIndex: -1
    });
  }
}

class SettingsDialog extends Component {
  constructor(player, options) {
    super(player, options);
    this.hide();
  }

  /**
   * Create the component's DOM element
   *
   * @return {Element}
   * @method createEl
   */
  createEl() {
    const uniqueId = this.id_;
    const dialogLabelId = 'TTsettingsDialogLabel-' + uniqueId;
    const dialogDescriptionId = 'TTsettingsDialogDescription-' + uniqueId;

    return super.createEl('div', {
      className: 'vjs-settings-dialog vjs-modal-overlay',
      // innerHTML: captionOptionsMenuTemplate(uniqueId, dialogLabelId, dialogDescriptionId),
      innerHTML: '',
      tabIndex: -1
    }, {
      'role': 'dialog',
      'aria-labelledby': dialogLabelId,
      'aria-describedby': dialogDescriptionId
    });
  }

}

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

    // this.on('mouseleave', videojs.bind(this, this.hideChildren));
  }

  /**
   * Allow sub components to stack CSS class names
   *
   * @return {String} The constructed class name
   * @method buildCSSClass
   */
  buildCSSClass() {
    // vjs-icon-cog can be removed when the settings menu is integrated in video.js
    return `vjs-settings-menu vjs-icon-cog ${super.buildCSSClass()}`;
  }

  /**
   * Create the settings menu
   *
   * @return {Menu} Menu object populated with items
   * @method createMenu
   */
  createMenu() {
    let menu = new Menu(this.player());
    let entries = this.options_.entries;

    if (entries) {

      const openSubMenu = function() {

        if (videojs.hasClass(this.el_, 'open')) {
          videojs.removeClass(this.el_, 'open');
        } else {
          videojs.addClass(this.el_, 'open');
        }

      };

      for (let entry of entries) {

        let settingsMenuItem = new SettingsMenuItem(this.player(), this.options_, entry);

        menu.addChild(settingsMenuItem);

        // Hide children to avoid sub menus stacking on top of each other
        // or having multiple menus open
        settingsMenuItem.on('click', videojs.bind(this, this.hideChildren));

        // Wether to add or remove selected class on the settings sub menu element
        settingsMenuItem.on('click', openSubMenu);
      }
    }

    return menu;
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
SettingsButton.prototype.controlText_ = 'Settings Button';

Component.registerComponent('SettingsMenuButton', SettingsMenuButton);
Component.registerComponent('SettingsButton', SettingsButton);
Component.registerComponent('SettingsDialog', SettingsDialog);
Component.registerComponent('SettingsPanel', SettingsPanel);

export { SettingsMenuButton, SettingsButton, SettingsDialog, SettingsPanel };
