import { defaultInputFilter, getKeys, normalizeKey } from './utils';
import { KeyboardLayout, Layouts } from './layouts';
import type { HandlerItem, HotkeysHandler, TriggerEvent } from './type';
import { createLogger } from './logger';

interface HotkeysParams {
  element: HTMLElement;
  keyboard?: KeyboardLayout;
  autoWatchKeys?: boolean;
}

function createHotkeys({ element, keyboard: defaultKeyboard, autoWatchKeys = true }: HotkeysParams) {
  const logger = createLogger('hotkeys');

  const keysDown: Set<string> = new Set();
  const handlers: Map<string, HandlerItem[]> = new Map();

  let keyboardLayout = defaultKeyboard ?? Layouts['en-us'];
  let eventFilter = defaultInputFilter;
  let currentScope = 'all';
  let unbindWatch: (() => void) | undefined;

  function hotkeys<F extends HotkeysHandler>(
    key: string | string[],
    handler: F,
    options?: {
      scope?: string;
      order?: number;
      event?: TriggerEvent;
    },
  ) {
    const keys = getKeys(Array.isArray(key) ? key.join(',') : key);

    const order = options?.order ?? 0;
    const event = options?.event ?? 'keydown';
    const scope = options?.scope ?? 'all';

    keys.forEach((key) => {
      const normalizedKey = normalizeKey(key);

      const handlerItem: HandlerItem = {
        action: handler,
        order,
        event,
        scope,
      };

      const items = handlers.get(normalizedKey) ?? [];

      handlers.set(
        normalizedKey,
        [...items, handlerItem].sort((a, b) => a.order - b.order),
      );

      logger.debug('Registered handler for key', normalizedKey);
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

    element.addEventListener('keydown', handleKeyDown);
    element.addEventListener('keyup', handleKeyUp);

    const unbind = () => {
      keysDown.clear();
      element.removeEventListener('keydown', handleKeyDown);
      element.removeEventListener('keyup', handleKeyUp);

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
