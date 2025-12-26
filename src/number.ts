import { FLOAT32_TAG, FLOAT64_TAG, SINT_OFFSET } from "./layout";
import { ensureCapacity, zigzag } from "./common";
import type { ReadState, WriteState, Options } from "./common";

export const readVarint = (state: ReadState): number => {
  let value = 0;
  let multiplier = 1;
  while (true) {
    const byte = state.data[state.index++];
    value += (byte & 0x7f) * multiplier;
    if ((byte & 0x80) === 0) break;
    multiplier *= 0x80;
  }
  return value;
};

export const writeVarint = (state: WriteState, value: number) => {
  do {
    let byte = value & 0x7f;
    value = Math.floor(value / 0x80);
    if (value !== 0) {
      byte |= 0x80;
    }
    ensureCapacity(state, 1);
    state.data[state.index++] = byte;
  } while (value !== 0);
};

const MAX_INT = 2 ** 52 - 49;

/**
 * Encode a number either as a float or as a zigzag variable-length integer.
 * @param state
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
  state: WriteState,
  options: Options,
  value: number
) => {
  if (Number.isInteger(value) && value >= -MAX_INT && value <= MAX_INT) {
    writeVarint(state, zigzag(value) + SINT_OFFSET);
  } else {
    if (options.preferFloat32) {
      writeFloat32(state, value);
    } else {
      writeFloat64(state, value);
    }
  }
};

export const writeFloat64 = (state: WriteState, value: number) => {
  ensureCapacity(state, 9);
  state.data[state.index++] = FLOAT64_TAG;
  state.view.setFloat64(state.index, value, true);
  state.index += 8;
};

export const writeFloat32 = (state: WriteState, value: number) => {
  ensureCapacity(state, 5);
  state.data[state.index++] = FLOAT32_TAG;
  state.view.setFloat32(state.index, value, true);
  state.index += 4;
};

export const readFloat32 = (state: ReadState): number => {
  const value = state.view.getFloat32(state.index, true);
  state.index += 4;
  return value;
};

export const readFloat64 = (state: ReadState): number => {
  const value = state.view.getFloat64(state.index, true);
  state.index += 8;
  return value;
};
