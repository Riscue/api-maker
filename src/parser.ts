import {Field} from "./field";

const jsdom = require("jsdom");

function parseFields(document: any, fields: Field[], response: { [key: string]: any; }): { [key: string]: any; } {
    if (!fields || !document) {
        return {};
    }

    for (const field of fields) {
        if (!!field.process) {
            try {
                response[field.name] = document.querySelector(field.process.query)[field.process.method];
            } catch (e) {
            }
        } else {
            const res = parseFields(document, field.fields, {});
            if (!!res) {
                response[field.name] = res
            }
        }
    }

    return response
}

export function parse(content: string, fields: Field[]) {
    const dom = new jsdom.JSDOM(content);
    return parseFields(dom.window.document, fields, {});
}
