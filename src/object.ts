import { writeAny, readAny } from "./any";
import {
  CLASS_OFFSET,
  OBJECT_MAX,
  OBJECT_OFFSET,
  ZOBJECT_TAG,
  ZERO,
  CLASS_MAX,
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

export const setValue = (
  options: Options,
  object: RecordOrMap,
  key: string,
  value: any
) => {
  if (!options.keepUndefined && value === undefined) {
    return;
  }

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
  state: WriteState,
  options: Options,
  value: RecordOrMap
) => {
  if (tryWriteRef(state, options, value)) {
    return;
  }

  const keys = getKeys(value);

  const classString = keys.join("\0");

  const classIndex = state.classes.get(classString);
  if (classIndex !== undefined) {
    state.data[state.index++] = CLASS_OFFSET + classIndex;
    for (const key of keys) {
      writeAny(state, options, getValue(value, key));
    }
    return;
  }

  if (state.classes.size <= CLASS_MAX) {
    state.classes.set(classString, state.classes.size);
  }

  const length = keys.length;

  const tagOffset = state.index++;

  for (const key of keys) {
    encodeCString(state, key);
  }

  if (length <= OBJECT_MAX) {
    state.data[tagOffset] = OBJECT_OFFSET + length;
  } else {
    state.data[tagOffset] = ZOBJECT_TAG;
    state.data[state.index++] = ZERO;
  }

  for (const key of keys) {
    writeAny(state, options, getValue(value, key));
  }
};

export const readClass = (
  state: ReadState,
  options: Options,
  index: number
): RecordOrMap => {
  const classKeys = state.classes[index];
  const output = createObject(state, options);
  for (const key of classKeys) {
    setValue(options, output, key, readAny(state, options));
  }
  return output;
};

export const readZObject = (state: ReadState, options: Options) => {
  const keys: string[] = [];
  while (true) {
    if (state.data[state.index] === ZERO) {
      state.index++;
      break;
    }
    keys.push(decodeCString(state));
  }
  state.classes.push(keys);

  const output = createObject(state, options);
  for (const key of keys) {
    setValue(options, output, key, readAny(state, options));
  }

  return output;
};

export const readObjectWithLength = (
  state: ReadState,
  options: Options,
  length: number
): RecordOrMap => {
  const keys = new Array<string>(length);
  for (let i = 0; i < length; i++) {
    keys[i] = decodeCString(state);
  }
  state.classes.push(keys);
  const output = createObject(state, options);

  for (const key of keys) {
    setValue(options, output, key, readAny(state, options));
  }
  return output;
};
