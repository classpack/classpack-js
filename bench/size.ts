import { Glob } from "bun";
import { ClassPack } from "../src";
import { Packr } from "msgpackr";

const glob = new Glob("./fixtures/**/*.json");

for await (const file of glob.scan(".")) {
  const classpack = new ClassPack();
  const data = await Bun.file(file).json();

  const jsonLength = JSON.stringify(data).length;
  const encoded = classpack.pack(data);
  const decoded = classpack.unpack(encoded);

  if (JSON.stringify(decoded) !== JSON.stringify(data)) {
    throw new Error(
      `Decoded data does not match original data for file: ${file}`
    );
  }

  const packr = new Packr();

  console.log(`File: ${file}`);
  console.log("ClassPack Compression ratio:", jsonLength / encoded.length);
  console.log(
    "Msgpackr Compression ratio:",
    jsonLength / packr.pack(data).length
  );
  console.log("");
}
