import express, {Express} from 'express';
import {Config} from "./config";
import {parse} from "./parser";
import {fetchContent} from "./content-fetch";
import morgan from "morgan";
import {Api} from "./api";

const config = Config.parse();

const app: Express = express();

app.use(morgan('combined'));

app.get('/', async (req, res) => {
    const response = {apis: []};
    config.apis.forEach((api: Api) => {
        let item = {
            name: api.name,
            path: `${req.protocol}://${req.get('host')}${req.originalUrl}${api.path}`
        };
        response.apis.push(item)
    });
    res.send(response);
});

config.apis.forEach((api: Api) => {
    app.get(`/${api.path}`, async (req, res) => {
        res.setHeader("Content-Type", "application/json");

        const headers = {};
        if (api.headers) {
            for (let header in api.headers) {
                headers[header] = api.headers[header];
            }
        }

        try {
            const content = await fetchContent(api.url, headers, api.fetchMode, api.proxySettings, api.flaresolverr);
            if (content) {
                res.send(parse(content, api.fields));
            } else {
                let errorMsg = `Failed to fetch content from ${api.url}`;
                let details: string;
                if (api.fetchMode === 'flaresolverr' && api.flaresolverr) {
                    errorMsg += ` (FlareSolverr ${api.flaresolverr.url})`;
                    details = `FlareSolverr at ${api.flaresolverr.url} did not return content`;
                } else if (api.fetchMode === 'proxy' && api.proxySettings) {
                    errorMsg += ` (${api.proxySettings.host}:${api.proxySettings.port})`;
                    details = `Proxy server ${api.proxySettings.host}:${api.proxySettings.port} is not reachable`;
                } else {
                    details = `Network connection failed (mode: ${api.fetchMode || 'plain'})`;
                }
                console.error(`[${api.name}] ${errorMsg}`);
                res.status(503).json({
                    error: 'Service Unavailable',
                    message: errorMsg,
                    details
                });
            }
        } catch (err) {
            const errorMsg = `[${api.name}] Internal error: ${err.message}`;
            console.error(errorMsg);
            res.status(500).json({
                error: 'Internal Server Error',
                message: err.message
            });
        }
    });
});

app.listen(config.port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${config.port}`);
});
