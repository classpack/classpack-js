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
  SINT_OFFSET_BIGINT,
} from "./layout";
import type { EncodeContext, DecodeContext, Options } from "./common";
import {
  encodeNumber,
  decodeInt,
  decodeFloat32,
  decodeFloat64,
  encodeBigInt,
} from "./number";
import {
  encodeObject,
  decodeClass,
  decodeZObject,
  decodeObjectWithLength,
} from "./object";
import { encodeString, decodeCString, decodeStringOfLength } from "./string";

export const encodeAny = (
  context: EncodeContext,
  options: Options,
  value: any
) => {
  switch (typeof value) {
    case "boolean":
      context.buffer[context.offset++] = value ? TRUE_CONST : FALSE_CONST;
      break;
    case "string":
      encodeString(context, value);
      break;
    case "number":
      encodeNumber(context, options, value);
      break;
    case "bigint":
      encodeBigInt(context, value);
      break;
    case "undefined":
      context.buffer[context.offset++] = NULL_CONST;
      break;
    case "object":
      if (value === null) {
        context.buffer[context.offset++] = NULL_CONST;
      } else if (Array.isArray(value)) {
        encodeArray(context, options, value);
      } else {
        encodeObject(context, options, value);
      }
      break;
    default:
      throw new Error("Unsupported value type");
  }
};

export const decodeAny = (context: DecodeContext, options: Options): any => {
  const tag = context.buffer[context.offset];

  if (tag >= SINT_OFFSET) {
    const raw = decodeInt(context);
    if (typeof raw === "bigint") {
      const value = raw - SINT_OFFSET_BIGINT;
      const isNegative = value & 1n;
      const intValue = value >> 1n;
      return isNegative ? -intValue : intValue;
    }
    const value = raw - SINT_OFFSET;
    const isNegative = value & 1;
    const intValue = value >> 1;
    return isNegative ? -intValue : intValue;
  }

  context.offset++;

  switch (tag) {
    case SENTINEL:
      throw new Error("Unexpected sentinel at " + (context.offset - 1));
    case NULL_CONST:
      return options.preferNull ? null : undefined;
    case TRUE_CONST:
      return true;
    case FALSE_CONST:
      return false;
    case F32_TAG:
      return decodeFloat32(context);
    case F64_TAG:
      return decodeFloat64(context);
    case ZSTRING_TAG:
      return decodeCString(context);
    case ZARRAY_TAG:
      return decodeZArray(context, options);
    case ZOBJECT_TAG: {
      return decodeZObject(context, options);
    }
  }

  if (tag < CLASS_OFFSET) {
    return decodeObjectWithLength(context, options, tag - OBJECT_OFFSET);
  } else if (tag < STRING_OFFSET) {
    return decodeClass(context, options, tag - CLASS_OFFSET);
  } else if (tag < ARRAY_OFFSET) {
    return decodeStringOfLength(context, tag - STRING_OFFSET);
  } else if (tag < SINT_OFFSET) {
    return decodeArrayOfLength(context, options, tag - ARRAY_OFFSET);
  }
};
