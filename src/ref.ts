import {
  type WriteState,
  ensureCapacity,
  type ReadState,
  type Options,
} from "./common";
import { REF_TAG } from "./layout";
import { writeVarint, readVarint } from "./number";

export const tryWriteRef = (
  state: WriteState,
  options: Options,
  value: any
): boolean => {
  if (options.noRefs) return false;
  const refIndex = state.refs.get(value);
  if (refIndex !== undefined) {
    ensureCapacity(state, 1);
    state.data[state.index++] = REF_TAG;
    writeVarint(state, refIndex);
    return true;
  }
  state.refs.set(value, state.refs.size);
  return false;
};

export const readRef = (state: ReadState, options: Options): any => {
  if (options.noRefs) {
    throw new Error("References are disabled in options");
  }
  const refIndex = readVarint(state);
  return state.refs[refIndex];
};

export const registerRef = (
  state: ReadState,
  options: Options,
  value: any
) => {
  if (!options.noRefs) {
    state.refs.push(value);
  }
};
