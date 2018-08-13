const express = require('express'),
        RegisterMiddleware = express(),
        RegisterRouter = express.Router(),
        config = require('../../config');

var UserModel = require('../../model/user');

RegisterRouter.use(function(req, res, next){
    const origin = req.headers.origin;
    if (config.client.connectionUrl.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

RegisterRouter.post('', function(req, res, next){
    UserModel.find({'email' : req.body.email}).exec(function(err, doc){
        if (doc.length === 0) {
            var newUser = new UserModel();
            newUser.name = req.body.name;
            newUser.email = req.body.email;
            newUser.userId = req.body.email;
            newUser.password = req.body.password;
            newUser.currentSteps = 0;
            newUser.totalSteps = 0;

            newUser.save(function(err, doc) {
                if(err) return res.json({data: {status: 500}});

                res.json({data: {status: 200}});
            })
        } else {
            res.json({data : {status : 101}});
        }
    });
});

RegisterMiddleware.use('/user/register', RegisterRouter);
module.exports = RegisterMiddleware;