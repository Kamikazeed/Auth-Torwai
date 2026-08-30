import express from 'express';
import cors from 'cors';
import "dotenv/config";
import cookieParser from 'cookie-parser';

import connectDB from './config/mongoDB.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();
const port = process.env.PORT || 3000;
connectDB()

const allowedOrigin = ['http://localhost:5173']

app.use(express.json())
app.use(cookieParser())
app.use(cors({origin: allowedOrigin, credentials:true}))

// API Endpoint
app.get('/', (req,res) => {
  res.send('API is working')
})
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

app.listen(port, () => {
  console.log(`เชื่อมต่อ Server ที่ Port:${port}`)
})