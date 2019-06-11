import Express from 'express';

export const apiRouter = Express.Router()
    .get('/version', (_req, res) => {
        res.json({ v: 1 });
    });
