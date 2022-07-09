import { Router } from 'express';
import { CharacterDetails } from './types/Character';
import { access, readFile } from 'fs/promises';
import { v4 as uuid } from 'uuid';
import { PathLike } from 'fs';

interface Meta {
    count: number;
    names: Array<string>;
}

const exists = async (path: PathLike) => {
    try {
        await access(path);
        return true;
    } catch {
        return false;
    }
};

const charactersRouter = Router();

charactersRouter.get('/', async (req, res) => {
    const buf = await readFile('./collection/meta.json');
    const { names } = JSON.parse(buf.toString()) as Meta;
    const list = names.map((name) => {
        return { id: uuid(), name };
    });
    res.json(list);
});

charactersRouter.get('/:char', async (req, res) => {
    const { char } = req.params;

    if (
        !(await exists(
            `./collection/${char.replace(' ', '-').toLocaleLowerCase()}.json`
        ))
    ) {
        res.status(404)
            .json({ message: `Character ${char} not found` })
            .end();
        return;
    }

    const buf = await readFile(
        `./collection/${char.replace(' ', '-').toLocaleLowerCase()}.json`
    );
    const details = JSON.parse(buf.toString()) as CharacterDetails;

    res.json(details);
});

export { charactersRouter };
