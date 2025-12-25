import { Classpack } from "../src";
import { describe, it, expect } from "bun:test";

describe("Bytes encoding/decoding", () => {
  const classpack = new Classpack();

  const byteArrays = [
    new Uint8Array([]),
    new Uint8Array([0, 1, 2, 3, 4, 5]),
    new Uint8Array(255).map((_, i) => i % 256),
    new Uint8Array(65535).map((_, i) => i % 256),
    new Uint8Array(70000).map((_, i) => i % 256),
  ];

  for (const byteArray of byteArrays) {
    it(`encodes and decodes byte array of length: ${byteArray.length}`, () => {
      const encoded = classpack.encode(byteArray);
      const decoded = classpack.decode(encoded);
      expect(decoded instanceof Uint8Array).toBe(true);
      expect(decoded).toEqual(byteArray);
    });
  }
});