const express = require('express'),
        LogoutMiddleware = express(),
        LogoutRouter = express.Router(),
        config = require('../../config'),
        session = require('express-session'),
        cookieParser = require('cookie-parser');

LogoutRouter.use(cookieParser());
LogoutRouter.use(session({ secret: 'secretkey', cookie: { httpOnly: false,secure:false,expires: new Date(Date.now() + (1*24*60*60*1000))} }));

LogoutRouter.use(function(req, res, next) {
    const origin = req.headers.origin;

    if(config.client.connectionUrl.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
    if((req.session.cookie._expires > (new Date())) && req.cookies['token']){
        next();
    } else {
        res.cookie("token", "", { expires: new Date() });
        res.json({data: {status : 401}});
    }/*next();*/
});

LogoutRouter.post('', function(req, res, next) {
    req.session.destroy(function (err){
        res.clearCookie('token');

        if(err) return res.json({data: {status: 500}});
        else return res.json({data: {status: 200}});
    });
});


LogoutMiddleware.use('/user/logout', LogoutRouter);

module.exports = LogoutMiddleware;