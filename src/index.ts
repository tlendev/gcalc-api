/**
 * Big thank you to honeyhunterworld for providing the api data
 * https://genshin.honeyhunterworld.com/
 */

import express from 'express';
import puppeteer, { Browser } from 'puppeteer';
import { appRouter } from './app';
import { charactersRouter } from './character/index';

const PORT = process.env.PORT || 8080;
let browser: Browser;

async function bootstrap() {
    const app = express();
    browser = await puppeteer.launch({
        headless: true,
        defaultViewport: { height: 99999, width: 1080 },
    });

    app.use('/', appRouter);
    app.use('/characters', charactersRouter);

    app.listen(PORT, () => console.log(`server started on port ${PORT}`));
}
bootstrap();

export { browser };
