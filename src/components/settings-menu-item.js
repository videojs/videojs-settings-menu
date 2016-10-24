/**
 * @file settings-menu-item.js
 */

import videojs from 'video.js';

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
class SettingsMenuItem extends MenuItem {

  constructor(player, options, entry, menuButton) {
    super(player, options);

    this.settingsButton = menuButton;
    this.dialog = this.settingsButton.dialog;
    this.mainMenu = this.settingsButton.menu;

    this.panel = this.dialog.getChild('settingsPanel');
    this.panelEl = this.panel.el_;
    this.handleBackClick = this.onBackClick.bind(this);
    this.transitionEndHandler = this.onTransitionEnd.bind(this);
    this.size = null;
    this.firstInit = true;

    const subMenuName = toTitleCase(entry);
    const SubMenuComponent = videojs.getComponent(subMenuName);

    if (!SubMenuComponent) {
      throw new Error(`Component ${subMenuName} does not exist`);
    }
    this.subMenu = new SubMenuComponent(this.player(), options);

    const update = videojs.bind(this, this.update);

    // To update the sub menu value on click, setTimeout is needed because
    // updating the value is not instant
    const updateAfterTimeout = (event) => {
      let updateFn = this.update(event);

      setTimeout(updateFn, 0);
    };

    for (let item of this.subMenu.menu.children()) {
      if (!(item instanceof component)) {
        continue;
      }
      item.on('click', updateAfterTimeout);
    }

    // updating the value is not instant
    setTimeout(update, 20);
  }

  /**
   * Create the component's DOM element
   *
   * @return {Element}
   * @method createEl
   */
  createEl() {
    // Hide this component by default
    const el = videojs.createEl('li', {
      className: 'vjs-menu-item'
    });

    this.settingsSubMenuTitleEl_ = videojs.createEl('div', {
      className: 'vjs-settings-sub-menu-title'
    });

    el.appendChild(this.settingsSubMenuTitleEl_);

    this.settingsSubMenuValueEl_ = videojs.createEl('div', {
      className: 'vjs-settings-sub-menu-value'
    });

    el.appendChild(this.settingsSubMenuValueEl_);

    this.settingsSubMenuEl_ = videojs.createEl('div', {
      className: 'vjs-settings-sub-menu'
    });

    // el.appendChild(this.settingsSubMenuEl_);

    return el;
  }

  /**
   * Handle click on menu item
   *
   * @method handleClick
   */
  handleClick() {
    console.log('handleClick');

    // Remove open class to ensure only the open submenu gets this class
    videojs.removeClass(this.el_, 'open');

    super.handleClick();

    // this.mainMenu.hide();
    this.mainMenu.el_.style.opacity = '0';

    // Wether to add or remove vjs-hidden class on the settingsSubMenuEl element
    if (videojs.hasClass(this.settingsSubMenuEl_, 'vjs-hidden')) {
      videojs.removeClass(this.settingsSubMenuEl_, 'vjs-hidden');

      console.log(111, this.settingsSubMenuEl_);

      // animation not played without timeout
      setTimeout(() => {
        this.settingsSubMenuEl_.style.opacity = '1';
      }, 0);

      this.settingsButton.setDialogSize(this.size);
    }
    else {
      videojs.addClass(this.settingsSubMenuEl_, 'vjs-hidden');
    }
  }

  createBackButton() {
    // Back button for submenu section
    this.backButton = this.subMenu.menu.addChild('MenuItem', {}, 0);
    this.backButton.name_ = 'BackButton';
    this.backButton.addClass('vjs-back-button');
    this.backButton.el_.innerHTML = `Back to Main Menu<span class="vjs-control-text">Back Button</span>`;
    this.backButton.el_.innerText = `Back to Main Menu`;
    this.backButton.on('click', this.handleBackClick);
  }

