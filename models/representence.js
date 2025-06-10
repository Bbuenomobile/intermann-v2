const mongoose = require('mongoose');
const Candidat = require("./candidat");
const Schema = mongoose.Schema;

const representenceSchema = new Schema({
    candidat: {
        type: Schema.ObjectId,
        ref: () => Candidat,
    },
    candidat_name: {
        type: String,
        trim: true
    },
    candidat_phone: {
        type: String,
        trim: true
    },
    candidat_birthday: {
        type: String,
        trim: true
    },
    candidat_birthcity: {
        type: String,
        trim: true
    },
    debut_mission_date: {
        type: String,
        trim: true,
    },
    fin_mission_date: {
        type: String,
        trim: true,
    },
    company_name: {
        type: String,
        trim: true,
    },
    company_address: {
        type: String,
        trim: true,
    },
    signature: {
        type: String,
        trim: true
    },
    signed_on: {
        type: String,
        trim: true
    },
    generated_on: {
        type: String,
        trim: true
    },
    signed_representence_url: {
        type: String,
        trim: true,
    }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Respresentence', representenceSchema, 'representence');
