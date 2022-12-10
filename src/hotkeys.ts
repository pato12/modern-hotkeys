import { defaultInputFilter, getKeys, normalizeKey } from './utils';
import { KeyboardLayout, Layouts } from './layouts';
import type { HandlerItem, HotkeysHandler, TriggerEvent } from './type';
import { createLogger } from './logger';

const DEFAULT_SCOPE = 'default';

interface HotkeysParams {
  element: HTMLElement;
  keyboard?: KeyboardLayout;
  autoWatchKeys?: boolean;
  watchCaps?: boolean;
}

type HotkeysCallback = {
  unbind: () => void;
};

type HotkeysOptions = {
  scope?: string;
  order?: number;
  event?: TriggerEvent;
};

function createHotkeys({ element, keyboard: defaultKeyboard, autoWatchKeys = true, watchCaps = false }: HotkeysParams) {
  const logger = createLogger('hotkeys');

  const keysDown: Set<string> = new Set();
  const handlers: Map<string, HandlerItem[]> = new Map();

  let keyboardLayout = defaultKeyboard ?? Layouts['en-us'];
  let eventFilter = defaultInputFilter;
  let currentScope = DEFAULT_SCOPE;
  let unbindWatch: (() => void) | undefined;

  function hotkeys(key: string | string[], scope: string, handler: HotkeysHandler): HotkeysCallback;
  function hotkeys(key: string | string[], options: HotkeysOptions, handler: HotkeysHandler): HotkeysCallback;
  function hotkeys(key: string | string[], handler: HotkeysHandler, options?: HotkeysOptions): HotkeysCallback;
  function hotkeys(
    key: string | string[],
    arg1: HotkeysHandler | HotkeysOptions | string,
    arg2?: HotkeysOptions | HotkeysHandler,
  ): HotkeysCallback {
    const keys = getKeys(Array.isArray(key) ? key.join(',') : key);

    let order = 0;
    let event: TriggerEvent = 'keydown';
    let scope = DEFAULT_SCOPE;

    let handler: HotkeysHandler | undefined;
    let options: HotkeysOptions | undefined;

    if (typeof arg1 === 'string') {
      scope = arg1;
    } else if (typeof arg1 === 'function') {
      handler = arg1;
    } else {
      options = arg1;
    }

    if (typeof arg2 === 'function') {
      handler = arg2;
    } else if (typeof arg2 === 'object') {
      options = arg2;
    }

    scope = options?.scope ?? scope;
    order = options?.order ?? order;
    event = options?.event ?? event;

    keys.forEach((key) => {
      const normalizedKey = normalizeKey(key);
      const items = handlers.get(normalizedKey) ?? [];

      if (!handler) {
        throw new Error('No action provided');
      }

      const handlerItem: HandlerItem = {
        action: handler,
        order,
        event,
        scope,
        key,
      };

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
        const items = handlers.get(normalizedKey);

        if (!items) return;

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

    // If meta is pressed, we have to release those keys on keyup
    const keysToRelease: string[] = [];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!eventFilter(event)) return false;

      const layoutKey = keyboardLayout[event.code];

      if (!layoutKey) {
        logger.debug('No layout key for', event.code);
        return;
      }

      const value = normalizeKey(layoutKey.value);

      if (value === 'caps' && !watchCaps) return;

      // Fix for meta key
      if (keysDown.has('meta')) keysToRelease.push(value);
      if (value === 'meta') keysToRelease.push(...keysDown);

      keysDown.add(value);

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

      const value = normalizeKey(layoutKey.value);

      keysDown.delete(value);

      // Fix for meta key
      if (value === 'meta' && keysToRelease.length > 0) {
        logger.debug('Releasing keys after meta key up', keysToRelease.slice());
        keysToRelease.forEach((key) => keysDown.delete(key));
        keysToRelease.length = 0;
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

  function triggerHandler(trigger: TriggerEvent, event: KeyboardEvent) {
    const key = normalizeKey([...keysDown].join('+'));
    const items = [...(handlers.get(key) ?? []), ...(handlers.get('*') ?? [])];

    logger.debug('Triggering handler for key', key + ' (' + trigger + ')' + ' in scope ' + currentScope);

    for (const item of items) {
      let stop = false;

      if (item.event === trigger && item.scope === currentScope) {
        event.preventDefault();
        item.action(event, { key: item.key, stopPropagation: () => (stop = true) });

        logger.debug('Triggered handler for key', key + ' (' + trigger + ')' + ' in scope ' + currentScope);

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

  function trigger(key: string, scope = DEFAULT_SCOPE) {
    const normalizedKey = normalizeKey(key);
    const items = handlers.get(normalizedKey) ?? [];

    logger.debug('Triggering handler for key', normalizedKey + ' in scope ' + scope);

    const fakeEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
    });

    Object.defineProperty(fakeEvent, 'message', {
      writable: false,
      value: 'Event triggered by user',
    });

    for (const item of items) {
      if (item.scope === scope) {
        item.action(fakeEvent, { key: item.key, stopPropagation: () => {} });

        logger.debug('Triggered handler for key', normalizedKey + ' in scope ' + scope);
      }
    }
  }

  function getPressedKeyStrings() {
    return [...keysDown];
  }

  function unbindAll() {
    handlers.clear();
    logger.debug('Unbinded all handlers');
  }

  function unbind(key?: string, scope = DEFAULT_SCOPE) {
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

    logger.debug('Unbinded handlers for key', normalizedKey, ` in scope ${scope}`);
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
    getPressedKeyStrings,
    trigger,
    isPressed,
  };
}

export { createHotkeys };
