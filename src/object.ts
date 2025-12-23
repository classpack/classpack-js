import { encode, decode } from ".";
import {
  CLASS_OFFSET,
  OBJECT_MAX,
  OBJECT_OFFSET,
  ZOBJECT_TAG,
  SENTINEL,
  CLASS_MAX,
} from "./constants";
import type { DecodeContext, EncodeContext } from "./context";
import { decodeCString, encodeCString } from "./string";

export function encodeObject(context: EncodeContext, obj: Record<string, any>) {
  const keys = Object.keys(obj);

  const classString = keys.join("\0");

  if (context.classMap[classString] !== undefined) {
    const classIndex = context.classMap[classString];
    context.buffer[context.offset++] = CLASS_OFFSET + classIndex;
    for (const key of keys) {
      encode(context, obj[key]);
    }
    return;
  }

  if (context.classCount <= CLASS_MAX) {
    context.classMap[classString] = context.classCount++;
  }

  const length = keys.length;

  const tagOffset = context.offset++;

  for (const key of keys) {
    encodeCString(context, key);
  }

  if (length <= OBJECT_MAX) {
    context.buffer[tagOffset] = OBJECT_OFFSET + length;
  } else {
    context.buffer[tagOffset] = ZOBJECT_TAG;
    context.buffer[context.offset++] = SENTINEL;
  }

  for (const key of keys) {
    encode(context, obj[key]);
  }
}

export function decodeClass(
  context: DecodeContext,
  index: number
): Record<string, any> {
  const classKeys = context.classList[index];
  const output: Record<string, any> = {};
  for (const key of classKeys) {
    output[key] = decode(context);
  }
  return output;
}

export function decodeZObject(context: DecodeContext): Record<string, any> {
  const keys: string[] = [];
  while (true) {
    if (context.buffer[context.offset] === SENTINEL) {
      context.offset++;
      break;
    }
    keys.push(decodeCString(context));
  }
  context.classList.push(keys);

  const output: Record<string, any> = {};

  for (const key of keys) {
    output[key] = decode(context);
  }

  return output;
}

export function decodeObjectWithLength(
  context: DecodeContext,
  length: number
): Record<string, any> {
  const keys = new Array<string>(length);
  for (let i = 0; i < length; i++) {
    keys[i] = decodeCString(context);
  }
  context.classList.push(keys);
  const output: Record<string, any> = {};

  for (const key of keys) {
    output[key] = decode(context);
  }
  return output;
}
