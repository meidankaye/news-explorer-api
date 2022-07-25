const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const NotFoundError = require('./utils/notfounderror');
const mainRouter = require('./routes');

const app = express();

const { PORT = 3000, NODE_ENV } = process.env;

mongoose.connect('mongodb://localhost:27017/newsexplorer');

app.use(cors());
app.options('*', cors());
app.use(express.json());

app.use('/', mainRouter);

app.use('*', (req, res, next) => {
  next(new NotFoundError('Requested resource was not found.'));
});

if (NODE_ENV !== 'test') app.listen(PORT);