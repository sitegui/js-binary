import { CoderType, Schema } from './Schema';
/**
 * Parse and represent an object field. See example in Type.js
 */
export declare class Field {
    readonly name: string;
    readonly type: Schema;
    readonly isOptional: boolean;
    readonly isArray: boolean;
    constructor(name: string, type: CoderType);
}
export default Field;
//# sourceMappingURL=Field.d.ts.map