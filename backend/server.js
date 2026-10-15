import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import aiRoutes from './routes/ai.routes.js';


const app = express();

app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl} - Request received`);

    res.on('finish', () => {
        console.log(
            `${req.method} ${req.originalUrl} - Response sent: ${res.statusCode}`
        );
    });

    next();
});

app.use(
    cors({
        origin:
            process.env.FRONTEND_URL ||
            process.env.CLIENT_URL ||
            'http://localhost:3000',
        credentials: true,
    })
);

app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);


app.get('/', (req, res) => {
    res.send('Backend is running');
});

const startServer = async () => {
    await connectDB();

    app.listen(process.env.PORT || 8762, () => {
        console.log(
            `----- Server is online on PORT : ${process.env.PORT} -----`
        );
    });
};

startServer();
