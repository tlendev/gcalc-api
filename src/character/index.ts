import { Router } from 'express';
import { CharacterDetails } from './types/Character';

const charactersRouter = Router();

charactersRouter.get('/', async (req, res) => {
    // res.json(characters);
});

charactersRouter.get('/:char', async (req, res) => {
    const { char } = req.params;

    // res.json(details);
});

export { charactersRouter };
