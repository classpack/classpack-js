import { decodeAny, encodeAny } from "./any";
import { ARRAY_MAX, ARRAY_OFFSET, ZARRAY_TAG, SENTINEL } from "./layout";
import type { EncodeContext, DecodeContext, Options } from "./common";
import { ensureCapacity } from "./common";

export const encodeArray = (
  context: EncodeContext,
  options: Options,
  values: any[]
) => {
  if (values.length <= ARRAY_MAX) {
    ensureCapacity(context, 1);
    context.buffer[context.offset++] = ARRAY_OFFSET + values.length;
    for (const value of values) {
      encodeAny(context, options, value);
    }

    return;
  }
  ensureCapacity(context, 1);
  context.buffer[context.offset++] = ZARRAY_TAG;
  for (const value of values) {
    encodeAny(context, options, value);
  }
  context.buffer[context.offset++] = SENTINEL;
};

export const decodeZArray = (
  context: DecodeContext,
  options: Options
): any[] => {
  const array = [];
  while (true) {
    if (context.buffer[context.offset] === SENTINEL) {
      context.offset++;
      break;
    }
    array.push(decodeAny(context, options));
  }
  return array;
};

export const decodeArrayOfLength = (
  context: DecodeContext,
  options: Options,
  length: number
): any[] => {
  const array = new Array(length);
  for (let i = 0; i < length; i++) {
    array[i] = decodeAny(context, options);
  }
  return array;
};
