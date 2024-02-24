/**
 * Binary coder types
 */
export declare const enum CoderType {
    /** A single boolean, encoded as a single UInt8. @see {CoderType.BITMASK_8} */
    BOOLEAN = "boolean",
    /** A string. */
    STRING = "string",
    /** Floating-point number (32-bit, single precision). */
    FLOAT_32 = "float32",
    /** Floating-point number (64-bit, double precision). Default JavaScript `number` type. */
    FLOAT_64 = "float64",
    /** Signed integer (between -2^53 and 2^53). */
    INT = "int",
    /** Unsigned integer (between 0 and 2^53). */
    UINT = "uint",
    /**
     * A JavaScript buffer object.
     * @see {Buffer}
     */
    BUFFER = "Buffer",
    /**
     * A JavaScript date object.
     * @see {Date}
     */
    DATE = "date",
    /**
     * A JavaScript regular expression object.
     * @see {RegExp}
     */
    REGEX = "regex",
    /**
     * Any JSON-serializable data.
     */
    JSON = "json",
    /** A special array containing a variable number of booleans, uses minimum encoding (minus header 2-bit header). */
    BOOLEAN_ARRAY = "booleans",
    /** An array containing up to 8 booleans, encoded as a single UInt8. */
    BITMASK_8 = "bitmask8",
    /** An array containing up to 16 booleans, encoded as a single UInt16. */
    BITMASK_16 = "bitmask16",
    /** An array containing up to 32 booleans, encoded as a single UInt32. */
    BITMASK_32 = "bitmask32",
    /**
     * An array definition.
     * @see {Array}
     */
    ARRAY = "[array]",
    /**
     * A dictionary-like definition.
     */
    OBJECT = "{object}"
}
//# sourceMappingURL=CoderType.d.ts.map