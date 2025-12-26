import { ClassPack, UINT8ARRAY_EXT } from "../src";
import { describe, it, expect } from "bun:test";

describe("Bytes encoding/decoding", () => {
  const classpack = new ClassPack({ exts: [UINT8ARRAY_EXT] });

  const byteArrays = [
    new Uint8Array([]),
    new Uint8Array([0, 1, 2, 3, 4, 5]),
    new Uint8Array(255).map((_, i) => i % 256),
    new Uint8Array(65535).map((_, i) => i % 256),
    new Uint8Array(70000).map((_, i) => i % 256),
  ];

  for (const byteArray of byteArrays) {
    it(`encodes and decodes byte array of length: ${byteArray.length}`, () => {
      const encoded = classpack.pack(byteArray);
      const decoded = classpack.unpack(encoded);
      expect(decoded instanceof Uint8Array).toBe(true);
      expect(decoded).toEqual(byteArray);
    });
  }
});
