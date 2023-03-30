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

export async function fetchContent(url: string, headers: any) {
    if (url) {
        return (await httpGet(url, headers)).toString();
    }
}
