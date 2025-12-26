import { readAny, writeAny } from "./any";
import type { Options, ReadState, WriteState } from "./common";
import { ensureCapacity } from "./common";
import { ARRAY_MAX, ARRAY_OFFSET, ZARRAY_TAG, ZERO } from "./layout";
import { registerRef, tryWriteRef } from "./ref";

export const writeArray = (
  state: WriteState,
  options: Options,
  values: any[]
) => {
  if (tryWriteRef(state, options, values)) {
    return;
  }

  if (values.length <= ARRAY_MAX) {
    ensureCapacity(state, 1);
    state.data[state.index++] = ARRAY_OFFSET + values.length;
    for (const value of values) {
      writeAny(state, options, value);
    }

    return;
  }
  
  ensureCapacity(state, 1);
  state.data[state.index++] = ZARRAY_TAG;
  for (const value of values) {
    writeAny(state, options, value);
  }
  state.data[state.index++] = ZERO;
};

export const readZArray = (state: ReadState, options: Options): any[] => {
  const array: any[] = [];

  registerRef(state, options, array);

  while (true) {
    if (state.data[state.index] === ZERO) {
      state.index++;
      break;
    }
    array.push(readAny(state, options));
  }
  return array;
};

export const readArrayOfLength = (
  state: ReadState,
  options: Options,
  length: number
): any[] => {
  const array = new Array(length);

  registerRef(state, options, array);

  for (let i = 0; i < length; i++) {
    array[i] = readAny(state, options);
  }
  return array;
};
