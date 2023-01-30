/// <reference types="node" />
/**
 * Wraps a buffer with a read head pointer.
 */
export declare class ReadState {
    private _buffer;
    private _offset;
    constructor(buffer: Buffer);
    /** Used to skip bytes for reading headers. */
    incrementOffset(): void;
    peekUInt8(): number;
    readUInt8(): number;
    readUInt16(): number;
    readUInt32(): number;
    readFloat(): number;
    readDouble(): number;
    readBuffer(length: number): Buffer;
    hasEnded(): boolean;
}
export default ReadState;
//# sourceMappingURL=ReadState.d.ts.map