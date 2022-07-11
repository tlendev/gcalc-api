/**
 * Big thank you to honeyhunterworld for providing the api data
 * https://genshin.honeyhunterworld.com/
 */
import express from 'express';
import { appRouter } from './app';
import { charactersRouter } from './character/index';
import helmet from 'helmet';
import cors from 'cors';
import { imgRouter } from './img';

const PORT = process.env.PORT || 8080;

async function bootstrap() {
    const app = express();

    app.use(helmet());
    app.use(cors({ origin: process.env.ALLOW_URL }));
    app.use('/', appRouter);
    app.use('/characters', charactersRouter);
    app.use('/img', imgRouter);

    app.listen(PORT, () => console.log(`server started on port ${PORT}`));
}
bootstrap();
