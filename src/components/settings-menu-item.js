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

    this.size = null;

    // keep state of what menu type is loading next
    this.menuToLoad = 'mainmenu';

    const subMenuName = toTitleCase(entry);
    const SubMenuComponent = videojs.getComponent(subMenuName);

    if (!SubMenuComponent) {
      throw new Error(`Component ${subMenuName} does not exist`);
    }
    this.subMenu = new SubMenuComponent(this.player(), options);

    this.eventHandlers();

    player.ready(() => {
      this.build();
    });
  }

  /**
   * Setup event handlers
   *
   * @method eventHandlers
   */
  eventHandlers() {
    this.submenuClickHandler = this.onSubmenuClick.bind(this);
    this.transitionEndHandler = this.onTransitionEnd.bind(this);
  }

  onSubmenuClick(event) {
    let updateFn = this.update(event);
    let target = event.currentTarget;

    if (target.classList.contains('vjs-back-button')) {
      this.loadMainMenu();
    }

    setTimeout(updateFn, 0);
  }

  /**
   * Create the component's DOM element
   *
   * @return {Element}
   * @method createEl
   */
  createEl() {
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

    return el;
  }

  /**
   * Handle click on menu item
   *
   * @method handleClick
   */
  handleClick() {
    this.menuToLoad = 'submenu';
    // Remove open class to ensure only the open submenu gets this class
    videojs.removeClass(this.el_, 'open');

    super.handleClick();

    this.mainMenu.el_.style.opacity = '0';

    // Wether to add or remove vjs-hidden class on the settingsSubMenuEl element
    if (videojs.hasClass(this.settingsSubMenuEl_, 'vjs-hidden')) {
      videojs.removeClass(this.settingsSubMenuEl_, 'vjs-hidden');

      // animation not played without timeout
      setTimeout(() => {
        this.settingsSubMenuEl_.style.opacity = '1';
        this.settingsSubMenuEl_.style.marginRight = '0px';
      }, 0);

      this.settingsButton.setDialogSize(this.size);
    }
    else {
      videojs.addClass(this.settingsSubMenuEl_, 'vjs-hidden');
    }
  }

  /**
   * Create back button
   *
   * @method createBackButton
   */
  createBackButton() {
    this.backButton = this.subMenu.menu.addChild('MenuItem', {}, 0);
    this.backButton.name_ = 'BackButton';
    this.backButton.addClass('vjs-back-button');
    this.backButton.el_.innerHTML = `Back to Main Menu<span class="vjs-control-text">Back Button</span>`;
    this.backButton.el_.innerText = `Back to Main Menu`;
  }

  /**
   * Add/remove prefixed event listener for CSS Transition
   *
   * @method PrefixedEvent
   */
  PrefixedEvent(element, type, callback, action = 'addEvent') {
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

  onTransitionEnd(event) {
    if (event.propertyName !== 'margin-right') {
      return;
    }

    if (this.menuToLoad === 'submenu') {
    }

    if (this.menuToLoad === 'mainmenu') {
      // hide submenu
      videojs.addClass(this.settingsSubMenuEl_, 'vjs-hidden');

      // reset opacity to 0
      this.settingsSubMenuEl_.style.opacity = '0';
    }
  }

  reset() {
    this.settingsSubMenuEl_.style.opacity = '0';
    this.setMargin();
    this.hideSubMenu();
  }

  loadMainMenu() {
    this.menuToLoad = 'mainmenu';
    this.mainMenu.show();
    this.mainMenu.el_.style.opacity = '0';

    // back button will always take you to main menu, so set dialog sizes
    this.settingsButton.setDialogSize([this.mainMenu.width, this.mainMenu.height]);

    // animation not triggered without timeout (some async stuff ?!?)
    setTimeout(() => {
      // anitmate margin and opacity before hiding the submenu
      // this triggers CSS Transition event
      this.setMargin();
      this.mainMenu.el_.style.opacity = '1';
    }, 0);
  }

  build() {
    this.settingsSubMenuTitleEl_.innerHTML = this.subMenu.controlText_ + ':';
    this.settingsSubMenuEl_.appendChild(this.subMenu.menu.el_);
    this.panelEl.appendChild(this.settingsSubMenuEl_);

    this.update();

    // Required for transitions
    this.settingsSubMenuEl_.style.opacity = '0';

    this.createBackButton();
    this.getSize();
    this.bindClickEvents();

    // prefixed event listeners for CSS TransitionEnd
    this.PrefixedEvent(this.settingsSubMenuEl_, "TransitionEnd", this.transitionEndHandler, 'addEvent');
  }

  /**
   * Update the sub menus
   *
   * @method update
   */
  update() {
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
  }

  bindClickEvents() {
    for (let item of this.subMenu.menu.children()) {
      if (!(item instanceof component)) {
        continue;
      }
      item.on('click', this.submenuClickHandler);
    }
  }

  // save size of submenus on first init
  // if number of submenu items change dinamically more logic will be needed
  getSize() {
      this.dialog.removeClass('vjs-hidden');
      this.size = this.settingsButton.getComponentSize(this.settingsSubMenuEl_);
      this.setMargin();
      this.dialog.addClass('vjs-hidden');
      videojs.addClass(this.settingsSubMenuEl_, 'vjs-hidden');
  }

  setMargin() {
    let [width, height] = this.size;
    this.settingsSubMenuEl_.style.marginRight = `-${width}px`;
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
