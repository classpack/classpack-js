import { Classpack } from "../src";
import { describe, it, expect } from "bun:test";

describe("ints encoding/decoding", () => {
  const classpack = new Classpack();

  const MAX_INT = 2 ** 52 - 49;
  const ints = [MAX_INT, -MAX_INT];

  for (const int of ints) {
    it(`encodes and decodes int: ${int.toString()}`, () => {
      const encoded = classpack.encode(int);
      const decoded = classpack.decode(encoded);
      expect(decoded).toBe(int);
    });
  }
});
