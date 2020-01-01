/// <reference types="node" />
import { URL, UrlWithStringQuery } from 'url';
export interface LegacyURLOptions {
    protocol: string;
    hostname: string;
    host: string;
    hash: string | null;
    search: string | null;
    pathname: string;
    href: string;
    path: string;
    port?: number;
    auth?: string;
}
declare const _default: (url: URL | UrlWithStringQuery) => LegacyURLOptions;
export default _default;
