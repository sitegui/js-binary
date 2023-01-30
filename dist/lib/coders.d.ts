/// <reference types="node" />
import { MutableBuffer } from './MutableBuffer';
import { ReadState } from './ReadState';
import { CoderType } from './Schema';
export interface BinaryCoder<T> {
    write(u: T, data: MutableBuffer, path?: string): void;
    read(state: ReadState): T;
}
export declare const uintCoder: BinaryCoder<number>;
export declare const intCoder: BinaryCoder<number>;
export declare const float64Coder: BinaryCoder<number>;
export declare const float32Coder: BinaryCoder<number>;
export declare const stringCoder: BinaryCoder<string>;
export declare const BufferCoder: BinaryCoder<Buffer>;
export declare const booleanCoder: BinaryCoder<boolean>;
export declare const jsonCoder: BinaryCoder<JSON>;
export declare const oidCoder: BinaryCoder<string>;
export declare const regexCoder: BinaryCoder<RegExp>;
export declare const dateCoder: BinaryCoder<Date>;
/** Helper to get the right coder */
export declare function getCoder(type: CoderType): BinaryCoder<any>;
//# sourceMappingURL=coders.d.ts.map