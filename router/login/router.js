const express = require('express'),
        LoginMiddleware = express(),
        LoginRouter = express.Router(),
        passport = require('passport'),
        LocalStrategy = require('passport-local'),
        session = require('express-session'),
        cookieParser = require('cookie-parser'),
        UserModel = require('../../model/user'),
        config = require('../../config');


passport.serializeUser(function(user, done){

    if(user){
        done(null, user.id);
    }
});

passport.deserializeUser(function(id, done){
    
    UserModel.findById(id, function(err, user){
        if(user){
            return done(null, user);
        }else{
            return done(null, false);
        }
    })
});


passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        session: true
    },
    function(email, password, done){
        UserModel.findOne({'userId': email, 'password': password}, function(err, user){

            if(err){return done(err);}
            if(!user){
                console.log("user incorrect");
                return done(null, false, {message: "Incorrect username/password"});
            }
            return done(null,user);
        })
    }
));

LoginRouter.use(function(req, res, next){
    const origin = req.headers.origin;

    if (config.client.connectionUrl.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

LoginRouter.use(cookieParser());
LoginRouter.use(session({ secret: 'secretkey', cookie: { httpOnly: false,secure:false,expires: new Date(Date.now() + (1*24*60*60*1000))} }));
LoginRouter.use(passport.initialize());
LoginRouter.use(passport.session());

LoginRouter.post('', function(req, res, next) {
    passport.authenticate('local-login', function(err, user, info){
        if(err){return res.json({data: {status : 500}}); }
        if(!user){return res.json({data: {status : 401}}); }
        else {
            var token = Math.random().toString() + "-" + user._id;
            res.cookie('token',token, { httpOnly: false,secure:false,expires: new Date(Date.now() + (1*24*60*60*1000))});
            return res.json({data: {status : 200}});
        }
    })(req, res, next);
});

LoginMiddleware.use('/user/login', LoginRouter);

module.exports = LoginMiddleware;