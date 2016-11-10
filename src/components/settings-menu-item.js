/**
 * @file settings-menu-item.js
 */

import videojs from 'video.js';

const MenuItem = videojs.getComponent('MenuItem');
const playbackRateMenuButton = videojs.getComponent('PlaybackRateMenuButton');
const subtitlesButton = videojs.getComponent('SubtitlesButton');
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
    this.panelChild = this.panel.getChild('settingsPanelChild');
    this.panelChildEl = this.panelChild.el_;

    this.size = null;

    // keep state of what menu type is loading next
    this.menuToLoad = 'mainmenu';

    const subMenuName = toTitleCase(entry);
    const SubMenuComponent = videojs.getComponent(subMenuName);

    if (!SubMenuComponent) {
      throw new Error(`Component ${subMenuName} does not exist`);
    }
    this.subMenu = new SubMenuComponent(this.player(), options, menuButton, this);

    this.eventHandlers();

    player.ready(() => {
      this.build();
      this.reset();
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
    let target = null;

    if (event.type === 'tap') {
      target = event.target;
    } else {
      target = event.currentTarget;
    }

    if (target.classList.contains('vjs-back-button')) {
      this.loadMainMenu();
      return;
    }

    // To update the sub menu value on click, setTimeout is needed because
    // updating the value is not instant
    setTimeout(() => {
      this.update(event);
    }, 0);
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
    } else {
      videojs.addClass(this.settingsSubMenuEl_, 'vjs-hidden');
    }
  }

  /**
   * Create back button
   *
   * @method createBackButton
   */
  createBackButton() {
    let button = this.backButton;

    button = this.subMenu.menu.addChild('MenuItem', {}, 0);
    button.name_ = 'BackButton';
    button.addClass('vjs-back-button');
    button.el_.innerHTML = 'Back to menu<span class="vjs-control-text">Back</span>';
    button.el_.innerText = 'Back to menu';
  }

  /**
   * Add/remove prefixed event listener for CSS Transition
   *
   * @method PrefixedEvent
   */
  PrefixedEvent(element, type, callback, action = 'addEvent') {
    let prefix = ['webkit', 'moz', 'MS', 'o', ''];

    for (let p = 0; p < prefix.length; p++) {
      if (!prefix[p]) {
        type = type.toLowerCase();
      }

      if (action === 'addEvent') {
        element.addEventListener(prefix[p] + type, callback, false);
      } else if (action === 'removeEvent') {
        element.removeEventListener(prefix[p] + type, callback, false);
      }
    }
  }

  onTransitionEnd(event) {
    if (event.propertyName !== 'margin-right') {
      return;
    }

    if (this.menuToLoad === 'mainmenu') {
      // hide submenu
      videojs.addClass(this.settingsSubMenuEl_, 'vjs-hidden');

      // reset opacity to 0
      this.settingsSubMenuEl_.style.opacity = '0';
    }
  }

  reset() {
    videojs.addClass(this.settingsSubMenuEl_, 'vjs-hidden');
    this.settingsSubMenuEl_.style.opacity = '0';
    this.setMargin();
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
    this.panelChildEl.appendChild(this.settingsSubMenuEl_);

    this.update();

    this.createBackButton();
    this.getSize();
    this.bindClickEvents();

    // prefixed event listeners for CSS TransitionEnd
    this.PrefixedEvent(
      this.settingsSubMenuEl_,
      'TransitionEnd',
      this.transitionEndHandler,
      'addEvent'
    );
  }

  checkInstance() {
    let subMenu = '';

    if (this.subMenu instanceof playbackRateMenuButton) {
      subMenu = 'playbackRateMenuButton';
    }

    if (this.subMenu instanceof subtitlesButton) {
      subMenu = 'subtitlesButton';
    }

    return subMenu;
  }

  /**
   * Update the sub menus
   *
   * @method update
   */
  update(event) {
    let target = null;
    let subMenu = this.checkInstance();

    if (event && event.type === 'tap') {
      target = event.target;
    } else if (event) {
      target = event.currentTarget;
    }

    // Playback rate menu button doesn't get a vjs-selected class
    // or sets options_['selected'] on the selected playback rate.
    // Thus we get the submenu value based on the labelEl of playbackRateMenuButton
    if (subMenu === 'playbackRateMenuButton') {
      this.settingsSubMenuValueEl_.innerHTML = this.subMenu.labelEl_.innerHTML;
      this.loadMainMenu();
    } else {
      // Loop trough the submenu items to find the selected child
      for (let subMenuItem of this.subMenu.menu.children_) {
        if (!(subMenuItem instanceof component)) {
          continue;
        }

        switch (subMenu) {
          case 'subtitlesButton':
            // subtitlesButton entering default check twice and overwriting
            // selected label in main manu
            if (subMenuItem.hasClass('vjs-selected')) {
              this.settingsSubMenuValueEl_.innerHTML = subMenuItem.options_.label;
            }
            break;

          default:
            // Set submenu value based on what item is selected
            if (subMenuItem.options_.selected || subMenuItem.hasClass('vjs-selected')) {
              this.settingsSubMenuValueEl_.innerHTML = subMenuItem.options_.label;
            }
        }

      }

      if (target && !target.classList.contains('vjs-back-button')) {
        this.settingsButton.hideDialog();
      }
    }
  }

  bindClickEvents() {
    for (let item of this.subMenu.menu.children()) {
      if (!(item instanceof component)) {
        continue;
      }
      item.on(['tap', 'click'], this.submenuClickHandler);
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
    let [width] = this.size;

    this.settingsSubMenuEl_.style.marginRight = `-${width}px`;
  }

  /**
   * Hide the sub menu
   */
  hideSubMenu() {
    // after removing settings item this.el_ === null
    if (!this.el_) {
      return;
    }

    if (videojs.hasClass(this.el_, 'open')) {
      videojs.addClass(this.settingsSubMenuEl_, 'vjs-hidden');
      videojs.removeClass(this.el_, 'open');
    }
  }

}

SettingsMenuItem.prototype.contentElType = 'button';

videojs.registerComponent('SettingsMenuItem', SettingsMenuItem);
export default SettingsMenuItem;
