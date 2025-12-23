import { decode, encode } from ".";
import { ARRAY_MAX, ARRAY_OFFSET, ZARRAY_TAG, SENTINEL } from "./constants";
import type { EncodeContext, DecodeContext } from "./context";
import { ensureCapacity } from "./context";

export function encodeArray(context: EncodeContext, values: any[]) {
  if (values.length <= ARRAY_MAX) {
    ensureCapacity(context, 1);
    context.buffer[context.offset++] = ARRAY_OFFSET + values.length;
    for (const value of values) {
      encode(context, value);
    }

    return;
  }
  ensureCapacity(context, 1);
  context.buffer[context.offset++] = ZARRAY_TAG;
  for (const value of values) {
    encode(context, value);
  }
  context.buffer[context.offset++] = SENTINEL;
}

export function decodeZArray(context: DecodeContext): any[] {
  const array = [];
  while (true) {
    if (context.buffer[context.offset] === SENTINEL) {
      context.offset++;
      break;
    }
    array.push(decode(context));
  }
  return array;
}

export function decodeArrayOfLength(
  context: DecodeContext,
  length: number
): any[] {
  const array = new Array(length);
  for (let i = 0; i < length; i++) {
    array[i] = decode(context);
  }
  return array;
}
