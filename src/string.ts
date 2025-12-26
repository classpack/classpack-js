import { STRING_MAX, STRING_OFFSET, ZSTRING_TAG, ZERO } from "./layout";
import type { ReadState, WriteState } from "./common";
import { ensureCapacity, builtinDecodeUtf8, builtinEncodeUtf8 } from "./common";
import { decodeUtf8, encodeUtf8 } from "./utf8";

export const decodeCString = (state: ReadState): string => {
  const start = state.index;
  while (state.data[state.index] !== 0) {
    state.index++;
  }
  const out = decodeUtf8(state.data, start, state.index);
  state.index++;
  return out;
};

export const encodeCString = (state: WriteState, value: string) => {
  ensureCapacity(state, value.length * 4 + 1);
  state.index += encodeUtf8(state.data, state.index, value);
  state.data[state.index++] = 0;
};

export const decodeStringOfLength = (
  state: ReadState,
  length: number
): string => {
  const out = decodeUtf8(state.data, state.index, state.index + length);
  state.index += length;
  return out;
};

export const encodeString = (state: WriteState, value: string) => {
  ensureCapacity(state, value.length * 4 + 2);
  const start = state.index++;
  const length = encodeUtf8(state.data, state.index, value);
  state.index += length;

  if (length <= STRING_MAX) {
    state.data[start] = STRING_OFFSET + length;
  } else {
    state.data[start] = ZSTRING_TAG;
    state.data[state.index++] = ZERO;
  }
};
