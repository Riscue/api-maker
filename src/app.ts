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
        res.send(parse(await fetchContent(api.url, headers), api.fields));
    });
});

app.listen(config.port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${config.port}`);
});
