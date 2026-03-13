import puppeteer, {Browser} from 'puppeteer';

let browserInstance: Browser | null = null;

export async function launchBrowser() {
    if (!browserInstance) {
        console.log('Browser instance is not initialized. Launching browser...');
        browserInstance = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=BlockInsecurePrivateNetworkRequests',
                '--disable-extensions',
                '--no-first-run',
                '--no-default-browser-check',
                '--ignore-certificate-errors',
                '--ignore-ssl-errors'
            ]
        });
    }
}

export function getBrowser(): Browser {
    if (!browserInstance) {
        launchBrowser().then();
    }
    return browserInstance;
}

export async function closeBrowser() {
    if (browserInstance) {
        await browserInstance.close();
        browserInstance = null;
    }
}
