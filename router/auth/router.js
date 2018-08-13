const express = require('express'),
    AuthMiddleware = express(),
    AuthRouter = express.Router(),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    config = require('../../config');

AuthRouter.use(cookieParser());
AuthRouter.use(session({ secret: 'secretkey', cookie: { httpOnly: false,secure:false,expires: new Date(Date.now() + (1*24*60*60*1000))} }));

AuthRouter.use(function (req, res, next) {
    const origin = req.headers.origin;
    if (config.client.connectionUrl.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if((req.session.cookie._expires > (new Date())) && req.cookies['token']){
	    res.json({data: {status : 200}});
	} else {
	    res.cookie("token", "", { expires: new Date() });
	    res.json({data: {status : 401}});
	}
});

AuthRouter.get('', function(req, res, next){});

AuthMiddleware.use('/auth', AuthRouter);

module.exports = AuthMiddleware;