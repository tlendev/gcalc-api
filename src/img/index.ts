import { Router } from 'express';
import { join } from 'path';

const imgRouter = Router();

imgRouter.get('/:file', (req, res) => {
    const { file } = req.params;
    res.sendFile(join(process.cwd(), 'collection', 'media', file));
});

export { imgRouter };
