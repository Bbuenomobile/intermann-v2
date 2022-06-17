const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activitySectorSchema = new Schema({
    sectorName: {
        type: String,
        required: true,
        trim: true,
    },
    jobs: [{
        jobName: {
            type: String,
            required: true,
            trim: true
        },
        associatedSector: {
            type: String,
            required: true,
            trim: true
        }
    }]
}, { timestamps: true, versionKey: false })

module.exports = mongoose.model('ActivitySector', activitySectorSchema, 'activitySector');
