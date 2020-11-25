const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const app = express();

// cors
app.use(cors());

// http response header protection
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'style-src': ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
        'script-src': ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
        'object-src': ["'none'"],
      },
    },
  }),
);
// app.disable('x-powered-by');

app.use(cookieParser());

// json request parser
app.use(express.json());

// static files
app.use('/node_modules', express.static(__dirname + '/node_modules'));

// view templates engine
app.set('views', './app/client/public/views/');
app.set('view engine', 'ejs');

if (process.env.NODE_ENV !== 'production') {
  // .env configurations
  require('dotenv').config();

  // HTTP request logger
  const morgan = require('morgan');
  app.use(morgan('common'));
}

// db migration
// require('./app/utils/dbMigration.js')();

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
