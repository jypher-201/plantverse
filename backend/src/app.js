const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const plantRoutes = require('./routes/plant.routes');
const readingRoutes = require('./routes/reading.routes');
const waterRoutes = require('./routes/water.routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/api', plantRoutes);
app.use('/api', readingRoutes);
app.use('/api', waterRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;