import { Classpack } from "../src";
import { describe, it, expect } from "bun:test";

describe("Date encoding/decoding", () => {
  const classpack = new Classpack();

  const dates = [
    new Date(0),
    new Date("2024-01-01T00:00:00Z"),
    new Date("1995-12-17T03:24:00"),
    new Date(Date.now()),
    new Date("1950-06-25T12:00:00Z"),
  ];

  for (const date of dates) {
    it(`encodes and decodes date: ${date.toISOString()}`, () => {
      const encoded = classpack.encode(date);
      const decoded = classpack.decode(encoded);
      expect(decoded instanceof Date).toBe(true);
      expect(decoded.getTime()).toBe(date.getTime());
    });
  }
});