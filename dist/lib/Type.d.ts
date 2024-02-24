/**
 * Binary coder types.
 */
export declare const enum Type {
    /** A single boolean, encoded as a single UInt8. @see {Type.Bitmask8} */
    Boolean = "bool",
    /** A string. */
    String = "str",
    /** Floating-point number (32-bit, single precision). */
    Float = "float",
    /** Floating-point number (64-bit, double precision). Default JavaScript `number` type. */
    Double = "double",
    /**
     * Signed integer.
     *
     * Automatically uses 1, 2, 4, or 8 bytes depending on the value:
     *  - For values -64 -> 64 uses 1 byte.
     *  - For values -8,192 -> 8,192 uses 2 bytes.
     *  - For values -268,435,456 -> 268,435,456 uses 4 bytes.
     *  - For values -Number.MAX_SAFE_INTEGER -> Number.MAX_SAFE_INTEGER uses 8 bytes (if outside of the 4 byte range).
     */
    Int = "int",
    /** Signed 8-byte integer (between 0 and 128). */
    Int8 = "int8",
    /** Signed 16-byte integer (between 0 and 32,767). */
    Int16 = "int16",
    /** Signed 32-byte integer (between 0 and 2,147,483,647). */
    Int32 = "int32",
    /**
     * Unsigned integer.
     *
     * Automatically uses 1, 2, 4, or 8 bytes depending on the value:
     *  - For values 0 -> 127 uses 1 bytes.
     *  - For values 128 -> 16,384 uses 2 bytes.
     *  - For values 16,385 -> 536,870,911 uses 4 bytes.
     *  - For values 536,870,912 -> Number.MAX_SAFE_INTEGER uses 8 bytes.
     */
    UInt = "uint",
    /** Unsigned 8-byte integer (between 0 and 255). */
    UInt8 = "uint8",
    /** Unsigned 16-byte integer (between 0 and 65,535). */
    UInt16 = "uint16",
    /** Unsigned 32-byte integer (between 0 and 4,294,967,295). */
    UInt32 = "uint32",
    /**
     * A JavaScript buffer object.
     * @see {Buffer}
     */
    Buffer = "buffer",
    /**
     * A JavaScript date object.
     * @see {Date}
     */
    Date = "date",
    /**
     * A JavaScript regular expression object.
     * @see {RegExp}
     */
    RegExp = "regexp",
    /**
     * Any JSON-serializable data.
     */
    JSON = "json",
    /**
     * An array of booleans.
     *
     * Automatically packs into the minimal amount of bytes:
     *  - For arrays with 0 -> 6 values uses 1 bytes.
     *  - For arrays with 7 -> 12 values uses 2 bytes.
     *  - And so forth...
     */
    BooleanArray = "boolarray",
    /** An array containing up to 8 booleans, encoded as a single UInt8. */
    Bitmask8 = "bitmask8",
    /** An array containing up to 16 booleans, encoded as a single UInt16. */
    Bitmask16 = "bitmask16",
    /** An array containing up to 32 booleans, encoded as a single UInt32. */
    Bitmask32 = "bitmask32",
    /**
     * An array definition.
     * @see {Array}
     */
    Array = "[array]",
    /**
     * A dictionary-like definition.
     */
    Object = "{object}"
}
//# sourceMappingURL=Type.d.ts.map