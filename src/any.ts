import { readArrayOfLength, readZArray, writeArray } from "./array";
import {
  TRUE_CONST,
  FALSE_CONST,
  NULL_CONST,
  SINT_OFFSET,
  ZERO,
  FLOAT32_TAG,
  FLOAT64_TAG,
  ZSTRING_TAG,
  ZARRAY_TAG,
  ZOBJECT_TAG,
  CLASS_OFFSET,
  OBJECT_OFFSET,
  STRING_OFFSET,
  ARRAY_OFFSET,
  REF_TAG,
  EXT_MAX,
  EXT_OFFSET,
  BIGINT_TAG,
} from "./layout";
import {
  type WriteState,
  type ReadState,
  type Options,
  unzigzag,
  ensureCapacity,
} from "./common";
import { writeNumber, readVarint, readFloat32, readFloat64 } from "./number";
import {
  writeObject,
  readClass,
  readZObject,
  readObjectWithLength,
} from "./object";
import { encodeString, decodeCString, decodeStringOfLength } from "./string";
import { readRef } from "./ref";
import { readBigint, writeBigint } from "./bigint";

export const writeAny = (state: WriteState, options: Options, value: any) => {
  switch (typeof value) {
    case "string":
      encodeString(state, value);
      break;
    case "number":
      writeNumber(state, options, value);
      break;
    case "object":
      if (value === null) {
        state.data[state.index++] = NULL_CONST;
      } else if (Array.isArray(value)) {
        writeArray(state, options, value);
      } else {
        for (let i = 0; i < EXT_MAX; i++) {
          const ext = options.exts[i];
          if (ext && value instanceof ext?.target) {
            ensureCapacity(state, 1);
            state.data[state.index++] = EXT_OFFSET + i;
            ext.write(state, options, value);
            return;
          }
        }
        writeObject(state, options, value);
      }
      break;
    case "boolean":
      state.data[state.index++] = value ? TRUE_CONST : FALSE_CONST;
      break;
    case "bigint":
      writeBigint(state, value);
      break;
    case "undefined":
      state.data[state.index++] = NULL_CONST;
      break;

    default:
      throw new Error("Unsupported value type");
  }
};

export const readAny = (state: ReadState, options: Options): any => {
  const tag = state.data[state.index];

  if (tag >= SINT_OFFSET) {
    return unzigzag(readVarint(state) - SINT_OFFSET);
  }

  state.index++;

  switch (tag) {
    case ZERO:
      throw new Error("Unexpected sentinel at " + (state.index - 1));
    case NULL_CONST:
      return null;
    case TRUE_CONST:
      return true;
    case FALSE_CONST:
      return false;
    case FLOAT32_TAG:
      return readFloat32(state);
    case FLOAT64_TAG:
      return readFloat64(state);
    case ZSTRING_TAG:
      return decodeCString(state);
    case ZARRAY_TAG:
      return readZArray(state, options);
    case ZOBJECT_TAG:
      return readZObject(state, options);
    case REF_TAG:
      return readRef(state, options);
    case BIGINT_TAG:
      return readBigint(state);
  }

  if (tag < OBJECT_OFFSET) {
    const ext = options.exts[tag - EXT_OFFSET];
    if (!ext) {
      throw new Error("Unknown extension tag: " + tag);
    }
    return ext.read(state, options);
  } else if (tag < CLASS_OFFSET) {
    return readObjectWithLength(state, options, tag - OBJECT_OFFSET);
  } else if (tag < STRING_OFFSET) {
    return readClass(state, options, tag - CLASS_OFFSET);
  } else if (tag < ARRAY_OFFSET) {
    return decodeStringOfLength(state, tag - STRING_OFFSET);
  } else if (tag < SINT_OFFSET) {
    return readArrayOfLength(state, options, tag - ARRAY_OFFSET);
  }
};
