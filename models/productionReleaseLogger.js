const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const prodReleaseLoggerSchema = new Schema({
    lastVersion: {
        type: String,
        trim: true,
    }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('ProdReleaseLogger', prodReleaseLoggerSchema, 'prodReleaseLogger');
