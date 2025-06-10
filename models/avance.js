const mongoose = require('mongoose');
const Candidat = require("./candidat");
const Schema = mongoose.Schema;

const avanceSchema = new Schema({
    candidat: {
        type: Schema.ObjectId,
        ref: () => Candidat,
    },
    candidat_name: {
        type: String,
        trim: true
    },
    amount_avance: {
        type: String,
        trim: true
    },
    period_avance: {
        type: String,
        trim: true
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
    signed_avance_url: {
        type: String,
        trim: true,
    }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('avance', avanceSchema, 'avance');


