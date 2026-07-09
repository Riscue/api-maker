import {FlareSolverrSettings} from "./api";

interface FlareSolverrSolution {
    url?: string;
    status?: number;
    headers?: { [key: string]: string };
    response?: string;
    cookies?: any[];
    userAgent?: string;
}

interface FlareSolverrResponse {
    status: string;
    message: string;
    startTimestamp?: number;
    endTimestamp?: number;
    solution?: FlareSolverrSolution;
}

const readySessions = new Set<string>();
const pendingSessions = new Map<string, Promise<void>>();

function postToFlareSolverr(
    settings: FlareSolverrSettings,
    bodyObj: any,
    socketTimeoutMs: number
): Promise<FlareSolverrResponse | null> {
    return new Promise((resolve) => {
        const body = JSON.stringify(bodyObj);

        let parsedUrl: URL;
        try {
            parsedUrl = new URL(settings.url);
        } catch (err) {
            console.error(`FlareSolverr URL invalid: ${settings.url}`, err.message);
            return resolve(null);
        }

        const isHttps = parsedUrl.protocol === 'https:';
        const client = isHttps ? require('https') : require('http');
        const defaultPort = isHttps ? 443 : 80;

        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || defaultPort,
            path: '/v1',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
            },
        };

        const req = client.request(options, (resp: any) => {
            const chunks: Buffer[] = [];
            resp.on('data', (chunk: Buffer) => chunks.push(chunk));
            resp.on('end', () => {
                const raw = Buffer.concat(chunks).toString();
                let parsed: FlareSolverrResponse;
                try {
                    parsed = JSON.parse(raw);
                } catch (err) {
                    console.error(`FlareSolverr response parse failed:`, err.message);
                    return resolve(null);
                }
                resolve(parsed);
            });
        });

        req.on('error', (err: Error) => {
            console.error(`FlareSolverr request error:`, err.message);
            resolve(null);
        });

        req.setTimeout(socketTimeoutMs, () => {
            req.destroy();
            console.error(`FlareSolverr socket timeout (${socketTimeoutMs}ms)`);
            resolve(null);
        });

        req.write(body);
        req.end();
    });
}

async function ensureSession(settings: FlareSolverrSettings, sessionName: string): Promise<void> {
    if (readySessions.has(sessionName)) return;
    const existing = pendingSessions.get(sessionName);
    if (existing) {
        await existing;
        return;
    }

    const p = (async () => {
        const resp = await postToFlareSolverr(
            settings,
            {cmd: 'sessions.create', session: sessionName},
            30000
        );
        if (resp?.status === 'ok') {
            console.log(`[flaresolverr] session created: ${sessionName}`);
        } else {
            console.warn(
                `[flaresolverr] session create for "${sessionName}" returned: status=${resp?.status}, message=${resp?.message || 'n/a'}`
            );
        }
        readySessions.add(sessionName);
    })().finally(() => {
        pendingSessions.delete(sessionName);
    });

    pendingSessions.set(sessionName, p);
    await p;
}

export async function fetchViaFlareSolverr(
    targetUrl: string,
    headers: any,
    settings: FlareSolverrSettings
): Promise<string | null> {
    if (!settings?.url) {
        console.error('FlareSolverr settings.url is empty');
        return null;
    }

    const maxTimeout = settings.maxTimeout ?? 60000;

    if (settings.session) {
        try {
            await ensureSession(settings, settings.session);
        } catch (err) {
            console.warn(
                `[flaresolverr] session ensure failed: ${err.message} — continuing without session`
            );
        }
    }

    const bodyObj: any = {
        cmd: 'request.get',
        url: targetUrl,
        maxTimeout,
    };
    if (settings.session) bodyObj.session = settings.session;
    if (headers && Object.keys(headers).length > 0) bodyObj.headers = headers;
    if (settings.proxy?.url) bodyObj.proxy = {url: settings.proxy.url};

    const resp = await postToFlareSolverr(settings, bodyObj, maxTimeout + 5000);
    if (!resp || resp.status !== 'ok' || !resp.solution?.response) {
        console.error(
            `[flaresolverr] did not solve ${targetUrl}: status=${resp?.status}, message=${resp?.message || 'n/a'}`
        );
        return null;
    }

    return resp.solution.response;
}
