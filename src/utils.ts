/**
 * Split a string into an array of strings using a separator
 */
export function getKeys(key: string, separator = ',') {
  // remove empty spaces
  key = key.replace(/\s/g, '');
  return safeSplit(key, separator);
}

const modifierAlias: Readonly<Record<string, string>> = Object.freeze({
  option: 'alt',
  command: 'meta',
  control: 'ctrl',
  capslock: 'caps',
  cmd: 'meta',
  '⇧': 'shift',
  '⌥': 'alt',
  '⌃': 'ctrl',
  '⌘': 'meta',
  '↩︎': 'enter',
});

const modifierOrder: Partial<Record<string, number>> = {
  caps: 1,
  ctrl: 2,
  meta: 3,
  shift: 4,
  alt: 5,
};

/**
 * Get a normalized key name from a key string (e.g. "shift+ctrl+alt+meta+a")
 */
export function normalizeKey(key: string, separator = '+') {
  key = key.replace(/\s/g, '');
  key = key.toLowerCase();

  return key
    .split(separator)
    .map((k) => modifierAlias[k] || k)
    .sort((a, b) => {
      const aIndex = modifierOrder[a] ?? -1;
      const bIndex = modifierOrder[b] ?? -1;

      if (aIndex > -1 && bIndex > -1) {
        return aIndex - bIndex;
      }

      if (aIndex > -1) {
        return -1;
      }

      if (bIndex > -1) {
        return 1;
      }

      return a.localeCompare(b);
    })
    .join(separator);
}

/**
 * Split a string by a separator, but append the separator to the end of the string if it ends with the separator
 * E.g. "a+b+c+" will be split into ["a", "b", "c+"] instead of ["a", "b", "c"]
 */
export function safeSplit(value: string, separator: string) {
  // if we have empty strings in keys, it means the shortcut was using a comma
  const parts = value.split(separator);

  let index = parts.lastIndexOf('');

  while (index > -1) {
    parts[index - 1] += separator;
    parts.splice(index, 1);
    index = parts.lastIndexOf('');
  }

  return parts;
}

const inputTagNames = Object.freeze(['input', 'textarea', 'select']);

/**
 * Check if the event should be ignored or not based on the target element
 */
export function defaultInputFilter(event: KeyboardEvent) {
  const target = event.target;

  if (target instanceof HTMLElement) {
    const tagName = target.tagName.toLowerCase();
    if (target.isContentEditable || inputTagNames.includes(tagName)) {
      return false;
    }
  }

  return true;
}
