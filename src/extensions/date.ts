import { unzigzag, zigzag, type Extension } from "../common";
import { readVarint, writeVarint } from "../number";

export const DATE_EXT: Extension<Date> = {
  target: Date,
  write(state, _, value) {
    writeVarint(state, zigzag(value.getTime()));
  },
  read(state) {
    const time = readVarint(state);
    return new Date(unzigzag(time));
  },
};
