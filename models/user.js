const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Lead = require("./lead");
const ActionLogger = require("./actionLogger");
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    username: {
        type: String,
        trim: true,
    },
    emailAddress: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    contactedLeads: {
        count: {
            type: Number,
            default: 0    
        },
        workedOnLeads: [{
            type: Schema.ObjectId,
            ref: () => Lead
        }],
       
    },
    preContactedLeads: {
        count: {
            type: Number,
            default: 0    
        },
        workedOnLeads: [{
            type: Schema.ObjectId,
            ref: () => Lead
        }],
       
    },
    qualifiedLeads: {
        count: {
            type: Number,
            default: 0    
        },
        workedOnLeads: [{
            type: Schema.ObjectId,
            ref: () => Lead
        }],

    },
    leadsAddedToCRM: {
        count: {
            type: Number,
            default: 0    
        },
        workedOnLeads: [{
            type: Schema.ObjectId,
            ref: () => Lead
        }],
    },
    actionLogger: [{
        type: Schema.ObjectId,
        ref: () => ActionLogger
    }]
}, { timestamps: true, versionKey: false });

userSchema.methods.comparePassword = function (candidatePassword, cb) {

    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) return cb(err);
        // ////console.log(isMatch)
        cb(null, isMatch);
    })
}


module.exports = mongoose.model('User', userSchema, 'user');

