var mongoose = require('mongoose');
var ApprovalSchema = require('../schema/approval');

var ApprovalModel = mongoose.model('approval', ApprovalSchema);

module.exports = ApprovalModel;