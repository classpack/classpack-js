import { STRING_MAX, STRING_OFFSET, ZSTRING_TAG, ZERO } from "./layout";
import type { ReadState, WriteState } from "./common";
import { ensureCapacity } from "./common";

export const decodeCString = (context: ReadState): string => {
  const start = context.index;
  while (context.bytes[context.index] !== 0) {
    context.index++;
  }
  const keyBytes = context.bytes.slice(start, context.index);
  context.index++;
  return new TextDecoder().decode(keyBytes);
};

export const encodeCString = (context: WriteState, value: string) => {
  const strBytes = new TextEncoder().encode(value);
  ensureCapacity(context, strBytes.length + 1);
  context.bytes.set(strBytes, context.index);
  context.index += strBytes.length;
  context.bytes[context.index++] = 0;
};

export const decodeStringOfLength = (
  context: ReadState,
  length: number
): string => {
  const strBytes = context.bytes.slice(
    context.index,
    context.index + length
  );
  context.index += length;
  return new TextDecoder().decode(strBytes);
};

export const encodeString = (context: WriteState, value: string) => {
  const strBytes = new TextEncoder().encode(value);

  if (strBytes.length <= STRING_MAX) {
    ensureCapacity(context, strBytes.length + 1);
    context.bytes[context.index++] = STRING_OFFSET + strBytes.length;
    context.bytes.set(strBytes, context.index);
    context.index += strBytes.length;
  } else {
    ensureCapacity(context, strBytes.length + 2);
    context.bytes[context.index++] = ZSTRING_TAG;
    context.bytes.set(strBytes, context.index);
    context.index += strBytes.length;
    context.bytes[context.index++] = ZERO;
  }
};
