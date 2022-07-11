import { Router } from 'express';
import { PathLike } from 'fs';
import { access } from 'fs/promises';
import { join } from 'path';

const exists = async (path: PathLike) => {
    try {
        await access(path);
        return true;
    } catch {
        return false;
    }
};

const imgRouter = Router();

imgRouter.get('/:file', async (req, res) => {
    const { file } = req.params;
    if (!(await exists(join(process.cwd(), 'collection', 'media', file)))) {
        res.status(404).json({ message: 'File not found' }).end();
        return;
    }
    res.sendFile(join(process.cwd(), 'collection', 'media', file));
});

export { imgRouter };
