import { decodeArrayOfLength, decodeZArray, encodeArray } from "./array";
import {
  TRUE_CONST,
  FALSE_CONST,
  NULL_CONST,
  SINT_OFFSET,
  SENTINEL,
  F32_TAG,
  F64_TAG,
  ZSTRING_TAG,
  ZARRAY_TAG,
  ZOBJECT_TAG,
  CLASS_OFFSET,
  OBJECT_OFFSET,
  STRING_OFFSET,
  ARRAY_OFFSET,
} from "./constants";
import type { EncodeContext, DecodeContext } from "./context";
import { encodeNumber, decodeVint, decodeF32, decodeF64 } from "./number";
import {
  encodeObject,
  decodeClass,
  decodeZObject,
  decodeObjectWithLength,
} from "./object";
import { encodeString, decodeCString, decodeStringOfLength } from "./string";

export { makeEncodeContext, makeDecodeContext } from "./context";

export function encode(context: EncodeContext, value: any) {
  switch (typeof value) {
    case "boolean":
      context.buffer[context.offset++] = value ? TRUE_CONST : FALSE_CONST;
      break;
    case "number":
      encodeNumber(context, value);
      break;
    case "string":
      encodeString(context, value);
      break;
    case "object":
      if (value === null) {
        context.buffer[context.offset++] = NULL_CONST;
      } else if (Array.isArray(value)) {
        encodeArray(context, value);
      } else {
        encodeObject(context, value);
      }
      break;
    default:
      throw new Error("Unsupported value type");
  }
}

export function decode(context: DecodeContext): any {
  const tag = context.buffer[context.offset];

  if (tag >= SINT_OFFSET) {
    const value = decodeVint(context) - SINT_OFFSET;
    const isNegative = value & 1;
    const intValue = value >> 1;
    return isNegative ? -intValue : intValue;
  }

  context.offset++;

  switch (tag) {
    case SENTINEL:
      throw new Error("Unexpected sentinel at " + (context.offset - 1));
    case NULL_CONST:
      return null;
    case TRUE_CONST:
      return true;
    case FALSE_CONST:
      return false;
    case F32_TAG:
      return decodeF32(context);
    case F64_TAG:
      return decodeF64(context);
    case ZSTRING_TAG:
      return decodeCString(context);
    case ZARRAY_TAG:
      return decodeZArray(context);
    case ZOBJECT_TAG: {
      return decodeZObject(context);
    }
  }

  if (tag < CLASS_OFFSET) {
    return decodeObjectWithLength(context, tag - OBJECT_OFFSET);
  } else if (tag < STRING_OFFSET) {
    return decodeClass(context, tag - CLASS_OFFSET);
  } else if (tag < ARRAY_OFFSET) {
    return decodeStringOfLength(context, tag - STRING_OFFSET);
  } else if (tag < SINT_OFFSET) {
    return decodeArrayOfLength(context, tag - ARRAY_OFFSET);
  }
}
