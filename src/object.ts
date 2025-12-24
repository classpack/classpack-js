import { encodeAny, decodeAny } from "./any";
import {
  CLASS_OFFSET,
  OBJECT_MAX,
  OBJECT_OFFSET,
  ZOBJECT_TAG,
  SENTINEL,
  CLASS_MAX,
} from "./layout";
import type {
  DecodeContext,
  EncodeContext,
  Options,
  RecordOrMap,
} from "./common";
import { decodeCString, encodeCString } from "./string";

export const createObject = (options: Options): RecordOrMap => {
  return options.useMap ? new Map<string, any>() : {};
};

export const getKeys = (value: RecordOrMap): string[] => {
  return value instanceof Map ? Array.from(value.keys()) : Object.keys(value);
};

export const getValue = (value: RecordOrMap, key: string): any => {
  return value instanceof Map ? value.get(key) : value[key];
};

export const setValue = (object: RecordOrMap, key: string, value: any) => {
  if (object instanceof Map) {
    object.set(key, value);
  } else {
    if (key === "__proto__") {
      Object.defineProperty(object, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    } else {
      object[key] = value;
    }
  }
};

export const encodeObject = (
  context: EncodeContext,
  options: Options,
  value: RecordOrMap
) => {
  const keys = getKeys(value);

  const classString = keys.join("\0");

  const classIndex = context.classMap.get(classString);
  if (classIndex !== undefined) {
    context.buffer[context.offset++] = CLASS_OFFSET + classIndex;
    for (const key of keys) {
      encodeAny(context, options, getValue(value, key));
    }
    return;
  }

  if (context.classCount <= CLASS_MAX) {
    context.classMap.set(classString, context.classCount++);
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
    encodeAny(context, options, getValue(value, key));
  }
};

export const decodeClass = (
  context: DecodeContext,
  options: Options,
  index: number
): RecordOrMap => {
  const classKeys = context.classList[index];
  const output = createObject(options);
  for (const key of classKeys) {
    setValue(output, key, decodeAny(context, options));
  }
  return output;
};

export const decodeZObject = (
  context: DecodeContext,
  options: Options
) => {
  const keys: string[] = [];
  while (true) {
    if (context.buffer[context.offset] === SENTINEL) {
      context.offset++;
      break;
    }
    keys.push(decodeCString(context));
  }
  context.classList.push(keys);

  const output = createObject(options);

  for (const key of keys) {
    setValue(output, key, decodeAny(context, options));
  }

  return output;
};

export const decodeObjectWithLength = (
  context: DecodeContext,
  options: Options,
  length: number
): RecordOrMap => {
  const keys = new Array<string>(length);
  for (let i = 0; i < length; i++) {
    keys[i] = decodeCString(context);
  }
  context.classList.push(keys);
  const output = createObject(options);

  for (const key of keys) {
    setValue(output, key, decodeAny(context, options));
  }
  return output;
};
