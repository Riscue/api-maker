function httpGet(url: string, headers: any) {
    return new Promise((resolve, reject) => {
        const client = url.toString().indexOf("https") === 0 ? require('https') : require('http');

        client.get(url, {headers: headers}, (resp) => {
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
            reject(err);
        });
    });
}

function httpGetHeadless(url: string, headers: any) {
    return new Promise((resolve, reject) => {
        try {
            const puppeteer = require('puppeteer');
            (async () => {
                const browser = await puppeteer.launch({
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                });
                const page = await browser.newPage();
                await page.setExtraHTTPHeaders(headers);
                await page.goto(url, {waitUntil: 'networkidle0'});
                const content = await page.content();
                resolve(content);
                await browser.close();
            })();
        } catch (err) {
            reject(err);
        }
    });
}

export async function fetchContent(url: string, headers: any, headlessBrowser: boolean) {
    if (url) {
        console.log(`headlessBrowser: ${headlessBrowser}`);
        return (await (headlessBrowser ? httpGetHeadless : httpGet)(url, headers)).toString();
    }
}
