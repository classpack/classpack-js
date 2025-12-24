import { decodeAny, encodeAny } from "./any";
import type {
  DecodeContext,
  EncodeContext,
  Extension,
  Options,
} from "./common";

export class Classpack {
  protected encodeContext: EncodeContext;
  protected decodeContext: DecodeContext;
  protected options: Options;

  public constructor(encodeBufferLength = 256) {
    this.encodeContext = {
      buffer: new Uint8Array(encodeBufferLength),
      offset: 0,
      classMap: new Map<string, number>(),
      classCount: 0,
    };
    this.decodeContext = {
      buffer: new Uint8Array(0),
      offset: 0,
      classList: [],
    };
    this.options = {
      useMap: false,
      useFloat32: false,
      extsByType: new Map(),
      extsByTarget: new Map(),
    };
  }

  public useMap(value = true): void {
    this.options.useMap = value;
  }

  public useFloat32(value = true): void {
    this.options.useFloat32 = value;
  }

  public register(extension: Extension<any>): void {
    this.options.extsByType.set(extension.type, extension);
    this.options.extsByTarget.set(extension.target, extension);
  }

  public encode(value: any): Uint8Array {
    const context = this.encodeContext;
    context.offset = 0;
    context.classMap.clear();
    context.classCount = 0;
    encodeAny(this.encodeContext, this.options, value);
    return context.buffer.subarray(0, context.offset);
  }

  public decode(buffer: Uint8Array): any {
    const context = this.decodeContext;
    context.buffer = buffer;
    context.offset = 0;
    context.classList = [];
    return decodeAny(context, this.options);
  }
}
