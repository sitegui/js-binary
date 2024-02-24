import { BinaryCodec } from './BinaryCodec';
import { Type } from './Type';
/**
 * Parse and represent an object field. See example in Type.js
 */
export declare class Field {
    readonly name: string;
    readonly type: BinaryCodec;
    readonly isOptional: boolean;
    readonly isArray: boolean;
    constructor(name: string, type: Type);
}
export default Field;
//# sourceMappingURL=Field.d.ts.map