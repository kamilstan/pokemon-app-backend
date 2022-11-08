import express, { Router } from 'express';
import 'express-async-errors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import rateLimiter from 'express-rate-limit';
import helmet from 'helmet';
import { handleError } from './utils/handleErrors';

import morgan = require("morgan");
import {registrationRouter} from "./routers/registration.router";
import {loginRouter} from "./routers/login.router";

const app = express();

app.use(express.json());
dotenv.config({ path: '.env' });
app.use(helmet());
app.use(cookieParser());
app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    })
);
app.use(morgan('common'));
app.use(
    rateLimiter({
        windowMs: 5 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
    })
);

//routers
const router = Router();

router.use('/registration', registrationRouter);
router.use('/login', loginRouter);


app.use('/api', router);

app.use(handleError);

app.listen(8080, '0.0.0.0', () => {
    console.log(`Server is running: http://localhost:8080`);
});
