import { readAny, writeAny } from "./any";
import type { Options, ReadState, WriteState } from "./common";
import { ensureCapacity } from "./common";
import { ARRAY_MAX, ARRAY_OFFSET, ZARRAY_TAG, ZERO } from "./layout";
import { registerRef, tryWriteRef } from "./ref";

export const writeArray = (
  context: WriteState,
  options: Options,
  values: any[]
) => {
  if (tryWriteRef(context, options, values)) {
    return;
  }

  if (values.length <= ARRAY_MAX) {
    ensureCapacity(context, 1);
    context.bytes[context.index++] = ARRAY_OFFSET + values.length;
    for (const value of values) {
      writeAny(context, options, value);
    }

    return;
  }
  
  ensureCapacity(context, 1);
  context.bytes[context.index++] = ZARRAY_TAG;
  for (const value of values) {
    writeAny(context, options, value);
  }
  context.bytes[context.index++] = ZERO;
};

export const readZArray = (context: ReadState, options: Options): any[] => {
  const array: any[] = [];

  registerRef(context, options, array);

  while (true) {
    if (context.bytes[context.index] === ZERO) {
      context.index++;
      break;
    }
    array.push(readAny(context, options));
  }
  return array;
};

export const readArrayOfLength = (
  context: ReadState,
  options: Options,
  length: number
): any[] => {
  const array = new Array(length);

  registerRef(context, options, array);

  for (let i = 0; i < length; i++) {
    array[i] = readAny(context, options);
  }
  return array;
};
