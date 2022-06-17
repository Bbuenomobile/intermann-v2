const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 24 Fields
const candidatSchema = new Schema({
    candidatName: {
        type: String,
        required: true,
        trim: true
    },
    candidatEmail: {
        type: String,
    },
    candidatPhone: {
        type: String,
        trim: true
    },
    candidatAddress: {
        type: String,
        required: true,
        trim: true
    },
    candidatActivitySector: {
        type: String,
        trim: true,
    },
    candidatJob: {
        type: String,
        trim: true,
    },
    candidatFBURL: {
        type: String,
        lowercase: true,
        trim: true
    },
    candidatAlternatePhone: {
        type: String,
        trim: true
    },
    candidatSkills: {
        type: String,
        trim: true
    },
    candidatAge: {
        type: Number,
        trim: true
    },
    candidatMotivation: {
        type: Number,
        trim: true
    },
    candidatLanguages: [
        {
            type: String,
            trim: true
        }
    ],
    candidatLicensePermis: {
        type: Boolean,
        default: false,
    },
    candidatConduireEnFrance: {
        type: Boolean,
        default: false,
    },
    candidatStartDate: {
        type: String,
        trim: true,
    },
    candidatEndDate: {
        type: String,
        trim: true,
    },
    candidatYearsExperience: {
        type: Number,
        trim: true
    },
    candidatComingFrom: [{
        type: String,
        trim: true
    }],
    candidatFetes: [{
        type: String,
        trim: true
    }],
    candidatPhoto: {
        data: String,
        contentType: String,
    },
    candidatExperienceDetails: [{
        period: {
            type: String,
            trim: true,
        },
        location: {
            type: String,
            trim: true,
        },
        workDoneSample: {
            type: String,
            trim: true,
        }
    }],
    candidatCurrentWork: [
        {
            workingFor: {
                type: String,
                trim: true,
            },
            workingSince: {
                type: String,
                trim: true,
            },
            salary: {
                type: String,
                trim: true,
            }
        }
    ],
    enteredBy: {
        type: String,
        required: true,
        trim: true
    },
    candidatStatus: {
        type: String,
        required: true,
        trim: true,
        enum: ["To-Do", "Pre-Selected", "In-Progress", "Archived"],
        default: "To-Do"
    },
    candidatArchived: {
        reason: {
            type: String,
            trim: true
        }
    }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Candidat', candidatSchema, 'candidat');
