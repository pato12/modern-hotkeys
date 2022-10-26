import { createHotkeys } from './hotkeys';
import { Layouts, KeyboardLayout, LayoutKey } from './layouts';

const defaultInstance = createHotkeys({ element: document.body });

const hotkeys = defaultInstance.hotkeys;
const watchKeys = defaultInstance.watchKeys;
const getScope = defaultInstance.getScope;
const setScope = defaultInstance.setScope;
const getKeysDown = defaultInstance.getKeysDown;
const isPressed = defaultInstance.isPressed;

export {
  getScope,
  setScope,
  hotkeys,
  watchKeys,
  getKeysDown,
  isPressed,
  createHotkeys,
  Layouts,
  KeyboardLayout,
  LayoutKey,
};
