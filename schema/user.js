var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
    userId              :   String,
    email               :   String,
    password            :   String,
    name                :   String,
    currentSteps        :   Number,
    totalSteps          :   Number,
    currentStepsDate    :   Date
});

module.exports = UserSchema;