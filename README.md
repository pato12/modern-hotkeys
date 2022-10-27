# modern-hotkeys

<p align="center">
  <img src="https://img.shields.io/npm/l/modern-hotkeys">
  <img src="https://img.shields.io/npm/dt/modern-hotkeys">
  <img src="https://img.shields.io/npm/v/modern-hotkeys">
  <img src="https://img.shields.io/github/stars/pato12/modern-hotkeys?style=social">
</p>

modern-hotkeys is a brand new library to create keyboard shortcuts using modern APIs. It has backward compatibility with hotkeys. Has no dependencies.

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

- always prevent default all events
- set an order in your shortcuts
- stop propagation if you have multiple shorcuts with the same keys
- use modern [apis](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code)
- prepared to work with different keyboard layouts such as Spanish (by default it's enUS)
- create your own instance

# Supported Keys

Modern HotKeys understands the following modifiers: `⇧`, `shift`, `option`, `⌥`, `alt`, `ctrl`, `control`, `⌃`, `command`, and `⌘`.

To see all suported keys check out the layouts:

- [en-us](./src/layouts/en-us.ts)
- [es-es](./src/layouts/es-es.ts)
- [es-la](./src/layouts/es-la.ts)

If you need an other layout you can create using the interface `KeyboardLayout`.

```ts
import { KeyboardLayout, setKeyboardLayout } from 'modern-hotkeys';

const MyLayout: KeyboardLayout = {
  Backspace: { value: 'backspace' },
  Tab: { value: 'tab' },
  NumLock: { value: 'NumLock' },
  ...
};

setKeyboardLayout(MyLayout);
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

## scope

Scopes allow you to isolate your shortcuts and only execute depending on the scope that your app is running.

```tsx
import { hotkeys, setScope, getScope } from 'modern-hotkeys';

hotkeys('command + s, ctrl + s', 'file', () => {
  alert('saving file! you are in the scope ' + getScope());
});

<button onClick={() => setScope('file')}>set file scope</button>;

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
import { hotkeys, getKeysDown } from 'modern-hotkeys';

hotkeys('a, b, c', () => {
  console.log(getKeysDown.has('a'));
  console.log(getKeysDown.has('b'));
  console.log(getKeysDown.has('c'));
});
```

## isPressed

Return a boolean to know if a key is pressed

```ts
import { hotkeys, isPressed } from 'modern-hotkeys';

hotkeys('a, b, c', () => {
  console.log(isPressed('a'));
  console.log(isPressed('b'));
  console.log(isPressed('c'));
});
```

## layouts

You can get the default layouts exported by the library with `Layouts` or create your own one. To change the layout use the `setKeyboardLayout`.

```ts
import { hotkeys, setKeyboardLayout, Layouts } from 'modern-hotkeys';

hotkeys(...);

setKeyboardLayout(Layouts['es-la']);


// or if you have your instance

import { createHotkeys, Layouts } from 'modern-hotkeys';

const instance = createHotkeys({ element: document.body });

instance.hotkeys(...);
instance.setKeyboardLayout(Layouts['es-la']);
```

## unbind

Unbind a shortcut or all shortcuts.

```ts
import { unbind } from 'modern-hotkeys';

// unbind defined key
unbind('ctrl + s');

// unbind defined key and scope
unbind('command + s', 'my-scope-files');

// unbind all
unbind();

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

Useful to filter input events and not fire shortcut when the user is writing on a input.

```ts
import { setEventFilter } from 'modern-hotkeys';

// filter inputs
setEventFilter((e) => e.target?.tagName !== 'INPUT');

// allow all events
setEventFilter(() => true);

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
    // it won't be fired
    alert('cancelling 2!');
  },
  { order: 1 },
);
```

## options

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
