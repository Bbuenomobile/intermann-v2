const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const jobSchema = new Schema({
    jobName: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('job', jobSchema, 'job');
