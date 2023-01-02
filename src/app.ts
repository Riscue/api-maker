import express, {Express} from 'express';
import {Config} from "./config";
import {parse} from "./parser";
import {fetchContent} from "./content-fetch";
import morgan from "morgan";

const config = Config.parse();

const app: Express = express();

app.use(morgan('combined'));

app.get('/', async (req, res) => res.redirect("/api"));

app.get('/api', async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(parse(await fetchContent(config.url), config.fields));
});

app.listen(8080, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:8080`);
});
