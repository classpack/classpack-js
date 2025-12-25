import {
  ensureCapacity,
  unzigzag,
  zigzag,
  type ReadState,
  type WriteState,
} from "./common";
import { DATE_TAG } from "./layout";
import { readVarint, writeVarint } from "./number";

export const writeDate = (context: WriteState, value: Date) => {
  ensureCapacity(context, 1);
  context.bytes[context.index++] = DATE_TAG;
  writeVarint(context, zigzag(value.getTime()));
};

export const readDate = (context: ReadState): Date => {
  const time = readVarint(context);
  return new Date(unzigzag(time));
};
