import { Glob } from "bun";
import { makeDecodeContext, makeEncodeContext } from "../src";
import { decode, encode } from "../src";
import { describe, it, expect } from "bun:test";

const glob = new Glob("./fixtures/**/*.json");

for await (const file of glob.scan(".")) {
  describe(`ClassPack Encoding/Decoding for ${file}`, async () => {
    const data = await Bun.file(file).json();

    const jsonLength = JSON.stringify(data).length;

    const encodeContext = makeEncodeContext(new Uint8Array(1024));

    encode(encodeContext, data);

    const writtenData = encodeContext.buffer.slice(0, encodeContext.offset);

    console.log("Compression ratio:", jsonLength / writtenData.length);

    const decodeContext = makeDecodeContext(writtenData);
    const decodedData = decode(decodeContext);

    it("decoded data matches original data", () => {
      expect(decodedData).toEqual(data);
    });
  });
}
