import { writeAny, readAny } from "./any";
import {
  CLASS_OFFSET,
  OBJECT_MAX,
  OBJECT_OFFSET,
  ZOBJECT_TAG,
  ZERO,
  CLASS_MAX,
  REF_TAG,
} from "./layout";
import {
  type ReadState,
  type WriteState,
  type Options,
  type RecordOrMap,
} from "./common";
import { decodeCString, encodeCString } from "./string";
import { registerRef, tryWriteRef } from "./ref";

export const createObject = (
  state: ReadState,
  options: Options
): RecordOrMap => {
  const output = options.preferMap ? new Map<string, any>() : {};
  registerRef(state, options, output);
  return output;
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

export const writeObject = (
  context: WriteState,
  options: Options,
  value: RecordOrMap
) => {
  if (tryWriteRef(context, options, value)) {
    return;
  }

  const keys = getKeys(value);

  const classString = keys.join("\0");

  const classIndex = context.classes.get(classString);
  if (classIndex !== undefined) {
    context.bytes[context.index++] = CLASS_OFFSET + classIndex;
    for (const key of keys) {
      writeAny(context, options, getValue(value, key));
    }
    return;
  }

  if (context.classes.size <= CLASS_MAX) {
    context.classes.set(classString, context.classes.size);
  }

  const length = keys.length;

  const tagOffset = context.index++;

  for (const key of keys) {
    encodeCString(context, key);
  }

  if (length <= OBJECT_MAX) {
    context.bytes[tagOffset] = OBJECT_OFFSET + length;
  } else {
    context.bytes[tagOffset] = ZOBJECT_TAG;
    context.bytes[context.index++] = ZERO;
  }

  for (const key of keys) {
    writeAny(context, options, getValue(value, key));
  }
};

export const readClass = (
  context: ReadState,
  options: Options,
  index: number
): RecordOrMap => {
  const classKeys = context.classes[index];
  const output = createObject(context, options);
  for (const key of classKeys) {
    setValue(output, key, readAny(context, options));
  }
  return output;
};

export const readZObject = (context: ReadState, options: Options) => {
  const keys: string[] = [];
  while (true) {
    if (context.bytes[context.index] === ZERO) {
      context.index++;
      break;
    }
    keys.push(decodeCString(context));
  }
  context.classes.push(keys);

  const output = createObject(context, options);
  for (const key of keys) {
    setValue(output, key, readAny(context, options));
  }

  return output;
};

export const readObjectWithLength = (
  context: ReadState,
  options: Options,
  length: number
): RecordOrMap => {
  const keys = new Array<string>(length);
  for (let i = 0; i < length; i++) {
    keys[i] = decodeCString(context);
  }
  context.classes.push(keys);
  const output = createObject(context, options);

  for (const key of keys) {
    setValue(output, key, readAny(context, options));
  }
  return output;
};
