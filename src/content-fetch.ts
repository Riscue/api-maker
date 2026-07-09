import {FetchMode, FlareSolverrSettings, ProxySettings} from "./api";
import {HttpsProxyAgent} from "https-proxy-agent";
import {HttpProxyAgent} from "http-proxy-agent";
import {fetchViaFlareSolverr} from "./flaresolverr";

function httpGet(url: string, headers: any, proxySettings?: ProxySettings): Promise<Buffer | null> {
    return new Promise((resolve, reject) => {
        const isHttps = url.toString().indexOf("https") === 0;
        const client = isHttps ? require('https') : require('http');

        const options: any = {
            headers: headers,
            rejectUnauthorized: false  // Self-signed sertifikaları kabul et
        };

        if (proxySettings) {
            const proxyProtocol = 'http';  // Proxy server genelde http çalışır
            const auth = proxySettings.username && proxySettings.password
                ? `${proxySettings.username}:${proxySettings.password}@`
                : '';
            const proxyUrl = `${proxyProtocol}://${auth}${proxySettings.host}:${proxySettings.port}`;

            try {
                if (isHttps) {
                    options.agent = new HttpsProxyAgent(proxyUrl);
                    // Agent'ın rejectUnauthorized false olması için
                    (options.agent as any).options.rejectUnauthorized = false;
                } else {
                    options.agent = new HttpProxyAgent(proxyUrl);
                }
            } catch (err) {
                console.error('Proxy agent creation failed:', err);
                return resolve(null);  // Hata durumunda null dön
            }
        }

        const req = client.get(url, options, (resp) => {
            const chunks = [];

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                chunks.push(chunk);
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                resolve(Buffer.concat(chunks));
            });

        }).on("error", (err) => {
            console.error(`HTTP request failed for ${url}:`, err.message);
            resolve(null);  // Reject yerine null dön ki uygulama crash olmasın
        });

        req.setTimeout(30000, () => {
            req.destroy();
            console.error(`HTTP request timeout for ${url}`);
            resolve(null);
        });
    });
}

export async function fetchContent(
    url: string,
    headers: any,
    fetchMode?: FetchMode,
    proxySettings?: ProxySettings,
    flaresolverr?: FlareSolverrSettings
): Promise<string | null> {
    if (!url) {
        console.error('URL is empty');
        return null;
    }

    const proxyInfo = proxySettings ? `${proxySettings.host}:${proxySettings.port}` : 'none';
    console.log(`Fetching: mode=${fetchMode}, proxy=${proxyInfo}, url=${url}`);

    try {
        let result: Buffer | string | null = null;

        switch (fetchMode) {
            case 'flaresolverr':
                if (!flaresolverr) {
                    console.error('FlareSolverr mode requires flaresolverr settings');
                    return null;
                }
                result = await fetchViaFlareSolverr(url, headers, flaresolverr);
                break;
            case 'proxy':
                if (!proxySettings) {
                    console.error('Proxy mode requires proxySettings');
                    return null;
                }
                result = await httpGet(url, [], proxySettings);
                break;
            case 'plain':
            default:
                result = await httpGet(url, headers);
                break;
        }

        if (result === null) {
            console.error(`Fetch failed for ${url} (returned null)`);
            return null;
        }
        return result.toString();
    } catch (err) {
        console.error(`Fetch error for ${url}:`, err.message);
        return null;
    }
}
