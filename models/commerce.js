// Leads here are For Commercial Center

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require("./user");

const commercialLeadSchema = new Schema({
        companyName: {
            type: String,
            trim: true,
        },
        phoneNumber1: {
            type: String,
            trim: true,
        },
        phoneNumber2: {
            type: String,
            trim: true,
        },
        companyNote: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
        },
        offerSent: {
            type: Boolean,
            default: false
        },
        offer_sent_date: {
            type: Date,
        },
        rappeler: {
            type: Boolean,
            default: false
        },
        companyInterested: {
            type: Boolean,
            default: false
        },
        agencyNote: {
            type: String,
            trim: true,
        },
        clientStatus: {
            type: String,
            enum: ['Non determine', 'Le client negocie', 'Offre Accepte', 'Le client reflechit', 'Le client ne reponds pas', 'Pas interese'],
            default: 'Non determine'
        },
        contactedFirstTimeBy: {
            type: String,
            trim: true,
        },
        contactedSecondTimeBy: {
            type: String,
            trim: true,
        },
        contactedAfterOfferSentBy: {
            type: String,
            trim: true,
        },
        companyResponsable: {
            type: String,
            trim: true,
        },
        cofaceAdded: {
            type: Boolean,
            default: false,
        },
        cofaceURL: {
            type: String,
            trim: true
        },
        leadStatus: {
            type: String,
            trim: true
        }
}, { timestamps: true, versionKey: false })

module.exports = mongoose.model('CommercialLead', commercialLeadSchema, 'commerciallead');
