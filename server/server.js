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

app.use(cors({ origin: process.env.FRONTEND_BASE_URL, credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI, collectionName: 'sessions' }),
  cookie: { secure: false, httpOnly: true, sameSite: 'lax', maxAge: 1000*60*60*24 },
}));
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use('/', chatRoutes);
app.use('/payment', paystackRoutes);
app.use('/seedmenu', seedMenu);
app.use('/stats', statsRoutes);

app.get('/session-debug', (req, res) => res.json(req.session));
app.listen(PORT, () => console.log(`Server on port ${PORT}`));