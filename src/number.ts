import { FLOAT32_TAG, FLOAT64_TAG, SINT_OFFSET } from "./layout";
import { ensureCapacity, zigzag } from "./common";
import type { ReadState, WriteState, Options } from "./common";

export const readVarint = (context: ReadState): number => {
  let value = 0;
  let multiplier = 1;
  while (true) {
    const byte = context.bytes[context.index++];
    value += (byte & 0x7f) * multiplier;
    if ((byte & 0x80) === 0) break;
    multiplier *= 0x80;
  }
  return value;
};

export const writeVarint = (context: WriteState, value: number) => {
  do {
    let byte = value & 0x7f;
    value = Math.floor(value / 0x80);
    if (value !== 0) {
      byte |= 0x80;
    }
    ensureCapacity(context, 1);
    context.bytes[context.index++] = byte;
  } while (value !== 0);
};

const MAX_INT = 2 ** 52 - 49;

/**
 * Encode a number either as a float or as a zigzag variable-length integer.
 * @param context
 * @param options
 * @param value
 *
 * When x >= 0:
 * 2x + 96 <= 2^53 - 1
 * 2x <= 2^53 - 97
 * x <= 2^52 - 49 (rounded up)
 *
 * When x < 0:
 * -2x + 96 + 1 <= 2^53 - 1
 * -2x + 97 <= 2^53 - 1
 * -2x <= 2^53 - 98
 * -x <= 2^52 - 49
 * x >= -(2^52 - 49)
 *
 * Empirically, the range is larger, but this is a safe bound.
 */
export const writeNumber = (
  context: WriteState,
  options: Options,
  value: number
) => {
  if (Number.isInteger(value) && value >= -MAX_INT && value <= MAX_INT) {
    writeVarint(context, zigzag(value) + SINT_OFFSET);
  } else {
    if (options.preferFloat32) {
      writeFloat32(context, value);
    } else {
      writeFloat64(context, value);
    }
  }
};

export const writeFloat64 = (context: WriteState, value: number) => {
  ensureCapacity(context, 9);
  context.bytes[context.index++] = FLOAT64_TAG;
  const view = new DataView(
    context.bytes.buffer,
    context.bytes.byteOffset + context.index,
    8
  );
  view.setFloat64(0, value, true);
  context.index += 8;
};

export const writeFloat32 = (context: WriteState, value: number) => {
  ensureCapacity(context, 5);
  context.bytes[context.index++] = FLOAT32_TAG;
  const view = new DataView(
    context.bytes.buffer,
    context.bytes.byteOffset + context.index,
    4
  );
  view.setFloat32(0, value, true);
  context.index += 4;
};

export const readFloat32 = (context: ReadState): number => {
  const view = new DataView(
    context.bytes.buffer,
    context.bytes.byteOffset + context.index,
    4
  );
  const value = view.getFloat32(0, true);
  context.index += 4;
  return value;
};

export const readFloat64 = (context: ReadState): number => {
  const view = new DataView(
    context.bytes.buffer,
    context.bytes.byteOffset + context.index,
    8
  );
  const value = view.getFloat64(0, true);
  context.index += 8;
  return value;
};
