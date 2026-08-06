import express from 'express';
import authRouter from './modules/auth/auth.routes';
import { errorHandler } from './errors/error-handler.middleware';

const app = express();

app.use(express.json());

app.use('/api/v1/auth', authRouter)

app.use(errorHandler);

app.get('/', (req, res) => {
    res.send("Ticket Booking API is running ")
});

export default app;