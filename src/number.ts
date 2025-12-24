import { F32_TAG, F64_TAG, SINT_OFFSET } from "./layout";
import { ensureCapacity } from "./common";
import type { DecodeContext, EncodeContext, Options } from "./common";

export const decodeVint = (context: DecodeContext): number => {
  let value = 0;
  let shift = 0;
  while (true) {
    const byte = context.buffer[context.offset++];
    value |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) break;
    shift += 7;
  }
  return value;
};

export const encodeVint = (context: EncodeContext, value: number) => {
  do {
    let byte = value & 0x7f;
    value >>= 7;
    if (value !== 0) {
      byte |= 0x80;
    }
    ensureCapacity(context, 1);
    context.buffer[context.offset++] = byte;
  } while (value !== 0);
};

export const encodeNumber = (
  context: EncodeContext,
  options: Options,
  value: number
) => {
  if (Number.isInteger(value)) {
    const isNegative = value < 0;
    const intValue = (Math.abs(value) << 1) + +isNegative;
    encodeVint(context, intValue + SINT_OFFSET);
  } else {
    if (options.useFloat32) {
      encodeF32(context, value);
    } else {
      encodeF64(context, value);
    }
  }
};

export const encodeF64 = (context: EncodeContext, value: number) => {
  ensureCapacity(context, 9);
  context.buffer[context.offset++] = F64_TAG;
  const view = new DataView(
    context.buffer.buffer,
    context.buffer.byteOffset + context.offset,
    8
  );
  view.setFloat64(0, value, true);
  context.offset += 8;
};

export const encodeF32 = (context: EncodeContext, value: number) => {
  ensureCapacity(context, 5);
  context.buffer[context.offset++] = F32_TAG;
  const view = new DataView(
    context.buffer.buffer,
    context.buffer.byteOffset + context.offset,
    4
  );
  view.setFloat32(0, value, true);
  context.offset += 4;
};

export const decodeF32 = (context: DecodeContext): number => {
  const view = new DataView(
    context.buffer.buffer,
    context.buffer.byteOffset + context.offset,
    4
  );
  const value = view.getFloat32(0, true);
  context.offset += 4;
  return value;
};

export const decodeF64 = (context: DecodeContext): number => {
  const view = new DataView(
    context.buffer.buffer,
    context.buffer.byteOffset + context.offset,
    8
  );
  const value = view.getFloat64(0, true);
  context.offset += 8;
  return value;
};
