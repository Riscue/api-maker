import {Field} from "./field";
import fs from "fs";
import {parse} from "yaml";

const apiConfigFile = process.env.API_FILE || `${process.env.PWD}/api.yaml`;

export class Config {
    url: string;
    fields: Field[];

    private constructor(url: string, fields: Field[]) {
        this.url = url;
        this.fields = fields;
    }

    static parse() {
        if (!fs.existsSync(apiConfigFile)) {
            console.log(`${apiConfigFile} file does not exist!`);
            process.exit(1);
        }

        const file = fs.readFileSync(apiConfigFile, 'utf8');
        const config = parse(file);
        return new Config(config.url, config.fields);
    }
}
