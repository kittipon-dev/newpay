var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');
var espRouter = require('./routes/esp');
var lineRouter = require('./routes/line');
var ksherRouter = require('./routes/ksher');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'),{etag: false}));

// APPLY COOKIE SESSION MIDDLEWARE
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/esp', espRouter);
app.use('/line', lineRouter);
app.use('/ksher', ksherRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  //res.status(err.status || 500);
 // res.render('error');
 res.end()
});

const Config = require('./models/Config')
chConfig()
async function chConfig() {
  const dbConfig = await Config.find({})
  if(dbConfig[0]==null){
    const config = new Config({user_id:1000})
    config.save()
  }
}

module.exports = app;
