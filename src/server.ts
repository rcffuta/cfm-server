import express from 'express';
import { createServer } from 'node:http';

export const app = express();


app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});
