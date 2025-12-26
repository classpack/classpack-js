import { Glob } from "bun";
import { ClassPack } from "../src";
import { describe, it, expect } from "bun:test";

const glob = new Glob("./fixtures/**/*.json");

for await (const file of glob.scan(".")) {
  describe(`ClassPack Encoding/Decoding for ${file}`, async () => {
    const classpack = new ClassPack();
    const data = await Bun.file(file).json();

    const jsonLength = JSON.stringify(data).length;
    const encoded = classpack.pack(data);

    console.log("Compression ratio:", jsonLength / encoded.length);
    const decoded = classpack.unpack(encoded);

    it("decoded data matches original data", () => {
      expect(decoded).toEqual(data);
    });
  });
}

