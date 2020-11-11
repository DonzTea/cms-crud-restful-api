const express = require('express');
const cors = require('cors');

const app = express();

// cors
app.use(cors());

// json request parser
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  // .env configurations
  require('dotenv').config();

  // HTTP request logger
  const morgan = require('morgan');
  app.use(morgan('common'));
}

// roles table seeder
require('./app/utils/dbMigration.js')();

// routes caller
require('./app/routes/main.js')(app);

// error handler 404
app.use(function (req, res, next) {
  return res.status(404).json({
    message: 'Not Found',
  });
});

// error handler 500
app.use(function (err, req, res, next) {
  return res.status(500).json({
    message: 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});
