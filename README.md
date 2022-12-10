# modern-hotkeys

<p align="center">
  <img src="https://img.shields.io/npm/l/modern-hotkeys">
  <img src="https://img.shields.io/npm/dt/modern-hotkeys">
  <img src="https://img.shields.io/npm/v/modern-hotkeys">
  <img src="https://img.shields.io/github/stars/pato12/modern-hotkeys?style=social">
</p>

modern-hotkeys is a library that makes it easy to create hotkeys for your applications. It uses modern APIs and supports multiple combinations of keyboard layouts. Furthermore, its customizable event filter and scope system allows you to easily add hotkeys to any part of your application. You can create a smooth and reliable hotkey experience for your users. It has no dependencies.

## How to install

```
yarn add modern-hotkeys
```

or

```
npm i modern-hotkeys
```

# Usage

```ts
import { hotkeys } from 'modern-hotkeys';

hotkeys('shift + a', (event, handler) => {
  // it always prevents default
  console.log('You pressed shift + a!');
});
```

# Main difference with Hotkeys

- Always prevent default all events
- Set an order in your shortcuts
- Stop propagation if you have multiple shorcuts with the same keys
- Use modern [APIs](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code)
- Prepared to work with different keyboard layouts such as Spanish (by default it's enUS)
- Create your own instance

# Supported Keys

Modern HotKeys understands the following modifiers: `⇧`, `shift`, `option`, `⌥`, `alt`, `ctrl`, `control`, `⌃`, `command`, and `⌘`.

To see all supported keys check out the layouts:

- [en-us](./src/layouts/en-us.ts)
- [es-es](./src/layouts/es-es.ts)
- [es-la](./src/layouts/es-la.ts)

If you need another layout you can create using the interface `KeyboardLayout`.

```ts
import { KeyboardLayout, hotkeys } from 'modern-hotkeys';

const MyLayout: KeyboardLayout = {
  Backspace: { value: 'backspace' },
  Tab: { value: 'tab' },
  NumLock: { value: 'NumLock' },
  ...
};

hotkeys.setKeyboardLayout(MyLayout);
```

# Define a shortcut

We export a global instance but you can create your own one.

Using the global instance

```ts
import { hotkeys } from 'modern-hotkeys';

hotkeys('command + s, ctrl + s', () => {
  alert('saving!');
});
```

Creating own instance

```ts
import { createHotkeys } from 'modern-hotkeys';

const instance = createHotkeys({ element: document.body });

instance.hotkeys('command + s, ctrl + s', () => {
  alert('saving!');
});
```

## API references

## createHotkeys

Creates a new instance of `hotkeys` with the specified options.

### Parameters

- `element` (`HTMLElement`): Element to bind events to.
- `keyboard` (`KeyboardLayout`): Keyboard layout to use. Default is `Layouts['en-us']`.
- `autoWatchKeys` (`boolean`): Whether to automatically watch for keys. Default is `true`.
- `watchCaps` (`boolean`): Whether to watch for the `CapsLock` key. Default is `false`.

## scope

Scopes allow you to isolate your shortcuts and only execute depending on the scope that your app is running.

```tsx
import { hotkeys } from 'modern-hotkeys';

hotkeys('command + s, ctrl + s', 'file', () => {
  alert('saving file! you are in the scope ' + hotkeys.getScope());
});

<button onClick={() => hotkeys.setScope('file')}>set file scope</button>;

// or if you have your instance

import { createHotkeys } from 'modern-hotkeys';

const instance = createHotkeys({ element: document.body });

instance.hotkeys('command + s, ctr + s', 'file', () => {
  alert('saving file! you are in the scope ' + instance.getScope());
});

<button onClick={() => instance.setScope('file')}>set file scope</button>;
```

## getKeysDown

Returns a `Set` with all keys down.

```ts
import { hotkeys } from 'modern-hotkeys';

hotkeys('a, b, c', () => {
  console.log(hotkeys.getKeysDown().has('a'));
  console.log(hotkeys.getKeysDown().has('b'));
  console.log(hotkeys.getKeysDown().has('c'));
});
```

## isPressed

Return a boolean to know if a key is pressed

```ts
import { hotkeys } from 'modern-hotkeys';

hotkeys('a, b, c', () => {
  console.log(hotkeys.isPressed('a'));
  console.log(hotkeys.isPressed('b'));
  console.log(hotkeys.isPressed('c'));
});
```

## layouts

You can get the default layouts exported by the library with `Layouts` or create your own one. To change the layout use the `setKeyboardLayout`.

```ts
import { hotkeys, Layouts } from 'modern-hotkeys';

hotkeys(...);

hotkeys.setKeyboardLayout(Layouts['es-la']);


// or if you have your instance

import { createHotkeys, Layouts } from 'modern-hotkeys';

const instance = createHotkeys({ element: document.body });

instance.hotkeys(...);
instance.setKeyboardLayout(Layouts['es-la']);
```

## unbind

Unbind a shortcut or all shortcuts.

```ts
import { hotkeys } from 'modern-hotkeys';

// unbind defined key
hotkeys.unbind('ctrl + s');

// unbind defined key and scope
hotkeys.unbind('command + s', 'my-scope-files');

// unbind all
hotkeys.unbind();

// or if you have your instance

import { createHotkeys } from 'modern-hotkeys';

const instance = createHotkeys({ element: document.body });

// unbind defined key
instance.unbind('ctrl + s');

// unbind defined key and scope
instance.unbind('command + s', 'my-scope-files');

// unbind all
instance.unbind();
```

## setEventFilter

Useful to filter input events and not fire shortcut when the user is writing on an input.

```ts
import { hotkeys } from 'modern-hotkeys';

// filter inputs
hotkeys.setEventFilter((e) => e.target?.tagName !== 'INPUT');

// allow all events
hotkeys.setEventFilter(() => true);

// or if you have your instance

import { createHotkeys } from 'modern-hotkeys';

const instance = createHotkeys({ element: document.body });

// filter inputs
instance.setEventFilter((e) => e.target?.tagName !== 'INPUT');

// allow all events
instance.setEventFilter(() => true);
```

## setVerbose

Show debug logs

```ts
import { createHotkeys } from 'modern-hotkeys';

const instance = createHotkeys({ element: document.body });

instance.setVerbose(true);

instance.hotkeys('shift + c', () => {
  ...
});
```

## stopPropagation

```ts
import { hotkeys } from 'modern-hotkeys';

hotkeys(
  'escape',
  (e, h) => {
    h.stopPropagation();
    alert('cancelling 1!');
  },
  { order: 0 },
);

hotkeys(
  'escape',
  () => {
    // it won't be triggered
    alert('cancelling 2!');
  },
  { order: 1 },
);
```

## Options

The third argument of `hotkeys` could be an object with options.

### order

You can scale the priority of a shortcut using negative numbers.

```ts
import { hotkeys } from 'modern-hotkeys';

hotkeys('escape', () => {
  alert('cancelling 2!');
});

hotkeys(
  'escape',
  (e, h) => {
    alert('cancelling 1!');
  },
  { order: -1000 },
);
```

### event

You can define what event will trigger your shortcut

```ts
import { hotkeys } from 'modern-hotkeys';

hotkeys(
  'control + s',
  () => {
    console.log('triggered on keydown');
  },
  { event: 'keydown' },
);

hotkeys(
  'control + s',
  () => {
    console.log('triggered on keyup');
  },
  { event: 'keyup' },
);
```

### scope

Define the scope of the shortcut

```ts
import { hotkeys } from 'modern-hotkeys';

hotkeys(
  'control + s',
  () => {
    console.log('triggered on scope myscope');
  },
  { scope: 'myscope' },
);
```

# License

MIT
