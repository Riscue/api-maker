import puppeteer, {Browser} from 'puppeteer';

let browserInstance: Browser | null = null;

export async function launchBrowser() {
    if (!browserInstance) {
        console.log('Browser instance is not initialized. Launching browser...');
        browserInstance = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
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
