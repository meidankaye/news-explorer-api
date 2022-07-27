require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { errors } = require('celebrate');
const centralerrorhandler = require('./middleware/centralerrorhandler');
const NotFoundError = require('./utils/notfounderror');
const { limiter } = require('./utils/ratelimiter');
const mainRouter = require('./routes');
const { requestLogger, errorLogger } = require('./middleware/logger');

const app = express();

const { PORT = 3000, NODE_ENV } = process.env;

mongoose.connect('mongodb://localhost:27017/newsexplorer');

app.use(limiter);
app.use(cors());
app.options('*', cors());
app.use(express.json());
app.use(helmet());

app.use(requestLogger);

app.use('/', mainRouter);

app.use('*', (req, res, next) => {
  next(new NotFoundError('Requested resource was not found.'));
});

app.use(errorLogger);
app.use(errors());
app.use(centralerrorhandler);

if (NODE_ENV !== 'test') app.listen(PORT);