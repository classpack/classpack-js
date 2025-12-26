import { ClassPack } from "../src";
import { describe, it, expect } from "bun:test";

describe("ints encoding/decoding", () => {
  const classpack = new ClassPack();

  const ints = [123n, -1234n, 2n ** 1023n, -(2n ** 1023n)];

  for (const int of ints) {
    it(`encodes and decodes bigint: ${int.toString()}`, () => {
      const encoded = classpack.pack(int);
      const decoded = classpack.unpack(encoded);
      expect(decoded).toBe(int);
    });
  }
});
