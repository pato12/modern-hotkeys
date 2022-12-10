import { createHotkeys } from './hotkeys';
import { Layouts, KeyboardLayout, LayoutKey } from './layouts';
import { HotkeysHandler, HotkeysEvent } from './type';

const defaultInstance = createHotkeys({ element: document.body });

const hotkeys = Object.assign(defaultInstance.hotkeys, {
  getScope: defaultInstance.getScope,
  setScope: defaultInstance.setScope,
  getKeysDown: defaultInstance.getKeysDown,
  isPressed: defaultInstance.isPressed,
  setKeyboardLayout: defaultInstance.setKeyboardLayout,
  getKeyboardLayout: defaultInstance.getKeyboardLayout,
  unbind: defaultInstance.unbind,
  setEventFilter: defaultInstance.setEventFilter,
  setVerbose: defaultInstance.setVerbose,
  getPressedKeyStrings: defaultInstance.getPressedKeyStrings,
  trigger: defaultInstance.trigger,
  unbindAll: defaultInstance.unbindAll,
  watchKeys: defaultInstance.watchKeys,
});

export { hotkeys, createHotkeys, Layouts, KeyboardLayout, LayoutKey, HotkeysHandler, HotkeysEvent };

export default hotkeys;
