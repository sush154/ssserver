const mongoose = require('mongoose');
const sequenceGenerator = require('mongoose-sequence-plugin');

var ApprovalSchema = mongoose.Schema({
    submissionId        :   String,
    todaysSteps         :   Number,
    dateOfSubmission    :   Date,
    submittedBy         :   {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    approvalList        :   [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
    image               :   String,
    status              :   String,
    rejectionComment    :   String,
    reviewedBy          :   {type: mongoose.Schema.Types.ObjectId, ref: 'user'}
});

ApprovalSchema.plugin(sequenceGenerator, {
    field	: 	'submissionId',
	startAt	:	'001',
	prefix	:	'S-'
});

module.exports = ApprovalSchema;