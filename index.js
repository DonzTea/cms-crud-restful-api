const express = require('express');
// const morgan = require('morgan');
const cors = require('cors');

const app = express();

// cors
app.use(cors());

// json request parser
app.use(express.json());

// HTTP request logger
// app.use(morgan('common'));

// roles table seeder
require('./app/utils/rolesSeeder.js')();

app.get('/', (req, res) => res.status(200).json({ data: 'Hello world' }));

// routes caller
require('./app/routes/main.js')(app);

// error handler 404
app.use(function (req, res, next) {
  return res.status(404).send({
    status: 404,
    message: 'Not Found',
  });
});

// error handler 500
app.use(function (err, req, res, next) {
  return res.status(500).send({
    error: err,
  });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '127.0.0.1', () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log('App listening at http://%s:%s', host, port);
});
