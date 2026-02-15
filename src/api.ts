import {Field} from "./field";

export type FetchMode = 'plain' | 'headless' | 'proxy';

export interface ProxySettings {
    host: string;
    port: number;
    username?: string;
    password?: string;
}

export class Api {
    url: string;
    name: string;
    path: string;
    fields: Field[];
    headers: any[];
    fetchMode?: FetchMode;
    proxySettings?: ProxySettings;
}
