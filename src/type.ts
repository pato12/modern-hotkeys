export type TriggerEvent = 'keydown' | 'keyup';

export type HotkeysEvent = { key: string; stopPropagation: () => void };

export type HotkeysHandler = (e: KeyboardEvent, h: HotkeysEvent) => any;

export type HandlerItem = {
  action: HotkeysHandler;
  order: number;
  event: TriggerEvent;
  scope?: string;
};
