const mongoose = require('mongoose');
const client = require("./client");
const Schema = mongoose.Schema;

const adSchema = new Schema({
        adCountryMarket: {
            type: String,
            trim: true,
        },
        adNameFrench: {
            type: String,
            trim: true,
        },
        adNameRomanian: {
            type: String,
            trim: true
        },
        adImportance: {
            type: Number,
        },
        adDescription: {
            type: String,
            trim: true
        },
        adStatus: {
            type: String,
            trim: true,
        },
        clients: [{
            type: Schema.ObjectId,
            ref: () => client
        }],
        leadPriceForAd: {
            type: String,
            trim: true
        }
}, { timestamps: true, versionKey: false })

module.exports = mongoose.model('Ad', adSchema, 'ad');
