const express = require('express'),
        StepsMiddleware = express(),
        StepsRouter = express.Router(),
        session = require('express-session'),
        cookieParser = require('cookie-parser'),
        config = require('../../config');

var UserModel = require('../../model/user');
var ApprovalModel = require('../../model/approval');
const dateHelper = require('../../util/date.helper');

const ApprovalStatusEnum = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
}

StepsRouter.use(cookieParser());
StepsRouter.use(session({ secret: 'secretkey', cookie: { httpOnly: false,secure:false,expires: new Date(Date.now() + (1*24*60*60*1000))} }));

StepsRouter.use(function(req, res, next) {
    var origin = req.headers.origin;

    if(config.client.connectionUrl.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin' ,origin);
    }

    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if((req.session.cookie._expires > (new Date())) && req.cookies['token']){
        next();
    } else {
        res.cookie("token", "", { expires: new Date() });
        return res.json({data: {status : 401}});
    }/*next();*/
});

/** Get total steps count of all users
 * Get count of total steps of all users from User schema
 */
StepsRouter.get('/getAllStepsCount', function(req, res, next){
    const reduce = (accumulator, currentValue) => accumulator.totalSteps + currentValue;
    UserModel.find({}, function(err, user){
        if(err) return res.json({data: {status: 500}});
        else {
            let count = user.reduce(reduce);
            return res.json({data: {status : 200, count}});
        };
    })
});

/** Get total steps of Current User
 * Get total steps for current user
 */
StepsRouter.get('/getTotalStepsCurrentUser', function(req, res, next) {
    const userId = req.cookies['token'].split('-')[1];

    UserModel.findOne({_id : userId}).select('totalSteps').exec(function(err, totalSteps) {
        if(err) return res.json({data: {status: 500}});
        else return res.json({data: {status : 200, totalSteps}});
    });
});

/** Get Current Leader
 * Get User Details of max total steps
 */
StepsRouter.get('/getCurrentLeader', function(req, res, next) {
    UserModel.findOne({}).sort('-totalSteps').exec(function(err, user){
        if(err) return res.json({data: {status: 500}});
        else return res.json({data: {status : 200, user}});
    });
});

/** Get Current User's steps 
 * Get current steps for logged in user
*/
StepsRouter.get('/getUserCurrentSteps', function(req, res, next) {
    const userId = req.cookies['token'].split('-')[1];

    UserModel.findOne({_id : userId}).select('currentSteps').exec(function(err, currentSteps){
        if(err) return res.json({data: {status: 500}});
        else return res.json({data: {status : 200, currentSteps}});
    });
});

/** Get users daily steps 
 * Get logged in user's daily steps which are marked as approved from Approval Schema
*/
StepsRouter.get('/getUserDailySteps', function(req, res, next){
    const userId = req.cookies['token'].split('-')[1];

    ApprovalModel.find({'submittedBy' : userId, 'status' : ApprovalStatusEnum.APPROVED})
                .select('todaysSteps dateOfSubmission')
                .exec(function(err, dailySteps){
                    if(err) return res.json({data: {status: 500}});
                    else return res.json({data: {status : 200, dailySteps}});
                })
});

/** Get Rankings of User
 * Get List of users from User Schema sorting on total steps highest being first
 */
StepsRouter.get('/getRankings', function(req, res, next){
    UserModel.find({}).sort('-totalSteps').select('name email totalSteps').exec(function(err, user){
        if(err) return res.json({data: {status: 500}});
        else return res.json({data: {status : 200, user}});
    })
});

/** Get list of pending approvals
 * Get list from Approvals Schema with status pending
 */
StepsRouter.get('/getPendingApprovals', function(req, res, next){
    ApprovalModel.find({status : ApprovalStatusEnum.PENDING}).exec(function(err, approval){
        if(err) return res.json({data: {status: 500}});
        else return res.json({data: {status : 200, approval}});
    });
});

/** Get list of rejected approvals
 * Get list from Approvals Schema with status rejected
 */
StepsRouter.get('/getRejectedApprovals', function(req, res, next){
    ApprovalModel.find({status : ApprovalStatusEnum.REJECTED}).exec(function(err, approval){
        if(err) return res.json({data: {status: 500}});
        else return res.json({data: {status : 200, approval}});
    });
});

/** Get list of approved reviews
 * Get list from Approvals Schema with status approved
 */
StepsRouter.get('/getApprovedReviews', function(req, res, next){
    ApprovalModel.find({status : ApprovalStatusEnum.APPROVED}).exec(function(err, approval){
        if(err) return res.json({data: {status: 500}});
        else return res.json({data: {status : 200, approval}});
    });
});

/** Get revie details
 * Get details from approvals schema
 */
StepsRouter.get('/getReviewDetails/:submissionId', function(req, res, next){
    ApprovalModel.findOne({'submissionId': req.params.submissionId}).exec(function(err, review){
        if(err) return res.json({data: {status: 500}});
        else return res.json({data: {status : 200, review}});
    });
});

/** Approve
 * Approve the case submitted
 */
StepsRouter.post('/approve', function(req, res, next){
    const approverUserId = req.cookies['token'].split('-')[1];

    ApprovalModel.update({_id: req.body.submissionId}, {'status': ApprovalStatusEnum.APPROVED, 'reviewedBy': approverUserId})
                .exec(function(err, doc){
                    if(err) return res.json({data: {status: 500}});
                    else {
                        // Update User Model
                        UserModel.findOneAndUpdate({_id: req.body.submittedBy}, { $inc: {'totalSteps' : req.body.todaysSteps}})
                                .exec(function(err, user){
                                    if(err) return res.json({data: {status: 500}});
                                    else return res.json({data: {status : 200}});
                                });
                    }
                });
});

/** Reject
 * Reject the case submitted
 */
StepsRouter.post('/reject', function(req, res, next){
    const rejecterUserId = req.cookies['token'].split('-')[1];

    ApprovalModel.update({_id: req.body.submissionId},
                        {'status': ApprovalStatusEnum.REJECTED, 'reviewedBy': req.body.rejecterUserId, 'rejectionComment': req.body.comment})
                .exec(function(err, doc){
                    if(err) return res.json({data: {status: 500}});
                    else return res.json({data: {status : 200}});
                });
});

/** Submission for approval
 * Submit case for approval in Approval Schema
 */
StepsRouter.post('/submitForApproval', function(req, res, next){
    const userId = req.cookies['token'].split('-')[1];

    var newApproval = new ApprovalModel();
    newApproval.submittedBy = userId;
    newApproval.todaysSteps = req.body.todaysSteps;
    newApproval.dateOfSubmission = dateHelper(req.body.dateOfSubmission);
    UserModel.find({}).exec(function(err, users){
        if(err) return res.json({data: {status: 500}});
        else {
            newApproval.approvalList = users.filter(user => user._id !== userId);
        }
    });
    newApproval.image = req.body.imagePath;
    newApproval.status = ApprovalStatusEnum.PENDING;

    newApproval.save(function(err, doc){
        if(err) return res.json({data: {status: 500}});
        else return res.json({data: {status : 200}});
    });
});


StepsMiddleware.use('/steps', StepsRouter);
module.exports = StepsMiddleware;