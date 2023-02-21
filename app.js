require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { errors } = require('celebrate');
const corsOptions = require('./config/corsOptions');
const centralerrorhandler = require('./middleware/centralerrorhandler');
const { MONGODB_URL } = require('./utils/constants');
const NotFoundError = require('./utils/notfounderror');
const { limiter } = require('./utils/ratelimiter');
const mainRouter = require('./routes');
const connectDB = require('./config/dbConn');
const { requestLogger, errorLogger } = require('./middleware/logger');

connectDB();

const app = express();

const { PORT = 3000, NODE_ENV = MONGODB_URL } = process.env;

mongoose.set('strictQuery', false);
// mongoose.connect(MONGODB);

app.use(limiter);
app.use(cors(corsOptions));
app.options('*', cors());
app.use(express.json());
app.use(helmet());

app.use(requestLogger);

app.use('/', mainRouter);

app.use(errorLogger);

app.use('*', (req, res, next) => {
  next(new NotFoundError('Requested resource was not found.'));
});

app.use(errors());
app.use(centralerrorhandler);

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB!');
  if (NODE_ENV !== 'test') app.listen(PORT);
});
