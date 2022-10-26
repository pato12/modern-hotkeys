/**
 * @jest-environment jsdom
 */

import { createHotkeys, Layouts } from '../dist';

const instance = createHotkeys({
  element: document.body,
  keyboard: Layouts['en-us'],
  autoWatchKeys: false,
});

// turn on verbose mode to see debug messages
instance.setVerbose(false);

describe('hotkets', () => {
  let unbindWatch: (() => void) | undefined;

  beforeEach(() => {
    instance.unbindAll();
    instance.setScope('all');
    instance.setEventFilter(() => true);
    if (unbindWatch) unbindWatch();
  });

  test('try auto watch keys in true', () => {
    const newInstance = createHotkeys({
      element: document.body,
      keyboard: Layouts['en-us'],
      autoWatchKeys: true,
    });

    let count = 0;

    newInstance.hotkeys('a', () => {
      count++;
    });

    dispatchKeys(['KeyA']);
    dispatchKeys(['KeyA']);
    dispatchKeys(['KeyA']);

    expect(count).toBe(3);
  });

  test('try auto watch keys in false', () => {
    const newInstance = createHotkeys({
      element: document.body,
      keyboard: Layouts['en-us'],
      autoWatchKeys: false,
    });

    let count = 0;

    newInstance.hotkeys('a', () => {
      count++;
    });

    dispatchKeys(['KeyA']);
    dispatchKeys(['KeyA']);
    dispatchKeys(['KeyA']);

    expect(count).toBe(0);
  });

  test('try alternative signature', () => {
    let count = 0;

    instance.hotkeys('a', 'testing', () => {
      count++;
    });

    unbindWatch = instance.watchKeys();

    instance.setScope('testing');

    dispatchKeys(['KeyA']);

    expect(count).toBe(1);
  });

  test('try send an invalid handler', () => {
    expect(() => instance.hotkeys('a', null as any)).toThrow();
  });

  test('try clear keys on focus window', () => {
    unbindWatch = instance.watchKeys();

    dispatchKeyboardEvent('keydown', { code: 'KeyA' });

    expect(instance.getKeysDown().size).toBe(1);

    dispatchEvent(new FocusEvent('focus', { bubbles: true, cancelable: true }));

    expect(instance.getKeysDown().size).toBe(0);
  });

  describe('try activations', () => {
    test('test a single key', () => {
      let count = 0;

      instance.hotkeys('a', () => {
        count++;
      });

      unbindWatch = instance.watchKeys();

      dispatchKeys(['KeyA']);

      expect(count).toBe(1);
    });

    test('test asterisk to handle all events', () => {
      let count = 0;

      instance.hotkeys('*', () => {
        count++;
      });

      unbindWatch = instance.watchKeys();

      dispatchKeys(['KeyA']);
      dispatchKeys(['KeyB']);
      dispatchKeys(['KeyC']);
      dispatchKeys(['Space']);
      dispatchKeys(['Enter']);
      dispatchKeys(['MetaLeft']);

      expect(count).toBe(6);
    });

    test('test all other keys', () => {
      let count = 0;

      instance.hotkeys('a', () => {
        count++;
      });

      unbindWatch = instance.watchKeys();

      const keys = Object.keys(Layouts['en-us']);

      keys.forEach((key) => {
        // its the only one in the shortcut
        if (key === 'KeyA') return;
        dispatchKeys([key]);
      });

      expect(count).toBe(0);
    });

    test('test a combination', () => {
      let count = 0;

      instance.hotkeys('shift + a', () => {
        count++;
      });

      unbindWatch = instance.watchKeys();

      dispatchKeys(['ShiftLeft', 'KeyA']);

      expect(count).toBe(1);
    });

    test('test a multiple combinations', () => {
      const aux: string[] = [];

      instance.hotkeys('shift + a, meta + b', (e, h) => {
        aux.push(h.key);
      });

      unbindWatch = instance.watchKeys();

      dispatchKeys(['ShiftLeft', 'KeyA']);
      dispatchKeys(['MetaLeft', 'KeyB']);

      expect(aux).toEqual(['shift+a', 'meta+b']);
    });

    test('test multiple combinations with string', () => {
      let count = 0;

      instance.hotkeys('shift + a, shift + b', () => {
        count++;
      });

      unbindWatch = instance.watchKeys();

      dispatchKeys(['ShiftLeft', 'KeyA']);
      dispatchKeys(['ShiftLeft', 'KeyB']);

      expect(count).toBe(2);
    });

    test('test multiple combinations with string', () => {
      let count = 0;

      instance.hotkeys(['shift + a', 'shift + b'], () => {
        count++;
      });

      unbindWatch = instance.watchKeys();

      dispatchKeys(['ShiftLeft', 'KeyA']);
      dispatchKeys(['ShiftLeft', 'KeyB']);

      expect(count).toBe(2);
    });

    test('test a invalid key', () => {
      let count = 0;

      instance.hotkeys('shift + a', () => {
        count++;
      });

      unbindWatch = instance.watchKeys();

      dispatchKeys(['InvalidKey']);

      expect(count).toBe(0);
    });

    test('try stop propagation', () => {
      let count = 0;

      instance.hotkeys(
        'shift + a',
        (e, h) => {
          h.stopPropagation();
          count++;
        },
        { order: 1 },
      );

      instance.hotkeys(
        'shift + a',
        () => {
          count += 10;
        },
        { order: 2 },
      );

      unbindWatch = instance.watchKeys();

      dispatchKeys(['ShiftLeft', 'KeyA']);

      expect(count).toBe(1);
    });

    test('try change the order', () => {
      const aux: string[] = [];

      instance.hotkeys(
        'shift + a',
        () => {
          aux.push('first');
        },
        { order: 1 },
      );

      instance.hotkeys(
        'shift + a',
        () => {
          aux.push('second');
        },
        { order: 2 },
      );

      unbindWatch = instance.watchKeys();

      dispatchKeys(['ShiftLeft', 'KeyA']);

      expect(aux).toEqual(['first', 'second']);
    });

    test('try trigger action with keyup', () => {
      let count = 0;

      instance.hotkeys(
        'shift + a',
        () => {
          count++;
        },
        { event: 'keyup' },
      );

      unbindWatch = instance.watchKeys();

      dispatchKeyboardEvent('keydown', { code: 'ShiftLeft' });
      dispatchKeyboardEvent('keydown', { code: 'KeyA' });

      expect(count).toBe(0);

      dispatchKeyboardEvent('keyup', { code: 'ShiftLeft' });
      dispatchKeyboardEvent('keyup', { code: 'KeyA' });

      expect(count).toBe(1);
    });

    describe('test special keys', () => {
      test('shift', () => {
        let count = 0;

        instance.hotkeys('shift + a', () => {
          count++;
        });

        unbindWatch = instance.watchKeys();

        dispatchKeys(['ShiftLeft', 'KeyA']);
        dispatchKeys(['ShiftRight', 'KeyA']);

        expect(count).toBe(2);
      });

      test('ctrl', () => {
        let count = 0;

        instance.hotkeys('ctrl + a', () => {
          count++;
        });

        unbindWatch = instance.watchKeys();

        dispatchKeys(['ControlLeft', 'KeyA']);

        expect(count).toBe(1);
      });

      test('alt', () => {
        let count = 0;

        instance.hotkeys('alt + a', () => {
          count++;
        });

        unbindWatch = instance.watchKeys();

        dispatchKeys(['AltLeft', 'KeyA']);
        dispatchKeys(['AltRight', 'KeyA']);

        expect(count).toBe(2);
      });

      test('meta', () => {
        let count = 0;

        instance.hotkeys('meta + a', () => {
          count++;
        });

        unbindWatch = instance.watchKeys();

        dispatchKeys(['MetaLeft', 'KeyA']);
        dispatchKeys(['MetaRight', 'KeyA']);

        expect(count).toBe(2);
      });

      test('test special keys with event flags', () => {
        let count = 0;

        instance.hotkeys('shift + a, control + a, meta + a, option + a', () => {
          count++;
        });

        unbindWatch = instance.watchKeys();

        dispatchKeyboardEvent('keydown', { shiftKey: true, code: 'KeyA' });
        dispatchKeyboardEvent('keyup', { code: 'KeyA' });

        dispatchKeyboardEvent('keydown', { ctrlKey: true, code: 'KeyA' });
        dispatchKeyboardEvent('keyup', { code: 'KeyA' });

        dispatchKeyboardEvent('keydown', { metaKey: true, code: 'KeyA' });
        dispatchKeyboardEvent('keyup', { code: 'KeyA' });

        dispatchKeyboardEvent('keydown', { altKey: true, code: 'KeyA' });
        dispatchKeyboardEvent('keyup', { code: 'KeyA' });

        expect(count).toBe(4);
      });
    });

    describe('test unbind', () => {
      test('the callback and same scope', () => {
        let count = 0;

        const { unbind } = instance.hotkeys('shift + a', () => {
          count++;
        });

        unbindWatch = instance.watchKeys();

        dispatchKeys(['ShiftLeft', 'KeyA']);

        expect(count).toBe(1);

        unbind();

        dispatchKeys(['ShiftLeft', 'KeyA']);

        expect(count).toBe(1);
      });

      test('global unbind and same scope', () => {
        let count = 0;

        instance.hotkeys('shift + a', () => {
          count++;
        });

        unbindWatch = instance.watchKeys();

        dispatchKeys(['ShiftLeft', 'KeyA']);

        expect(count).toBe(1);

        instance.unbind('shift+a');

        dispatchKeys(['ShiftLeft', 'KeyA']);

        expect(count).toBe(1);
      });

      test('the callback and other scope', () => {
        let count = 0;

        const { unbind } = instance.hotkeys(
          'shift + a',
          () => {
            count++;
          },
          { scope: 'other' },
        );

        unbindWatch = instance.watchKeys();

        instance.setScope('other');

        dispatchKeys(['ShiftLeft', 'KeyA']);

        expect(count).toBe(1);

        unbind();

        dispatchKeys(['ShiftLeft', 'KeyA']);

        expect(count).toBe(1);
      });

      test('global unbind and other scope', () => {
        let count = 0;

        instance.hotkeys(
          'shift + a',
          () => {
            count++;
          },
          { scope: 'other' },
        );

        unbindWatch = instance.watchKeys();

        instance.setScope('other');

        dispatchKeys(['ShiftLeft', 'KeyA']);

        expect(count).toBe(1);

        instance.unbind('shift+a', 'other');

        dispatchKeys(['ShiftLeft', 'KeyA']);

        expect(count).toBe(1);
      });

      test('try unbind watcher', () => {
        unbindWatch = instance.watchKeys();

        dispatchKeyboardEvent('keydown', { code: 'KeyA' });

        const keys = instance.getKeysDown();
        expect(keys.has('a')).toBeTruthy();
        expect(keys.size).toBe(1);

        unbindWatch();

        dispatchKeyboardEvent('keydown', { code: 'KeyB' });

        expect(keys.size).toBe(0);
      });

      test('try unbindAll', () => {
        let count = 0;

        instance.hotkeys('shift + a', () => {
          count++;
        });

        unbindWatch = instance.watchKeys();

        dispatchKeys(['ShiftLeft', 'KeyA']);

        expect(count).toBe(1);

        instance.unbindAll();

        dispatchKeys(['ShiftLeft', 'KeyA']);

        expect(count).toBe(1);
      });

      test('try unbind without key', () => {
        let count = 0;

        instance.hotkeys('shift + a', () => {
          count++;
        });

        unbindWatch = instance.watchKeys();

        dispatchKeys(['ShiftLeft', 'KeyA']);

        expect(count).toBe(1);

        instance.unbind();

        dispatchKeys(['ShiftLeft', 'KeyA']);

        expect(count).toBe(1);
      });
    });
  });

  describe('try scopes', () => {
    test('test a single key with scope with different scope', () => {
      let count = 0;

      instance.hotkeys(
        'a',
        () => {
          count++;
        },
        { scope: 'testing' },
      );

      unbindWatch = instance.watchKeys();

      dispatchKeys(['KeyA']);

      expect(count).toBe(0);
    });

    test('test a single key with scope with same scope', () => {
      let count = 0;

      instance.hotkeys(
        'a',
        () => {
          count++;
        },
        { scope: 'testing' },
      );

      instance.setScope('testing');

      unbindWatch = instance.watchKeys();

      dispatchKeys(['KeyA']);

      expect(count).toBe(1);
    });

    test('try set and get scope', () => {
      instance.setScope('testing');

      expect(instance.getScope()).toBe('testing');
    });
  });

  test('change keyboard layout', () => {
    let count = 0;

    instance.hotkeys('-', () => {
      count++;
    });

    unbindWatch = instance.watchKeys();

    dispatchKeys(['Minus']);

    expect(count).toBe(1);

    instance.setKeyboardLayout(Layouts['es-la']);

    dispatchKeys(['Slash']);

    expect(count).toBe(2);
    expect(instance.getKeyboardLayout()).toBe(Layouts['es-la']);
  });

  test('test change the filter', () => {
    let count = 0;

    instance.hotkeys('a', () => {
      count++;
    });

    unbindWatch = instance.watchKeys();

    dispatchKeys(['KeyA']);

    expect(count).toBe(1);

    instance.setEventFilter(() => false);

    dispatchKeys(['KeyA']);

    expect(count).toBe(1);
  });

  describe('utils', () => {
    test('try getKeysDown', () => {
      const keys = instance.getKeysDown();

      unbindWatch = instance.watchKeys();

      dispatchKeyboardEvent('keydown', { code: 'KeyA' });

      expect(keys.has('a')).toBeTruthy();
      expect(keys.size).toBe(1);
    });

    test('try isPressed', () => {
      unbindWatch = instance.watchKeys();

      dispatchKeyboardEvent('keydown', { code: 'KeyA' });

      expect(instance.isPressed('a')).toBeTruthy();

      dispatchKeyboardEvent('keyup', { code: 'KeyA' });

      expect(instance.isPressed('a')).toBeFalsy();
    });
  });
});

function dispatchKeys(keys: string[], opts?: Omit<KeyboardEventInit, 'code'>) {
  keys.forEach((key) => {
    dispatchKeyboardEvent('keydown', { ...opts, code: key });
  });

  keys.forEach((key) => {
    dispatchKeyboardEvent('keyup', { ...opts, code: key });
  });
}

function dispatchKeyboardEvent(type: 'keydown' | 'keyup', opts: KeyboardEventInit, el: HTMLElement = document.body) {
  el.dispatchEvent(
    new KeyboardEvent(type, {
      bubbles: true,
      cancelable: true,
      ...opts,
    }),
  );
}
