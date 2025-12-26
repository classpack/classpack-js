export type WriteState = {
  data: Buffer | Uint8Array;
  view: DataView;
  index: number;
  classes: Map<string, number>;
  refs: Map<any, number>;
};

export type ReadState = {
  data: Buffer | Uint8Array;
  view: DataView;
  index: number;
  classes: string[][];
  refs: any[];
};

export type Class<T> = new (...args: any[]) => T;

export type Extension<T> = {
  target: Class<T>;
  write: (context: WriteState, options: Options, value: T) => void;
  read: (context: ReadState, options: Options) => T;
};

export type RecordOrMap = Record<string, any> | Map<string, any>;

export type Options = {
  initLength: number;
  exts: Extension<any>[];
  preferMap?: boolean;
  preferFloat32?: boolean;
  noRefs?: boolean;
  keepUndefined?: boolean;
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

export let makeBuffer: (size: number) => Buffer | Uint8Array;

export let builtinEncodeUtf8:
  | undefined
  | ((buf: Buffer | Uint8Array, offset: number, str: string) => number);

export let builtinDecodeUtf8:
  | undefined
  | ((buf: Buffer | Uint8Array, offset: number, stop: number) => string);

export const ensureCapacity = (state: WriteState, additionalSize: number) => {
  const requiredSize = state.index + additionalSize + 16;
  if (requiredSize > state.data.length) {
    const newBuffer = makeBuffer(requiredSize * 2);
    newBuffer.set(state.data);
    state.data = newBuffer;
  }
  state.view = makeDataView(state.data);
};

if (typeof Buffer !== "undefined") {
  makeBuffer = (size: number) => Buffer.allocUnsafe(size);
  builtinEncodeUtf8 = (buf, offset, str) => (buf as Buffer).write(str, offset);
  builtinDecodeUtf8 = (buf, offset, stop) => buf.toString("utf8", offset, stop);
} else {
  makeBuffer = (size: number) => new Uint8Array(size);

  if (typeof TextEncoder !== "undefined") {
    const encoder = new TextEncoder();
    builtinEncodeUtf8 = (buffer, offset, value) =>
      encoder.encodeInto(value, buffer.subarray(offset)).written;

    const decoder = new TextDecoder();
    builtinDecodeUtf8 = (buf, offset, length) =>
      decoder.decode(buf.subarray(offset, offset + length));
  }
}

export const makeDataView = (buffer: Buffer | Uint8Array) =>
  new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
