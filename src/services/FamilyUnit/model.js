const mongoose = require('mongoose');
const {Schema} = mongoose;
const {ChoreSchema} = require('../DefaultChore/model');
const {RewardSchema} = require('../DefaultReward/model');



const KidInfoSchema = new Schema({
    name: {type: String},
    dob: {type: String},
    gender: {type: String, enum: ['male', 'female']},
    kiddieKash: {type: Number},
    assignedChores: [{type: Schema.Types.ObjectId}],
    eligibleRewards: [{type: Schema.Types.ObjectId}],
    rewardsRedemptions: [{
        id: Schema.Types.ObjectId,
        timeStamp: Number,
        reward: Schema.Types.ObjectId
    }],
    doneChores: [{
        id: Schema.Types.ObjectId,
        timeStamp: Number,
        chore: Schema.Types.ObjectId,
        status: {type: String, enum: ['approved', 'unapproved', 'denied']}
    }],
    delinquentChoreInstances: [
        {
            id: Schema.Types.ObjectId,
            timeStamp: Number,
            chore: Schema.Types.ObjectId
        }
    ],
    allowanceAmount: {type: Number},
    kreditInformation: {
        savingsRequired: {type: Number},
        kiddieKashBalance: {type: Number},
        rewardsRedemptions: { value: Number, denominator: Number },
        choreHistory: { value: Number, denominator: Number },
        avgChoreAge: { value: Number, denominator: Number },
        totalChores: { value: Number, denominator: Number },
        rewardsRequests: { value: Number, denominator: Number },
        punishments: { type: Schema.Types.Mixed },
    }

});

const FamilyUnitSchema = new Schema({
    adminsList: [{type: 'String'}],
    kidsList: [KidInfoSchema],
    existingChores: [ChoreSchema],
    choreExceptions: [Schema.Types.Mixed],
    existingRewards: [RewardSchema],
    lastProcessedTime: Number
});

module.exports = function(db){
    return db.model('FamilyUnit', FamilyUnitSchema);
};