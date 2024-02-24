/// <reference types="node" />
import { MutableBuffer } from './MutableBuffer';
import { ReadState } from './ReadState';
import { CoderType } from './CoderType';
export interface BinaryCoder<T> {
    write(u: T, data: MutableBuffer, path?: string): void;
    read(state: ReadState): T;
}
/**
 * Formats (big-endian):
 * 7b  0xxx xxxx
 * 14b  10xx xxxx  xxxx xxxx
 * 29b  110x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx
 * 61b  111x xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx  xxxx xxxx
 */
export declare const uintCoder: BinaryCoder<number>;
/**
 * Same format as uint
 */
export declare const intCoder: BinaryCoder<number>;
/**
 * 64-bit double precision float
 */
export declare const float64Coder: BinaryCoder<number>;
/**
 * 32-bit single precision float
 */
export declare const float32Coder: BinaryCoder<number>;
/**
 * <uint_length> <buffer_data>
 */
export declare const stringCoder: BinaryCoder<string>;
/**
 * <uint_length> <buffer_data>
 */
export declare const BufferCoder: BinaryCoder<Buffer>;
/**
 * either 0x00 or 0x01
 */
export declare const booleanCoder: BinaryCoder<boolean>;
/** Encode arbitrary boolean arrays as UInt8s. */
export declare const booleanArrayCoder: BinaryCoder<boolean[]>;
/** Encode up to 8 booleans as a UInt8 */
export declare const bitmask8Coder: BinaryCoder<boolean[]>;
/** Encode exactly 16 booleans as a UInt16 */
export declare const bitmask16Coder: BinaryCoder<boolean[]>;
/** Encode exactly 32 booleans as a UInt32 */
export declare const bitmask32Coder: BinaryCoder<boolean[]>;
/**
 * <uint_length> <buffer_data>
 */
export declare const jsonCoder: BinaryCoder<JSON>;
/**
 * <uint_source_length> <buffer_source_data> <flags>
 * flags is a bit-mask: g=1, i=2, m=4
 */
export declare const regexCoder: BinaryCoder<RegExp>;
/**
 * <uint_time_ms>
 */
export declare const dateCoder: BinaryCoder<Date>;
/**
 * Helper to get the right coder.
 */
export declare function getCoder(type: CoderType): BinaryCoder<any>;
//# sourceMappingURL=coders.d.ts.map