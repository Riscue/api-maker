import {Field} from "./field";

const jsdom = require("jsdom");

function parseFields(document: any, fields: Field[], response: { [key: string]: any; }): { [key: string]: any; } {
    if (!fields || !document) {
        return {};
    }

    for (const field of fields) {
        if (field.process?.array && field.fields?.length) {
            // Array of nested objects (e.g., matches)
            try {
                const elements = document.querySelectorAll(field.process.query);
                response[field.name] = Array.from(elements).map((el: any) => {
                    return parseFields(el, field.fields, {});
                });
            } catch (e) {}
        } else if (field.process) {
            try {
                if (field.process.array) {
                    const elements = document.querySelectorAll(field.process.query);
                    response[field.name] = Array.from(elements).map((el: any) => {
                        const val = el[field.process.method];
                        return typeof val === 'string' ? val.trim() : val;
                    });
                } else {
                    response[field.name] = document.querySelector(field.process.query)[field.process.method].trim();
                }
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
