import dotenv from 'dotenv'
dotenv.config({})
import express from 'express'
import connectDb from './db/Dbconnection.js';
import eventRoutes from './routes/eventRoute.js'
import authRoutes from './routes/auth.js'
import bodyParser from 'body-parser';
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json())
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3001',
    methods: 'GET, POST, PATCH, DELETE',
    credentials: true,
}))

app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    connectDb();
    console.log(`server listing at ${PORT}`);
})
