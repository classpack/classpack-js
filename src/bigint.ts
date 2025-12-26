import { ensureCapacity, type ReadState, type WriteState } from "./common";
import { BIGINT_TAG } from "./layout";
import { readVarint, writeVarint } from "./number";

export const writeBigint = (state: WriteState, value: bigint) => {
  const isNegative = value < BigInt(0);
  let absValue = isNegative ? -value : value;

  ensureCapacity(state, 10);
  state.data[state.index++] = BIGINT_TAG;

  const start = state.index;
  state.index += 9;

  const dataStart = state.index;
  while (absValue > 0n) {
    const byte = Number(absValue & 0xffn);
    ensureCapacity(state, 1);
    state.data[state.index++] = byte;
    absValue >>= 8n;
  }
  const dataEnd = state.index;
  const length = dataEnd - dataStart;

  state.index = start;
  writeVarint(state, length * 2 + +isNegative);
  state.data.copyWithin(state.index, dataStart, dataEnd);
  state.index += length;
};

export const readBigint = (state: ReadState): bigint => {
  const info = readVarint(state);
  const isNegative = (info & 1) === 1;
  const length = info >> 1;

  let value = 0n;
  for (let i = 0; i < length; i++) {
    const byte = BigInt(state.data[state.index++]);
    value |= byte << BigInt(i * 8);
  }

  return isNegative ? -value : value;
};
