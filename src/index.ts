/**
 * Big thank you to honeyhunterworld for providing the api data
 * https://genshin.honeyhunterworld.com/
 */

import express from 'express';
import { appRouter } from './app';
import { charactersRouter } from './character/index';

const PORT = process.env.PORT || 8080;

async function bootstrap() {
    const app = express();

    app.use('/', appRouter);
    app.use('/characters', charactersRouter);

    app.listen(PORT, () => console.log(`server started on port ${PORT}`));
}
bootstrap();
