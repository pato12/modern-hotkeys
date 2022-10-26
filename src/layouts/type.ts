export type LayoutKey = {
  value: string;
  withShift?: string;
  withAlt?: string;
  withShiftAlt?: string;
};

export type KeyboardLayout = Record<string, LayoutKey>;
