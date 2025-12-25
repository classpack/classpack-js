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
  DATE_TAG,
  BYTES_TAG,
  REF_TAG,
} from "./layout";
import {
  type WriteState,
  type ReadState,
  type Options,
  unzigzag,
} from "./common";
import { writeNumber, readVarint, readFloat32, readFloat64 } from "./number";
import {
  writeObject,
  readClass,
  readZObject,
  readObjectWithLength,
} from "./object";
import { encodeString, decodeCString, decodeStringOfLength } from "./string";
import { readDate, writeDate } from "./date";
import { readBytes, writeBytes } from "./bytes";
import { readRef } from "./ref";

export const writeAny = (context: WriteState, options: Options, value: any) => {
  switch (typeof value) {
    case "boolean":
      context.bytes[context.index++] = value ? TRUE_CONST : FALSE_CONST;
      break;
    case "string":
      encodeString(context, value);
      break;
    case "number":
      writeNumber(context, options, value);
      break;
    case "undefined":
      context.bytes[context.index++] = NULL_CONST;
      break;
    case "object":
      if (value === null) {
        context.bytes[context.index++] = NULL_CONST;
      } else if (Array.isArray(value)) {
        writeArray(context, options, value);
      } else if (value instanceof Date) {
        writeDate(context, value);
      } else if (value instanceof Uint8Array) {
        writeBytes(context, value);
      } else {
        writeObject(context, options, value);
      }
      break;
    default:
      throw new Error("Unsupported value type");
  }
};

export const readAny = (context: ReadState, options: Options): any => {
  const tag = context.bytes[context.index];

  if (tag >= SINT_OFFSET) {
    return unzigzag(readVarint(context) - SINT_OFFSET);
  }

  context.index++;

  switch (tag) {
    case ZERO:
      throw new Error("Unexpected sentinel at " + (context.index - 1));
    case NULL_CONST:
      return options.preferNull ? null : undefined;
    case TRUE_CONST:
      return true;
    case FALSE_CONST:
      return false;
    case FLOAT32_TAG:
      return readFloat32(context);
    case FLOAT64_TAG:
      return readFloat64(context);
    case ZSTRING_TAG:
      return decodeCString(context);
    case ZARRAY_TAG:
      return readZArray(context, options);
    case ZOBJECT_TAG:
      return readZObject(context, options);
    case REF_TAG:
      return readRef(context, options);
    case BYTES_TAG:
      return readBytes(context);
    case DATE_TAG:
      return readDate(context);
  }

  if (tag < CLASS_OFFSET) {
    return readObjectWithLength(context, options, tag - OBJECT_OFFSET);
  } else if (tag < STRING_OFFSET) {
    return readClass(context, options, tag - CLASS_OFFSET);
  } else if (tag < ARRAY_OFFSET) {
    return decodeStringOfLength(context, tag - STRING_OFFSET);
  } else if (tag < SINT_OFFSET) {
    return readArrayOfLength(context, options, tag - ARRAY_OFFSET);
  }
};
