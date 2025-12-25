import {
  type WriteState,
  ensureCapacity,
  type ReadState,
  type Options,
} from "./common";
import { REF_TAG } from "./layout";
import { writeVarint, readVarint } from "./number";

export const tryWriteRef = (
  context: WriteState,
  options: Options,
  value: any
): boolean => {
  if (options.noRefs) return false;
  const refIndex = context.refs.get(value);
  if (refIndex !== undefined) {
    ensureCapacity(context, 1);
    context.bytes[context.index++] = REF_TAG;
    writeVarint(context, refIndex);
    return true;
  }
  context.refs.set(value, context.refs.size);
  return false;
};

export const readRef = (context: ReadState, options: Options): any => {
  if (options.noRefs) {
    throw new Error("References are disabled in options");
  }
  const refIndex = readVarint(context);
  return context.refs[refIndex];
};

export const registerRef = (
  context: ReadState,
  options: Options,
  value: any
) => {
  if (!options.noRefs) {
    context.refs.push(value);
  }
};
