/**
 * @jest-environment jsdom
 */

import { createHotkeys, Layouts } from '../dist';

describe('hotkets', () => {
  let instance: ReturnType<typeof createHotkeys>;

  beforeEach(() => {
    instance = createHotkeys({
      element: document.body,
      keyboard: Layouts['en-us'],
      autoWatchKeys: false,
    });

    // turn on verbose mode to see debug messages
    instance.setVerbose(false);
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

    instance.watchKeys();

    instance.setScope('testing');

    dispatchKeys(['KeyA']);

    expect(count).toBe(1);
  });

  test('try send an invalid handler', () => {
    expect(() => instance.hotkeys('a', null as any)).toThrow();
  });

  test('try clear keys on focus window', () => {
    instance.watchKeys();

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

      instance.watchKeys();

      dispatchKeys(['KeyA']);

      expect(count).toBe(1);
    });

    test('test asterisk to handle all events', () => {
      let count = 0;

      instance.hotkeys('*', () => {
        count++;
      });

      instance.watchKeys();

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

      instance.watchKeys();

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

      instance.watchKeys();

      dispatchKeys(['ShiftLeft', 'KeyA']);

      expect(count).toBe(1);
    });

    test('test a multiple combinations', () => {
      const aux: string[] = [];

      instance.hotkeys('shift + a, meta + b', (e, h) => {
        aux.push(h.key);
      });

      instance.watchKeys();

      dispatchKeys(['ShiftLeft', 'KeyA']);
      dispatchKeys(['MetaLeft', 'KeyB']);

      expect(aux).toEqual(['shift+a', 'meta+b']);
    });

    test('test multiple combinations with string', () => {
      let count = 0;

      instance.hotkeys('shift + a, shift + b', () => {
        count++;
      });

      instance.watchKeys();

      dispatchKeys(['ShiftLeft', 'KeyA']);
      dispatchKeys(['ShiftLeft', 'KeyB']);

      expect(count).toBe(2);
    });

    test('test multiple combinations with string', () => {
      let count = 0;

      instance.hotkeys(['shift + a', 'shift + b'], () => {
        count++;
      });

      instance.watchKeys();

      dispatchKeys(['ShiftLeft', 'KeyA']);
      dispatchKeys(['ShiftLeft', 'KeyB']);

      expect(count).toBe(2);
    });

    test('test a invalid key', () => {
      let count = 0;

      instance.hotkeys('shift + a', () => {
        count++;
      });

      instance.watchKeys();

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

      instance.watchKeys();

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

      instance.watchKeys();

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

      instance.watchKeys();

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

        instance.watchKeys();

        dispatchKeys(['ShiftLeft', 'KeyA']);
        dispatchKeys(['ShiftRight', 'KeyA']);

        expect(count).toBe(2);
      });

      test('ctrl', () => {
        let count = 0;

        instance.hotkeys('ctrl + a', () => {
          count++;
        });

        instance.watchKeys();

        dispatchKeys(['ControlLeft', 'KeyA']);

        expect(count).toBe(1);
      });

      test('alt', () => {
        let count = 0;

        instance.hotkeys('alt + a', () => {
          count++;
        });

        instance.watchKeys();

        dispatchKeys(['AltLeft', 'KeyA']);
        dispatchKeys(['AltRight', 'KeyA']);

        expect(count).toBe(2);
      });

      test('meta', () => {
        let count = 0;

        instance.hotkeys('meta + a', () => {
          count++;
        });

        instance.watchKeys();

        dispatchKeys(['MetaLeft', 'KeyA']);
        dispatchKeys(['MetaRight', 'KeyA']);

        expect(count).toBe(2);
      });
    });

    describe('test unbind', () => {
      test('the callback and same scope', () => {
        let count = 0;

        const { unbind } = instance.hotkeys('shift + a', () => {
          count++;
        });

        instance.watchKeys();

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

        instance.watchKeys();

        dispatchKeys(['ShiftLeft', 'KeyA']);

        expect(count).toBe(1);

        instance.unbind('shift+a');

        dispatchKeys(['ShiftLeft', 'KeyA']);

        expect(count).toBe(1);
      });

      test('try unbind a no registered hotkey', () => {
        let count = 0;

        instance.hotkeys('shift + a', () => {
          count++;
        });

        instance.watchKeys();

        dispatchKeys(['ShiftLeft', 'KeyA']);

        expect(count).toBe(1);

        instance.unbind('shift+b');

        dispatchKeys(['ShiftLeft', 'KeyA']);

        expect(count).toBe(2);

        instance.unbind('shift+c', 'other');

        dispatchKeys(['ShiftLeft', 'KeyA']);

        expect(count).toBe(3);
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

        instance.watchKeys();

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

        instance.watchKeys();

        instance.setScope('other');

        dispatchKeys(['ShiftLeft', 'KeyA']);

        expect(count).toBe(1);

        instance.unbind('shift+a', 'other');

        dispatchKeys(['ShiftLeft', 'KeyA']);

        expect(count).toBe(1);
      });

      test('try unbind watcher', () => {
        const unbindWatch = instance.watchKeys();

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

        instance.watchKeys();

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

        instance.watchKeys();

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

      instance.watchKeys();

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

      instance.watchKeys();

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

    instance.watchKeys();

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

    instance.watchKeys();

    dispatchKeys(['KeyA']);

    expect(count).toBe(1);

    instance.setEventFilter(() => false);

    dispatchKeys(['KeyA']);

    expect(count).toBe(1);
  });

  describe('watchKeys', () => {
    test('try watchKeys', () => {
      let count = 0;

      instance.hotkeys('a', () => {
        count++;
      });

      const unbind = instance.watchKeys();

      dispatchKeys(['KeyA']);

      expect(count).toBe(1);

      unbind();

      dispatchKeys(['KeyA']);

      expect(count).toBe(1);
    });

    test('try call twice times watchKeys', () => {
      const unbind1 = instance.watchKeys();
      const unbind2 = instance.watchKeys();

      expect(unbind1).toBe(unbind2);
    });
  });

  describe('trigger', () => {
    test('try simple trigger', () => {
      let count = 0;

      instance.hotkeys('a', () => {
        count++;
      });

      instance.watchKeys();

      instance.trigger('a');

      instance.trigger('b');

      expect(count).toBe(1);
    });

    test('try tigger with scope', () => {
      let count = 0;

      instance.hotkeys(
        'a',
        () => {
          count++;
        },
        { scope: 'testing' },
      );

      instance.watchKeys();

      instance.trigger('a', 'testing');

      instance.trigger('a', 'other');

      expect(count).toBe(1);
    });

    test('try tigger a not defined hotkeys', () => {
      let count = 0;

      instance.hotkeys('a', () => {
        count++;
      });

      instance.watchKeys();

      instance.trigger('b');

      expect(count).toBe(0);
    });
  });

  describe('utils', () => {
    test('try getKeysDown', () => {
      const keys = instance.getKeysDown();

      instance.watchKeys();

      dispatchKeyboardEvent('keydown', { code: 'KeyA' });

      expect(keys.has('a')).toBeTruthy();
      expect(keys.size).toBe(1);
    });

    test('try isPressed', () => {
      instance.watchKeys();

      dispatchKeyboardEvent('keydown', { code: 'KeyA' });

      expect(instance.isPressed('a')).toBeTruthy();

      dispatchKeyboardEvent('keyup', { code: 'KeyA' });

      expect(instance.isPressed('a')).toBeFalsy();
    });

    test('try getPressedKeyStrings', () => {
      instance.watchKeys();

      dispatchKeyboardEvent('keydown', { code: 'KeyA' });

      expect(instance.getPressedKeyStrings()).toEqual(['a']);
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
