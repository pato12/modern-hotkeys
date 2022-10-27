import { createHotkeys } from './hotkeys';
import { Layouts, KeyboardLayout, LayoutKey } from './layouts';
import { HotkeysHandler, HotkeysEvent } from './type';

const defaultInstance = createHotkeys({ element: document.body });

const hotkeys = defaultInstance.hotkeys;
const getScope = defaultInstance.getScope;
const setScope = defaultInstance.setScope;
const getKeysDown = defaultInstance.getKeysDown;
const isPressed = defaultInstance.isPressed;
const setKeyboardLayout = defaultInstance.setKeyboardLayout;
const getKeyboardLayout = defaultInstance.getKeyboardLayout;
const unbind = defaultInstance.unbind;
const setEventFilter = defaultInstance.setEventFilter;

export {
  getScope,
  setScope,
  hotkeys,
  getKeysDown,
  isPressed,
  setKeyboardLayout,
  getKeyboardLayout,
  unbind,
  setEventFilter,
  createHotkeys,
  Layouts,
  KeyboardLayout,
  LayoutKey,
  HotkeysHandler,
  HotkeysEvent,
};
