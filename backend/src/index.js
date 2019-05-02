import express from 'express';
import http from 'http';
import cors from 'cors';

import { initFeEndpoints } from './fe-endpoints';
import initCardEndpoint from './card-endpoint';

const cardApp = express();
cardApp.use(cors());
cardApp.use(express.json());
initCardEndpoint(cardApp);
http.createServer(cardApp).listen(3000);

const feApp = express();
feApp.use(cors());
feApp.use(express.json());
initFeEndpoints(feApp);
http.createServer(feApp).listen(3001);
