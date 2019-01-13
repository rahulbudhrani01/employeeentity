var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    db = require('./model/db'),
    cookieParser = require('cookie-parser'),
    employee = require('./model/employees');
    routes = require('./routes/index'),
    employee = require('./model/employees');



var routes = require('./routes/index');
var employees = require('./routes/employees');

var app = express();

app.use('/', routes);
app.use('/employees', employees);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

console.log("http://localhost:3000/")
module.exports = app;
