import {
  ensureCapacity,
  type ReadState,
  type WriteState,
} from "./common";
import { BYTES_TAG } from "./layout";
import { readVarint, writeVarint } from "./number";

export const writeBytes = (context: WriteState, value: Uint8Array) => {
  const byteLength = value.byteLength;
  ensureCapacity(context, 1);
  context.bytes[context.index++] = BYTES_TAG;
  writeVarint(context, byteLength);
  ensureCapacity(context, byteLength);
  context.bytes.set(value, context.index);
  context.index += byteLength;
};

export const readBytes = (context: ReadState): Uint8Array => {
  const length = readVarint(context);
  const bytes = context.bytes.slice(context.index, context.index + length);
  context.index += length;
  return bytes;
};
