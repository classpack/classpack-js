import { F32_TAG, F64_TAG, SINT_OFFSET } from "./constants";
import {
  ensureCapacity,
  type DecodeContext,
  type EncodeContext,
} from "./context";

export function decodeVint(context: DecodeContext): number {
  let value = 0;
  let shift = 0;
  while (true) {
    const byte = context.buffer[context.offset++];
    value |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) break;
    shift += 7;
  }
  return value;
}

export function encodeVint(context: EncodeContext, value: number) {
  do {
    let byte = value & 0x7f;
    value >>= 7;
    if (value !== 0) {
      byte |= 0x80;
    }
    ensureCapacity(context, 1);
    context.buffer[context.offset++] = byte;
  } while (value !== 0);
}

export function encodeNumber(context: EncodeContext, value: number) {
  if (Number.isInteger(value)) {
    const isNegative = value < 0;
    const intValue = (Math.abs(value) << 1) + +isNegative;
    encodeVint(context, intValue + SINT_OFFSET);
  } else {
    encodeF64(context, value);
  }
}

export function encodeF64(context: EncodeContext, value: number) {
  ensureCapacity(context, 9);
  context.buffer[context.offset++] = F64_TAG;
  const view = new DataView(
    context.buffer.buffer,
    context.buffer.byteOffset + context.offset,
    8
  );
  view.setFloat64(0, value, true);
  context.offset += 8;
}

export function encodeF32(context: EncodeContext, value: number) {
  ensureCapacity(context, 5);
  context.buffer[context.offset++] = F32_TAG;
  const view = new DataView(
    context.buffer.buffer,
    context.buffer.byteOffset + context.offset,
    4
  );
  view.setFloat32(0, value, true);
  context.offset += 4;
}

export function decodeF32(context: DecodeContext): number {
  const view = new DataView(
    context.buffer.buffer,
    context.buffer.byteOffset + context.offset,
    4
  );
  const value = view.getFloat32(0, true);
  context.offset += 4;
  return value;
}

export function decodeF64(context: DecodeContext): number {
  const view = new DataView(
    context.buffer.buffer,
    context.buffer.byteOffset + context.offset,
    8
  );
  const value = view.getFloat64(0, true);
  context.offset += 8;
  return value;
}
