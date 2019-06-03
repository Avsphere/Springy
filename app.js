process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev'
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const app = express();
const logger = require('./logger')
const config = require('config')
const mongoose = require('mongoose')
const PORT = config.port || 3000;


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(morgan('dev'));
app.use(bodyParser.json({ limit : '10mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(config.database.connectionString, { useNewUrlParser: true })
.then( s => logger.info('Db connected') )
.catch( e => logger.error('Db connect failed %O ', e))


app.use('/', require('./router') );


app.use( (req, res, next) => {
  logger.error('Url not found : %O', req.url)
  let err = new Error('Not found');
  err.status = 404;
  next(err);
})

app.use( (err, req, res, next) => {
  // set locals, only providing error in development
  logger.error('Top catch %O', err);
  res.send({ error : err.message })
});


app.listen(PORT, console.log(`Listening on ${PORT}`) )

module.exports = app;
