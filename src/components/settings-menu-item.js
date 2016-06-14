/**
 * @file settings-menu-item.js
 */

import videojs from 'video.js';
import * as utils from './utils.js';

const MenuItem = videojs.getComponent('MenuItem');
const playbackRateMenuButton = videojs.getComponent('PlaybackRateMenuButton');
const settingsSubMenuTitleEl = Symbol('settingsSubMenuTitleEl');
const settingsSubMenuEl = Symbol('settingsSubMenuEl');
const settingsSubMenuValueEl = Symbol('settingsSubMenuValueEl');

function toTitleCase(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * The specific menu item type for selecting a setting
 *
 * @param {Player|Object} player
 * @param {Object=} options
 * @extends MenuItem
 * @class SettingsMenuItem
 */
class SettingsMenuItem extends MenuItem {

  constructor(player, options, entry){
    super(player, options);

    const subMenuName = toTitleCase(entry);

    const subMenuComponent = videojs.getComponent(subMenuName);

    if (!subMenuComponent) {
      throw new Error(`Component ${subMenuName} does not exist`);
    }

    this.subMenu = new subMenuComponent(this.player(), options);

    const component = this;

    for (let item of this.subMenu.menu.children()) {
      item.on('menuitemclicked', function(){
        setTimeout(function(){
          component.update();
        }, 5)
      });
    }

    this.update();
  }

  /**
   * Create the component's DOM element
   *
   * @return {Element}
   * @method createEl
   */
  createEl() {
    // Hide this component by default
    const el = utils.createEl('li', {
      className: 'vjs-menu-item'
    });

    this[settingsSubMenuTitleEl] = utils.createEl('div', {
      className: 'vjs-settings-sub-menu-title'
    });
    
    el.appendChild(this[settingsSubMenuTitleEl]);

    this[settingsSubMenuValueEl] = utils.createEl('div', {
      className: 'vjs-settings-sub-menu-value'
    });
    
    el.appendChild(this[settingsSubMenuValueEl]);

    this[settingsSubMenuEl] = utils.createEl('div', {
      className: 'vjs-settings-sub-menu vjs-hidden'
    });
    
    el.appendChild(this[settingsSubMenuEl]);
    
    return el;
  }


  /**
   * Handle click on menu item
   *
   * @method handleClick
   */
  handleClick() {
    super.handleClick();

    //Wether to add or remove vjs-hdiden class on the settingsSubMenuEl element
    if (videojs.hasClass(this[settingsSubMenuEl],'vjs-hidden'))
    {
      videojs.removeClass(this[settingsSubMenuEl],'vjs-hidden');
    }
    else
    {
      videojs.addClass(this[settingsSubMenuEl],'vjs-hidden')
    }
  }

  /**
   * Update the sub menus
   *
   * @method update
   */
  update() {
    console.log(this.subMenu);
      this[settingsSubMenuTitleEl].innerHTML = this.subMenu.controlText_ + ':';
      this[settingsSubMenuEl].appendChild(this.subMenu.menu.el_);

      //Playback rate menu button doesn't get a vjs-selected class or sets options_['selected'] on the selected playback rate.
      //Thus we get the submenu value based on the labelEl of playbackRateMenuButton
      if (this.subMenu instanceof playbackRateMenuButton)
      {
        this[settingsSubMenuValueEl].innerHTML = this.subMenu.labelEl_.innerHTML;
      }
      else
      {
        // Loop trough the submenu items to find the selected child
        for (let subMenuItem of this.subMenu.menu.children_)
        {
          //Set submenu value based on what item is selected
          if(subMenuItem.options_['selected'] || subMenuItem.hasClass('vjs-selected'))
          {
            this[settingsSubMenuValueEl].innerHTML = subMenuItem.options_.label;
          }
        }
      }
  }

  /**
   * Hide the sub menu
   */
  hideSubMenu() {
     videojs.addClass(this[settingsSubMenuEl],'vjs-hidden');
  }

}

SettingsMenuItem.prototype.contentElType = 'button';

videojs.registerComponent('SettingsMenuItem', SettingsMenuItem);
export default SettingsMenuItem;