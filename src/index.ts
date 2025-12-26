import { readAny, writeAny } from "./any";
import {
  type ReadState,
  type WriteState,
  type Options,
  makeBuffer,
  makeDataView,
} from "./common";

export * from "./extensions/uint8array";
export * from "./extensions/date";

export class ClassPack {
  protected writeState: WriteState;
  protected readState: ReadState;
  protected options: Options;

  public constructor(options?: Partial<Options>) {
    this.options = {
      exts: [],
      initLength: 1024,
      ...options,
    };

    const data = makeBuffer(this.options.initLength);
    this.writeState = {
      data,
      view: makeDataView(data),
      index: 0,
      classes: new Map<string, number>(),
      refs: new Map<any, number>(),
    };

    const data1 = makeBuffer(0);
    this.readState = {
      data: data1,
      view: makeDataView(data1),
      index: 0,
      classes: [],
      refs: [],
    };
  }

  public pack(value: any): Uint8Array {
    const context = this.writeState;
    context.index = 0;
    context.classes.clear();
    context.refs.clear();
    writeAny(this.writeState, this.options, value);
    return context.data.subarray(0, context.index);
  }

  public unpack(buffer: Uint8Array): any {
    const context = this.readState;
    context.data = buffer;
    context.index = 0;
    context.classes = [];
    context.refs = [];
    return readAny(context, this.options);
  }
}
