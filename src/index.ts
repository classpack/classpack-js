import { readAny, writeAny } from "./any";
import type { ReadState, WriteState, Extension, Options } from "./common";

export class Classpack {
  protected writeState: WriteState;
  protected readState: ReadState;
  protected options: Options;

  public constructor(encodeBufferLength = 256) {
    this.writeState = {
      bytes: new Uint8Array(encodeBufferLength),
      index: 0,
      classes: new Map<string, number>(),
      refs: new Map<any, number>(),
    };
    this.readState = {
      bytes: new Uint8Array(0),
      index: 0,
      classes: [],
      refs: [],
    };
    this.options = {
      extsByType: new Map(),
      extsByTarget: new Map(),
    };
  }

  public useMap(value = true) {
    this.options.preferMap = value;
    return this;
  }

  public useFloat32(value = true) {
    this.options.preferFloat32 = value;
    return this;
  }

  public useNull(value = true) {
    this.options.preferNull = value;
    return this;
  }

  public noRefs(value = true) {
    this.options.noRefs = value;
    return this;
  }

  public register(extension: Extension<any>) {
    this.options.extsByType.set(extension.type, extension);
    this.options.extsByTarget.set(extension.target, extension);
    return this;
  }

  public encode(value: any): Uint8Array {
    const context = this.writeState;
    context.index = 0;
    context.classes.clear();
    context.refs.clear();
    writeAny(this.writeState, this.options, value);
    return context.bytes.subarray(0, context.index);
  }

  public decode(buffer: Uint8Array): any {
    const context = this.readState;
    context.bytes = buffer;
    context.index = 0;
    context.classes = [];
    context.refs = [];
    return readAny(context, this.options);
  }
}
