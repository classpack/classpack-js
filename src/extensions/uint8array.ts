import { ensureCapacity, type Extension } from "../common";
import { readVarint, writeVarint } from "../number";

export const UINT8ARRAY_EXT: Extension<Uint8Array> = {
  target: Uint8Array,
  write(state, _, value) {
    const byteLength = value.length;
    writeVarint(state, byteLength);
    ensureCapacity(state, byteLength);
    state.data.set(value, state.index);
    state.index += byteLength;
  },
  read(state) {
    const length = readVarint(state);
    const bytes = state.data.slice(state.index, state.index + length);
    state.index += length;
    return bytes;
  },
};
