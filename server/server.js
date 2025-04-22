import express from 'express';
import session from 'express-session';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MongoStore from 'connect-mongo';

import chatRoutes from './routes/chatRoutes.js';
import paystackRoutes from './routes/paystackRoutes.js';
import seedMenu from './seed/seedMenu.js';
import statsRoutes from './routes/statsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware 
app.use(cors({
  origin: process.env.FRONTEND_BASE_URL,
  credentials: true,
}));

app.use(express.json());

// Session with MongoDB Store 
app.use(session({
  secret: 'super-secret-session-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
  }),
  cookie: {
    secure: false,      // plain‐HTTP dev
    httpOnly: true,
    sameSite: 'lax',    // now that we'll proxy, this works fine
    maxAge: 1000 * 60 * 60 * 24,
  },
}));

// Connect DB 
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(' MongoDB connected'))
  .catch(err => console.error(' MongoDB connection error:', err));

// Routes 
app.use('/', chatRoutes);
app.use('/payment', paystackRoutes);
app.use('/seedmenu', seedMenu);
app.use('/stats', statsRoutes);

app.get('/', (req, res) => {
  res.send('LeezieBite API running!');
});

app.get('/session-debug', (req, res) => {
  res.json(req.session);
});

app.use((req, res) => {
  res.status(404).send(`Route not found: ${req.method} ${req.path}`);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
