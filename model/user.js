var mongoose = require('mongoose')
    UserSchema = require('../schema/user');

var UserModel = mongoose.model('user', UserSchema);

module.exports = UserModel;