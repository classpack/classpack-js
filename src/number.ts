import { F32_TAG, F64_TAG, SINT_OFFSET, SINT_OFFSET_BIGINT } from "./layout";
import { ensureCapacity } from "./common";
import type { DecodeContext, EncodeContext, Options } from "./common";

export const decodeInt = (context: DecodeContext): number | bigint => {
  let value = 0;
  let multiplier = 1;
  let shift = 0;
  while (true) {
    const byte = context.buffer[context.offset++];
    const next = value + (byte & 0x7f) * multiplier;
    if (next > Number.MAX_SAFE_INTEGER) {
      context.offset--;
      return decodeBigInt(context, BigInt(value), BigInt(shift));
    }
    value = next;
    if ((byte & 0x80) === 0) break;
    multiplier *= 0x80;
    shift += 7;
  }
  return value;
};

export const decodeBigInt = (
  context: DecodeContext,
  value = 0n,
  shift = 0n
): bigint => {
  while (true) {
    const byte = context.buffer[context.offset++];
    value += BigInt(byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) break;
    shift += 7n;
  }
  return value;
};

export const encodeInt = (context: EncodeContext, value: number) => {
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

export const encodeBigInt = (context: EncodeContext, value: bigint) => {
  const isNegative = value < 0n;
  let intValue = isNegative ? -value : value;
  intValue = (intValue << 1n) + (isNegative ? 1n : 0n) + SINT_OFFSET_BIGINT;
  do {
    let byte = Number(intValue & 0x7fn);
    intValue >>= 7n;
    if (intValue !== 0n) {
      byte |= 0x80;
    }
    ensureCapacity(context, 1);
    context.buffer[context.offset++] = byte;
  } while (intValue !== 0n);
};

export const encodeNumber = (
  context: EncodeContext,
  options: Options,
  value: number
) => {
  if (Number.isInteger(value)) {
    const isNegative = value < 0;
    const abs = isNegative ? -value : value;
    const shifted = abs * 2;
    if (shifted > Number.MAX_SAFE_INTEGER) {
      encodeBigInt(context, BigInt(value));
      return;
    }
    encodeInt(context, shifted + SINT_OFFSET + +isNegative);
  } else {
    if (options.preferFloat32) {
      encodeFloat32(context, value);
    } else {
      encodeFloat64(context, value);
    }
  }
};

export const encodeFloat64 = (context: EncodeContext, value: number) => {
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

export const encodeFloat32 = (context: EncodeContext, value: number) => {
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

export const decodeFloat32 = (context: DecodeContext): number => {
  const view = new DataView(
    context.buffer.buffer,
    context.buffer.byteOffset + context.offset,
    4
  );
  const value = view.getFloat32(0, true);
  context.offset += 4;
  return value;
};

export const decodeFloat64 = (context: DecodeContext): number => {
  const view = new DataView(
    context.buffer.buffer,
    context.buffer.byteOffset + context.offset,
    8
  );
  const value = view.getFloat64(0, true);
  context.offset += 8;
  return value;
};