  PrefixedEvent(element, type, callback, action) {
    let prefix = ["webkit", "moz", "MS", "o", ""];

    for (var p = 0; p < prefix.length; p++) {
      if (!prefix[p]) {
        type = type.toLowerCase();
      }

      if (action === 'addEvent') {
        element.addEventListener(prefix[p]+type, callback, false);
      }
      else if (action === 'removeEvent'){
        element.removeEventListener(prefix[p]+type, callback, false);
      }
    }
  }

  onTransitionEnd() {
    console.log('onTransitionEnd');

    // clear panel styles
    this.panelEl.style.display = '';

    // hide current submenu and clear inline style for margin
    videojs.addClass(this.settingsSubMenuEl_, 'vjs-hidden');
    this.settingsSubMenuEl_.style.marginRight = '';

    // remove listener
    this.PrefixedEvent(this.settingsSubMenuEl_, "TransitionEnd", this.transitionEndHandler, 'removeEvent');
  }

  onBackClick() {
    let [width, height] = this.size;

    // prefixed event listeners for CSS TransitionEnd
    this.PrefixedEvent(this.settingsSubMenuEl_, "TransitionEnd", this.transitionEndHandler, 'addEvent');

    this.mainMenu.show();
    this.mainMenu.el_.style.opacity = '0';

    // back button will always take you to main menu, so set dialog sizes
    this.settingsButton.setDialogSize([this.mainMenu.width, this.mainMenu.height]);

    // slide submenu before hiding it - this triggers CSS Transition event
    this.settingsSubMenuEl_.style.marginRight = `-${width}px`;

    // animation not played without timeout
    setTimeout(() => {
      this.mainMenu.el_.style.opacity = '1';
    }, 0);
  }

  /**
   * Update the sub menus
   *
   * @method update
   */
  update(event) {
    let target = null;

    if (event) {
      target = event.currentTarget;
    }

    // Don't create back button if one already exists
    if (this.subMenu.menu.children_[0].name() !== 'BackButton') {
      this.createBackButton();
    }

    this.settingsSubMenuTitleEl_.innerHTML = this.subMenu.controlText_ + ':';
    this.settingsSubMenuEl_.appendChild(this.subMenu.menu.el_);
    this.panelEl.appendChild(this.settingsSubMenuEl_);
    this.settingsSubMenuEl_.style.opacity = '0';

    // Playback rate menu button doesn't get a vjs-selected class
    // or sets options_['selected'] on the selected playback rate.
    // Thus we get the submenu value based on the labelEl of playbackRateMenuButton
    if (this.subMenu instanceof playbackRateMenuButton) {
      this.settingsSubMenuValueEl_.innerHTML = this.subMenu.labelEl_.innerHTML;
    } else {
      // Loop trough the submenu items to find the selected child
      for (let subMenuItem of this.subMenu.menu.children_) {
        if (!(subMenuItem instanceof component)) {
          continue;
        }
        // Set submenu value based on what item is selected
        if (subMenuItem.options_.selected || subMenuItem.hasClass('vjs-selected')) {
          this.settingsSubMenuValueEl_.innerHTML = subMenuItem.options_.label;
        }
      }
    }

    if (this.firstInit) {
      // save size of submenus on first init
      // if number of submenu items change dinamically more logic will be needed
      this.dialog.removeClass('vjs-hidden');
      this.size = this.settingsButton.getComponentSize(this.settingsSubMenuEl_);
      this.dialog.addClass('vjs-hidden');
      videojs.addClass(this.settingsSubMenuEl_, 'vjs-hidden');
      console.log('size: ', this.size);
      this.firstInit = false;
    }

  }

  /**
   * Hide the sub menu
   */
  hideSubMenu() {
    if (videojs.hasClass(this.el_, 'open')) {
      videojs.addClass(this.settingsSubMenuEl_, 'vjs-hidden');
      videojs.removeClass(this.el_, 'open');
    }
  }

}

SettingsMenuItem.prototype.contentElType = 'button';

videojs.registerComponent('SettingsMenuItem', SettingsMenuItem);
export default SettingsMenuItem;
