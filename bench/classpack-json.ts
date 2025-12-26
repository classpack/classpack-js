import { bench, do_not_optimize, run, summary } from "mitata";
import { ClassPack } from "../src";
import { pack, unpack } from "msgpackr";

const data = [
  {
    name: "Alice",
    isActive: true,
    address: {
      street: "123 Main St",
      city: "Wonderland",
    },
  },
  {
    name: "Bob",
    isActive: false,
    address: {
      street: "456 Elm St",
      city: "Builderland",
    },
  },
  {
    name: "Carol",
    isActive: true,
    address: {
      street: "789 Oak St",
      city: "Dreamland",
    },
  },
];

const classpack = new ClassPack();

summary(() => {
  bench("JSON stringify/parse", () => {
    const encoded = JSON.stringify(data);
    const decoded = JSON.parse(encoded);
    do_not_optimize(decoded);
  });

  bench("ClassPack encode/decode", () => {
    const encoded = classpack.pack(data);
    const decoded = classpack.unpack(encoded);
    do_not_optimize(decoded);
  });

  bench("Msgpackr encode/decode", () => {
    const encoded = pack(data);
    const decoded = unpack(encoded);
    do_not_optimize(decoded);
  });
});

run();
