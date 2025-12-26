import { builtinDecodeUtf8, builtinEncodeUtf8 } from "./common";

export const encodeUtf8 = (
  buffer: Buffer | Uint8Array,
  offset: number,
  value: string
): number => {
  if (builtinEncodeUtf8 && value.length > 0) {
    return builtinEncodeUtf8(buffer, offset, value);
  }

  const start = offset;

  for (let i = 0; i < value.length; i++) {
    let codePoint = value.codePointAt(i);

    if (codePoint === undefined) continue;

    if (codePoint > 0xffff) i++;

    if (codePoint <= 0x7f) {
      buffer[offset++] = codePoint;
    } else if (codePoint <= 0x7ff) {
      buffer[offset++] = 0xc0 | (codePoint >> 6);
      buffer[offset++] = 0x80 | (codePoint & 0x3f);
    } else if (codePoint <= 0xffff) {
      buffer[offset++] = 0xe0 | (codePoint >> 12);
      buffer[offset++] = 0x80 | ((codePoint >> 6) & 0x3f);
      buffer[offset++] = 0x80 | (codePoint & 0x3f);
    } else {
      buffer[offset++] = 0xf0 | (codePoint >> 18);
      buffer[offset++] = 0x80 | ((codePoint >> 12) & 0x3f);
      buffer[offset++] = 0x80 | ((codePoint >> 6) & 0x3f);
      buffer[offset++] = 0x80 | (codePoint & 0x3f);
    }
  }

  return offset - start;
};

export const decodeUtf8 = (
  buffer: Buffer | Uint8Array,
  start: number,
  end: number
): string => {
  if (builtinDecodeUtf8 && end - start > 0) {
    return builtinDecodeUtf8(buffer, start, end);
  }

  let out = "";
  let i = start;

  while (i < end && i < buffer.length) {
    let byte1 = buffer[i++];

    if (byte1 <= 0x7f) {
      out += String.fromCodePoint(byte1);
    } else if (byte1 >= 0xc0 && byte1 <= 0xdf) {
      let byte2 = buffer[i++];
      out += String.fromCodePoint(((byte1 & 0x1f) << 6) | (byte2 & 0x3f));
    } else if (byte1 >= 0xe0 && byte1 <= 0xef) {
      let byte2 = buffer[i++];
      let byte3 = buffer[i++];
      out += String.fromCodePoint(
        ((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f)
      );
    } else if (byte1 >= 0xf0 && byte1 <= 0xf7) {
      let byte2 = buffer[i++];
      let byte3 = buffer[i++];
      let byte4 = buffer[i++];
      out += String.fromCodePoint(
        ((byte1 & 0x07) << 18) |
          ((byte2 & 0x3f) << 12) |
          ((byte3 & 0x3f) << 6) |
          (byte4 & 0x3f)
      );
    }
  }

  return out;
};
