import express from 'express';
import type { Request, Response } from 'express';

const app = express();

app.get('/greeting', (req: Request, res: Response): void => {
  res.send('Hello World!');
});

export { app };
