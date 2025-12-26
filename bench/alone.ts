import { ClassPack } from "../src";

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

const classpack = new ClassPack({ noRefs: true });

for (let i = 0; i < 100000; i++) {
  const encoded = classpack.pack(data);
  const decoded = classpack.unpack(encoded);
}
