export type EncodeContext = {
  buffer: Uint8Array;
  offset: number;
  classMap: Record<string, number>;
  classCount: number;
};

export type DecodeContext = {
  buffer: Uint8Array;
  offset: number;
  classList: string[][];
};

export function ensureCapacity(context: EncodeContext, additionalSize: number) {
  const requiredSize = context.offset + additionalSize + 16;
  if (requiredSize > context.buffer.length) {
    const newBuffer = new Uint8Array(requiredSize * 2);
    newBuffer.set(context.buffer);
    context.buffer = newBuffer;
  }
}

export function makeDecodeContext(buffer: Uint8Array): DecodeContext {
  return {
    buffer,
    offset: 0,
    classList: [],
  };
}

export function makeEncodeContext(buffer: Uint8Array): EncodeContext {
  return {
    buffer,
    offset: 0,
    classMap: {},
    classCount: 0,
  };
}
