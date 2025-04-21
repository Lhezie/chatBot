
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes.js';
import paystackRoutes from './routes/paystackRoutes.js';
import seedMenu from './seed/seedMenu.js';
import statsRoutes from './routes/statsRoutes.js';

dotenv.config();

const app = express();
console.log('🚀 Server is starting...');

app.use('/socket.io', (req, res) => {
  res.status(404).send('Socket not supported');
});

app.use((req, res, next) => {
  console.log('🌐 Incoming:', req.method, req.path);
  next();
});

const PORT = parseInt(process.env.PORT, 10) || 4000;

if (isNaN(PORT)) {
  throw new Error(`Invalid PORT value in .env: ${process.env.PORT}`);
}

// CORS setup
const allowedOrigins = [
  'http://localhost:3000',
  'https://chat-bot-five-beryl.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
}));


app.use(express.json());

// Session config
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
  },
}));

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use((req, res, next) => {
  console.log(' Middleware HIT:', req.method, req.path);
  next();
});

app.post('/test-debug', (req, res) => {
  console.log('/test-debug HIT');
  res.send('test-debug worked');
});

app.use('/', chatRoutes);

app.use((req, res, next) => {
  console.log('⚡ Headers:', req.headers);
  console.log('⚡ Session:', req.session);
  next();
});

app.use('/payment', paystackRoutes);
app.use('/seedmenu', seedMenu);
app.use('/stats', statsRoutes);

app.get('/', (req, res) => {
  res.send(' LeezieBite ChatBot API is running');
});

app.post('/test-simple', (req, res) => {
  res.json({ message: 'Route works!' });
});

app.post('/test', (req, res) => {
  console.log('Test route hit!');
  res.send('Test successful!');
});

app.use((req, res) => {
  res.status(404).send(`Route not found: ${req.method} ${req.path}`);
});

app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
