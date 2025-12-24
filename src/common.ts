export type EncodeContext = {
  buffer: Uint8Array;
  offset: number;
  classMap: Map<string, number>;
  classCount: number;
};

export type DecodeContext = {
  buffer: Uint8Array;
  offset: number;
  classList: string[][];
};

export type Class<T> = new (...args: any[]) => T;

export type Extension<T> = {
  type: number;
  target: Class<T>;
  encode: (context: EncodeContext, options: Options, value: T) => void;
  decode: (context: DecodeContext, options: Options) => T;
};

export type RecordOrMap = Record<string, any> | Map<string, any>;

export type Options = {
  useMap: boolean;
  useFloat32: boolean;
  extsByType: Map<number, Extension<any>>;
  extsByTarget: Map<Class<any>, Extension<any>>;
};

export const ensureCapacity = (
  context: EncodeContext,
  additionalSize: number
) => {
  const requiredSize = context.offset + additionalSize + 16;
  if (requiredSize > context.buffer.length) {
    const newBuffer = new Uint8Array(requiredSize * 2);
    newBuffer.set(context.buffer);
    context.buffer = newBuffer;
  }
};
