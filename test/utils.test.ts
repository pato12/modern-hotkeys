/**
 * @jest-environment jsdom
 */

import { safeSplit, normalizeKey, getKeys, defaultInputFilter } from '../dist/utils';

describe('test utils', () => {
  describe('safeSplit', () => {
    it('try safe split', () => {
      expect(safeSplit('a+b+c', '+')).toEqual(['a', 'b', 'c']);
      expect(safeSplit('a+b+c', '-')).toEqual(['a+b+c']);
      expect(safeSplit('a+b+c', '')).toEqual(['a', '+', 'b', '+', 'c']);
    });

    it('try safe split with empty string', () => {
      expect(safeSplit('a+b+c+', '+')).toEqual(['a', 'b', 'c+']);
      expect(safeSplit('a+b+c+', '-')).toEqual(['a+b+c+']);
      expect(safeSplit('a+b+c+', '')).toEqual(['a', '+', 'b', '+', 'c', '+']);
    });

    it('try safe split with empty string', () => {
      expect(safeSplit('a+b+c++', '+')).toEqual(['a', 'b', 'c', '+']);
    });
  });

  describe('normalizeKey', () => {
    it('try normalize key', () => {
      expect(normalizeKey('shift + ctrl + alt + cmd + a')).toEqual('ctrl+cmd+shift+alt+a');
    });

    it('try normalize with differente separator', () => {
      expect(normalizeKey('shift - control - alt - command - a', '-')).toEqual('ctrl-cmd-shift-alt-a');
    });

    describe('try modifiers', () => {
      it('try shift', () => {
        expect(normalizeKey('Shift')).toEqual('shift');
        expect(normalizeKey('⇧')).toEqual('shift');
      });

      it('try alt', () => {
        expect(normalizeKey('Alt')).toEqual('alt');
        expect(normalizeKey('Option')).toEqual('alt');
        expect(normalizeKey('⌥')).toEqual('alt');
      });

      it('try ctrl', () => {
        expect(normalizeKey('ctrl')).toEqual('ctrl');
        expect(normalizeKey('Control')).toEqual('ctrl');
        expect(normalizeKey('⌃')).toEqual('ctrl');
      });

      it('try cmd', () => {
        expect(normalizeKey('cmd')).toEqual('cmd');
        expect(normalizeKey('command')).toEqual('cmd');
        expect(normalizeKey('⌘')).toEqual('cmd');
        expect(normalizeKey('meta')).toEqual('cmd');
      });

      it('try caps', () => {
        expect(normalizeKey('Caps')).toEqual('caps');
        expect(normalizeKey('CapsLock')).toEqual('caps');
      });

      it('try enter', () => {
        expect(normalizeKey('Enter')).toEqual('enter');
        expect(normalizeKey('↩︎')).toEqual('enter');
      });
    });
  });

  describe('getKeys', () => {
    it('try get keys', () => {
      expect(getKeys('a+b+c, d+e+f')).toEqual(['a+b+c', 'd+e+f']);
      expect(getKeys('a+b+c, d+e+f+,')).toEqual(['a+b+c', 'd+e+f+,']);
    });

    it('try a different separator', () => {
      expect(getKeys('a+b+c, d+e+f', '-')).toEqual(['a+b+c,d+e+f']);
      expect(getKeys('a+b+c - d+e+f+,', '-')).toEqual(['a+b+c', 'd+e+f+,']);
    });
  });

  describe('defaultInputFilter', () => {
    it('try default input filter', () => {
      const input = createKeyboardEvent(document.createElement('input'));
      const select = createKeyboardEvent(document.createElement('select'));
      const textarea = createKeyboardEvent(document.createElement('textarea'));
      const div = createKeyboardEvent(document.createElement('div'));

      expect(defaultInputFilter(input)).toBe(false);
      expect(defaultInputFilter(select)).toBe(false);
      expect(defaultInputFilter(textarea)).toBe(false);
      expect(defaultInputFilter(div)).toBe(true);
    });
  });
});

function createKeyboardEvent(target: HTMLElement, type: 'keydown' | 'keyup' = 'keydown', opts: KeyboardEventInit = {}) {
  const event = new KeyboardEvent(type, {
    bubbles: true,
    cancelable: true,
    ...opts,
  });

  Object.defineProperty(event, 'target', {
    writable: false,
    value: target,
  });

  return event;
}
