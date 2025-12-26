import { ClassPack } from "../src";
import { describe, it, expect } from "bun:test";

describe("Graph encoding/decoding", () => {
  const classpack = new ClassPack();

  it(`encodes and decodes cyclic object graph`, () => {
    type Vertex = {
      id: number;
      neighbors: Vertex[];
    };

    const vertices: Vertex[] = [];

    for (let i = 0; i < 5; i++) {
      vertices.push({ id: i, neighbors: [] });
    }

    // make a complete graph
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        vertices[i].neighbors.push(vertices[j]);
        vertices[j].neighbors.push(vertices[i]);
      }
    }

    const encoded = classpack.pack(vertices);
    const decoded = classpack.unpack(encoded);

    expect(decoded).toEqual(vertices);
  });

  it(`encodes and decodes self-referential array`, () => {
    const arr: any[] = [];
    arr.push(arr);

    const encoded = classpack.pack(arr);
    const decoded = classpack.unpack(encoded);

    expect(decoded).toEqual(arr);
  });
});
