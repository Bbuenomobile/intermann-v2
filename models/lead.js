const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Ad = require("./ad");

const leadSchema = new Schema({
        leadCountryMarket: {
            type: String,
            trim: true,
        },
        leadCandidatName: {
            type: String,
            trim: true,
        },
        phoneNumber: {
            type: String,
            trim: true,
            unique: true,
        },
        leadSource: {
            type: String,
            trim: true,
        },
        adName: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
        },
        leadPrice: {
            type: String,
            trim: true,
        },
        leadNotes: {
            type: String,
            trim: true,
        },
        leadPreContacted: {
            type: String,
            enum: ['Not Yet', 'Interested', 'Not Interested'],
            default: 'No'
        },
        leadContactedByAgency: {
            type: String,
            enum: ['Not Yet', 'Not Interested' , 'Yes', 'No' , 'Recall', 'Phone Closed'],
            default: 'Not Yet'
        },
        leadAddedToCRM: {
            type: Boolean,
            default: false,
        },
        leadQualified: {
            type: Number
        },
        agencyNotes: {
            type: String,
            trim: true,
        }
}, { timestamps: true, versionKey: false })

module.exports = mongoose.model('Lead', leadSchema, 'lead');
