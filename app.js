var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    connection = require('./connection'),
    AuthMiddleware = require('./router/auth/router'),
    LoginMiddleware = require('./router/login/router'),
    StepsMiddleware = require('./router/steps/router'),
    RegistrationMiddleware = require('./router/registration/router'),
    LogoutMiddleware = require('./router/logout/router');


app.use(bodyParser.json());
app.use('/', [AuthMiddleware, LoginMiddleware, StepsMiddleware, RegistrationMiddleware, LogoutMiddleware]);
module.exports = app;