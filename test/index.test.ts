import { Glob } from "bun";
import { Classpack } from "../src";
import { describe, it, expect } from "bun:test";

const glob = new Glob("./fixtures/**/*.json");

for await (const file of glob.scan(".")) {
  describe(`ClassPack Encoding/Decoding for ${file}`, async () => {
    const classpack = new Classpack();
    const data = await Bun.file(file).json();

    const jsonLength = JSON.stringify(data).length;
    const encoded = classpack.encode(data);

    console.log("Compression ratio:", jsonLength / encoded.length);
    const decoded = classpack.decode(encoded);

    it("decoded data matches original data", () => {
      expect(decoded).toEqual(data);
    });
  });
}

describe("bigint encoding/decoding", () => {
  const classpack = new Classpack();

  const bigints = [
    123456789012345678901234567890n,
    -123456789012345678901234567890n,
    2n ** 100n,
    -(2n ** 100n),
  ];

  for (const bigIntValue of bigints) {
    it(`encodes and decodes bigint: ${bigIntValue.toString()}`, () => {
      const encoded = classpack.encode(bigIntValue);
      console.log("Encoded bigint bytes:", encoded);
      const decoded = classpack.decode(encoded);
      expect(decoded).toBe(bigIntValue);
    });
  }
});
