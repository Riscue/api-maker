import fs from "fs";
import {parse} from "yaml";
import {Api} from "./api";

const apiConfigFile = process.env.API_FILE || `${process.env.PWD}/api.yaml`;

export class Config {
    port: number;
    apis: Api[];

    constructor(port: number, apis: Api[]) {
        this.port = port;
        this.apis = apis;
    }

    static parse() {
        if (!fs.existsSync(apiConfigFile)) {
            console.log(`${apiConfigFile} file does not exist!`);
            process.exit(1);
        }

        const file = fs.readFileSync(apiConfigFile, 'utf8');
        const config = parse(file);
        return new Config(config.port, config.apis);
    }
}
