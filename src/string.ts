import { STRING_MAX, STRING_OFFSET, ZSTRING_TAG, SENTINEL } from "./constants";
import type { DecodeContext, EncodeContext } from "./context";
import { ensureCapacity } from "./context";

export function decodeCString(context: DecodeContext): string {
  const start = context.offset;
  while (context.buffer[context.offset] !== 0) {
    context.offset++;
  }
  const keyBytes = context.buffer.slice(start, context.offset);
  context.offset++;
  return new TextDecoder().decode(keyBytes);
}

export function encodeCString(context: EncodeContext, value: string) {
  const strBytes = new TextEncoder().encode(value);
  ensureCapacity(context, strBytes.length + 1);
  context.buffer.set(strBytes, context.offset);
  context.offset += strBytes.length;
  context.buffer[context.offset++] = 0;
}

export function decodeStringOfLength(
  context: DecodeContext,
  length: number
): string {
  const strBytes = context.buffer.slice(
    context.offset,
    context.offset + length
  );
  context.offset += length;
  return new TextDecoder().decode(strBytes);
}

export function encodeString(context: EncodeContext, value: string) {
  const strBytes = new TextEncoder().encode(value);

  if (strBytes.length <= STRING_MAX) {
    ensureCapacity(context, strBytes.length + 1);
    context.buffer[context.offset++] = STRING_OFFSET + strBytes.length;
    context.buffer.set(strBytes, context.offset);
    context.offset += strBytes.length;
  } else {
    ensureCapacity(context, strBytes.length + 2);
    context.buffer[context.offset++] = ZSTRING_TAG;
    context.buffer.set(strBytes, context.offset);
    context.offset += strBytes.length;
    context.buffer[context.offset++] = SENTINEL;
  }
}
