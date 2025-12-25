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

