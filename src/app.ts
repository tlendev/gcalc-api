import { Router } from 'express';

const appRouter = Router();

appRouter.get('/', (req, res) => {
    res.json({
        api_version: '1.0.0',
        status: 'healthy',
        uptime: Math.floor(process.uptime()),
    });
});

export { appRouter };
