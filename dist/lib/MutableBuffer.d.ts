/// <reference types="node" />
/**
 * A mutable-length write-only Buffer.
 */
export declare class MutableBuffer {
    /** Internal buffer */
    private _buffer;
    /**  Number of used bytes */
    private _length;
    constructor(capacity?: number);
    appendBuffer: (data: Buffer) => void;
    writeInt8(value: number): void;
    writeInt16(value: number): void;
    writeInt32(value: number): void;
    writeUInt8(value: number): void;
    writeUInt16(value: number): void;
    writeUInt32(value: number): void;
    writeFloat(value: number): void;
    writeDouble(value: number): void;
    /**
     * Return the data as a Buffer.
     *
     * Note: The returned Buffer and the internal Buffer share the same memory
     */
    toBuffer(): Buffer;
    /**
     * Alloc the given number of bytes
     */
    private _alloc;
}
export default MutableBuffer;
//# sourceMappingURL=MutableBuffer.d.ts.map