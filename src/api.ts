import {Field} from "./field";

export type FetchMode = 'plain' | 'proxy' | 'flaresolverr';

export interface ProxySettings {
    host: string;
    port: number;
    username?: string;
    password?: string;
}

export interface FlareSolverrSettings {
    url: string;
    maxTimeout?: number;
    proxy?: { url: string };
    session?: string;
}

export class Api {
    url: string;
    name: string;
    path: string;
    fields: Field[];
    headers: any[];
    fetchMode?: FetchMode;
    proxySettings?: ProxySettings;
    flaresolverr?: FlareSolverrSettings;
}
