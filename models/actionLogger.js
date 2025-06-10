const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require("./user");

const actionLoggerSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: () => User,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    contactedLeads: {
            type: Number,
            default: 0    
    },
    qualifiedLeads: {
            type: Number,
            default: 0    
    },
    leadsAddedToCRM: {
            type: Number,
            default: 0    
    }
}, {timestamps: true, versionKey: false})

module.exports = mongoose.model('ActionLogger', actionLoggerSchema, 'actionLogger');
