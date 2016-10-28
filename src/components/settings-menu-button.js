
/**
 * @file settings-menu-button.js
 */
import videojs from 'video.js';
import SettingsMenuItem from './settings-menu-item.js';

const Button = videojs.getComponent('Button');
const Menu = videojs.getComponent('Menu');
const Component = videojs.getComponent('Component');

class SettingsButton extends Button {
  constructor(player, options) {
    super(player, options);

    this.playerComponent = player;
    this.dialog = this.playerComponent.addChild('settingsDialog');
    this.dialogEl = this.dialog.el_;
    this.menu = null;
    this.panel = this.dialog.addChild('settingsPanel');

    this.addClass('vjs-settings');
    this.el_.setAttribute('aria-label', 'Settings Button');

    // Event handlers
    this.addSettingsItemHandler = this.onAddSettingsItem.bind(this);
    this.disposeSettingsItemHandler = this.onDisposeSettingsItem.bind(this);
    this.playerClickHandler = this.onPlayerClick.bind(this);
    this.userInactiveHandler = this.onUserInactive.bind(this);

    this.buildMenu();
    this.bindEvents();
  }

  onPlayerClick(event) {
    if (event.target.classList.contains('vjs-settings')) {
      return;
    }

    if (!this.dialog.hasClass('vjs-hidden')) {
      this.hideDialog();
    }
  }

  onDisposeSettingsItem(event, id) {
    if (id === undefined) {
      let children = this.menu.children();

      while (children.length > 0) {
        children[0].dispose();
        this.menu.removeChild(children[0]);
      }

      this.addClass('vjs-hidden');
    } else {
      let item = this.menu.getChildById(id);

      item.dispose();
      this.menu.removeChild(item);
    }

    this.hideDialog();
  }

  onAddSettingsItem(event, data) {
    let [entry, options] = data;

    this.addMenuItem(entry, options);

    if (this.hasClass('vjs-hidden')) {
      this.removeClass('vjs-hidden')
    }
  }

  onUserInactive() {
    if (!this.dialog.hasClass('vjs-hidden')) {
      this.hideDialog();
    }
  }

  bindEvents() {
    this.playerComponent.on('click', this.playerClickHandler);
    this.playerComponent.on('addsettingsitem', this.addSettingsItemHandler);
    this.playerComponent.on('disposesettingsitem', this.disposeSettingsItemHandler);
    this.playerComponent.on('userinactive', this.userInactiveHandler);
  }

  buildCSSClass() {
    // vjs-icon-cog can be removed when the settings menu is integrated in video.js
    return `vjs-icon-cog ${super.buildCSSClass()}`;
  }

  handleClick() {
    if (this.dialog.hasClass('vjs-hidden')) {
      this.showDialog();
    } else {
      this.hideDialog();
    }
  }

  showDialog() {
    this.menu.el_.style.opacity = '1';
    this.dialog.show();
    this.setDialogSize(this.getComponentSize(this.menu));
  }

  hideDialog() {
    this.dialog.hide();
    this.setDialogSize(this.getComponentSize(this.menu));
    this.menu.el_.style.opacity = '1';
    this.resetChildren();
  }

  getComponentSize(element) {
    let width = null;
    let height = null;

    // Could be component or just DOM element
    if (element instanceof Component) {
      width = element.el_.offsetWidth;
      height = element.el_.offsetHeight;

      // keep width/height as properties for direct use
      element.width = width;
      element.height = height;
    } else {
      width = element.offsetWidth;
      height = element.offsetHeight;
    }

    return [width, height];
  }

  setDialogSize([width, height]) {
    this.dialogEl.style.width = `${width}px`;
    this.dialogEl.style.height = `${height}px`;
  }

  buildMenu() {
    this.menu = new Menu(this.player());
    this.menu.addClass('vjs-main-menu');
    let entries = this.options_.entries;

    if (entries) {
      for (let entry of entries) {
        this.addMenuItem(entry, this.options_);
      }
    }

    this.panel.addChild(this.menu);
  }

  addMenuItem(entry, options) {
    const openSubMenu = function() {
      if (videojs.hasClass(this.el_, 'open')) {
        videojs.removeClass(this.el_, 'open');
      } else {
        videojs.addClass(this.el_, 'open');
      }
    };

    let settingsMenuItem = new SettingsMenuItem(this.player(), options, entry, this);

    this.menu.addChild(settingsMenuItem);

    // Hide children to avoid sub menus stacking on top of each other
    // or having multiple menus open
    settingsMenuItem.on('click', videojs.bind(this, this.hideChildren));

    // Wether to add or remove selected class on the settings sub menu element
    settingsMenuItem.on('click', openSubMenu);
  }

  resetChildren() {
    for (let menuChild of this.menu.children()) {
      menuChild.reset();
    }
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
      innerHTML: '',
      tabIndex: -1
    }, {
      'role': 'dialog',
      'aria-labelledby': dialogLabelId,
      'aria-describedby': dialogDescriptionId
    });
  }

}

SettingsButton.prototype.controlText_ = 'Settings Button';

Component.registerComponent('SettingsButton', SettingsButton);
Component.registerComponent('SettingsDialog', SettingsDialog);
Component.registerComponent('SettingsPanel', SettingsPanel);

export { SettingsButton, SettingsDialog, SettingsPanel };
