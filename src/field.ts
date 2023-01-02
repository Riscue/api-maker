import {Process} from "./process";

export interface Field {
    name: string;
    fields: Field[];
    process: Process;
}
