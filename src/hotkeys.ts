import { defaultInputFilter, getKeys, normalizeKey } from './utils';
import { KeyboardLayout, Layouts } from './layouts';
import type { HandlerItem, HotkeysHandler, TriggerEvent } from './type';
import { createLogger } from './logger';

interface HotkeysParams {
  element: HTMLElement;
  keyboard?: KeyboardLayout;
  autoWatchKeys?: boolean;
}

type HotkeysCallback = { unbind: () => void };

type HotkeysOptions = {
  scope?: string;
  order?: number;
  event?: TriggerEvent;
};

function createHotkeys({ element, keyboard: defaultKeyboard, autoWatchKeys = true }: HotkeysParams) {
  const logger = createLogger('hotkeys');

  const keysDown: Set<string> = new Set();
  const handlers: Map<string, HandlerItem[]> = new Map();

  let keyboardLayout = defaultKeyboard ?? Layouts['en-us'];
  let eventFilter = defaultInputFilter;
  let currentScope = 'all';
  let unbindWatch: (() => void) | undefined;

  function hotkeys(key: string | string[], handler: HotkeysHandler, options?: HotkeysOptions): HotkeysCallback;
  function hotkeys(key: string | string[], scope: string, handler: HotkeysHandler): HotkeysCallback;
  function hotkeys(key: string | string[], handler: any, options: any): HotkeysCallback {
    const keys = getKeys(Array.isArray(key) ? key.join(',') : key);

    let action: HotkeysHandler | undefined;
    let order = 0;
    let event: TriggerEvent = 'keydown';
    let scope = 'all';

    if (typeof handler === 'string') {
      scope = handler;
    } else if (typeof handler === 'function') {
      action = handler;
    }

    if (typeof options === 'function') {
      action = options;
    } else if (typeof options === 'object') {
      scope = (<HotkeysOptions>options).scope ?? scope;
      order = (<HotkeysOptions>options).order ?? order;
      event = (<HotkeysOptions>options).event ?? event;
    }

    if (!action) {
      throw new Error('No action provided');
    }

    const handlerItem: HandlerItem = {
      action,
      order,
      event,
      scope,
    };

    keys.forEach((key) => {
      const normalizedKey = normalizeKey(key);

      const items = handlers.get(normalizedKey) ?? [];

      handlers.set(
        normalizedKey,
        [...items, handlerItem].sort((a, b) => a.order - b.order),
      );

      logger.debug(
        'Registered handler for key',
        normalizedKey + ' in scope ' + scope + ' with order ' + order + '.' + ' Event: ' + event,
      );
    });

    const unbind = () => {
      keys.forEach((key) => {
        const normalizedKey = normalizeKey(key);
        const items = handlers.get(normalizedKey) ?? [];

        handlers.set(
          normalizedKey,
          items.filter((item) => item.action !== handler),
        );

        logger.debug('Unregistered handler for key', normalizedKey);
      });
    };

    if (autoWatchKeys) {
      watchKeys();
    }

    return { unbind };
  }

  function watchKeys() {
    if (unbindWatch) return unbindWatch;

    logger.debug('Watching keys');

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!eventFilter(event)) return false;

      const layoutKey = keyboardLayout[event.code];

      // Fix specials keys

      if (event.shiftKey) {
        keysDown.add('shift');
      }

      if (event.altKey) {
        keysDown.add('alt');
      }

      if (event.ctrlKey) {
        keysDown.add('ctrl');
      }

      if (event.metaKey) {
        keysDown.add('cmd');
      }

      if (!layoutKey) {
        logger.debug('No layout key for', event.code);
        return;
      }

      keysDown.add(normalizeKey(layoutKey.value));

      triggerHandler('keydown', event);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!eventFilter(event)) return false;

      const layoutKey = keyboardLayout[event.code];

      if (!layoutKey) {
        logger.debug('No layout key for', event.code);
        return;
      }

      triggerHandler('keyup', event);

      keysDown.delete(normalizeKey(layoutKey.value));

      // Fix specials keys

      if (!event.shiftKey) {
        keysDown.delete('shift');
      }

      if (!event.altKey) {
        keysDown.delete('alt');
      }

      if (!event.ctrlKey) {
        keysDown.delete('ctrl');
      }

      if (!event.metaKey) {
        keysDown.delete('cmd');
      }
    };

    const handleFocus = () => {
      keysDown.clear();
      logger.debug('Cleared keys on window focus');
    };

    element.addEventListener('keydown', handleKeyDown);
    element.addEventListener('keyup', handleKeyUp);
    window.addEventListener('focus', handleFocus);

    const unbind = () => {
      keysDown.clear();
      element.removeEventListener('keydown', handleKeyDown);
      element.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('focus', handleFocus);

      unbindWatch = undefined;
    };

    unbindWatch = unbind;

    return unbind;
  }

  function triggerHandler(event: TriggerEvent, e: KeyboardEvent) {
    const key = normalizeKey([...keysDown].join('+'));
    const items = handlers.get(key) ?? [];

    logger.debug('Triggering handler for key', key + ' (' + event + ')' + ' in scope ' + currentScope);

    for (const item of items) {
      let stop = false;

      if (item.event === event && item.scope === currentScope) {
        e.preventDefault();
        item.action(e, { key, stopPropagation: () => (stop = true) });

        logger.debug('Triggered handler for key', key + ' (' + event + ')' + ' in scope ' + currentScope);

        if (stop) break;
      }
    }
  }

  function setScope(scope: string) {
    currentScope = scope;
    logger.debug('Scope set to', scope);
  }

  function getScope() {
    return currentScope;
  }

  function getKeysDown() {
    return keysDown;
  }

  function setKeyboardLayout(layout: KeyboardLayout) {
    keyboardLayout = layout;
    logger.debug('Keyboard layout set to', layout);
  }

  function getKeyboardLayout() {
    return keyboardLayout;
  }

  function setVerbose(value: boolean) {
    logger.setVerbose(value);
  }

  function setEventFilter(filter: (event: KeyboardEvent) => boolean) {
    eventFilter = filter;
    logger.debug('Event filter changed');
  }

  function isPressed(key: string) {
    const normalizedKey = normalizeKey(key);
    return keysDown.has(normalizedKey);
  }

  function unbindAll() {
    handlers.clear();
    logger.debug('Unbinded all handlers');
  }

  function unbind(key?: string, scope: string = 'all') {
    if (!key) {
      unbindAll();
      return;
    }

    const normalizedKey = normalizeKey(key);
    const items = handlers.get(normalizedKey) ?? [];

    handlers.set(
      normalizedKey,
      items.filter((item) => item.scope !== scope),
    );

    logger.debug('Unbinded handlers for key', normalizedKey + (scope ? ` in scope ${scope}` : ''));
  }

  return {
    hotkeys,
    watchKeys,
    unbindAll,
    unbind,
    getScope,
    setScope,
    getKeysDown,
    getKeyboardLayout,
    setKeyboardLayout,
    setVerbose,
    setEventFilter,
    isPressed,
  };
}

export { createHotkeys };
