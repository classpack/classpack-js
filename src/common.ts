export type WriteState = {
  bytes: Uint8Array;
  index: number;
  classes: Map<string, number>;
  refs: Map<any, number>;
};

export type ReadState = {
  bytes: Uint8Array;
  index: number;
  classes: string[][];
  refs: any[];
};

export type Class<T> = new (...args: any[]) => T;

export type Extension<T> = {
  type: number;
  target: Class<T>;
  write: (context: WriteState, options: Options, value: T) => void;
  read: (context: ReadState, options: Options) => T;
};

export type RecordOrMap = Record<string, any> | Map<string, any>;

export type Options = {
  preferMap?: boolean;
  preferFloat32?: boolean;
  preferNull?: boolean;
  noRefs?: boolean;
  extsByType: Map<number, Extension<any>>;
  extsByTarget: Map<Class<any>, Extension<any>>;
};

export const ensureCapacity = (context: WriteState, additionalSize: number) => {
  const requiredSize = context.index + additionalSize + 16;
  if (requiredSize > context.bytes.length) {
    const newBuffer = new Uint8Array(requiredSize * 2);
    newBuffer.set(context.bytes);
    context.bytes = newBuffer;
  }
};

export const zigzag = (value: number) => {
  const isNegative = value < 0;
  const abs = isNegative ? -value : value;
  const shifted = abs * 2;
  return shifted + +isNegative;
};

export const unzigzag = (value: number) => {
  const isNegative = (value & 1) === 1;
  const shifted = Math.floor(value / 2);
  return isNegative ? -shifted : shifted;
};
