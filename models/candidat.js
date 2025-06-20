const mongoose = require('mongoose');
const client = require('./client');
const contractCandidat = require('./contractCandidat');
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
        documentName: {
            type: String,
            trim: true,
        },
        originalName: {
            type: String,
            trim: true
        },
        url: {
            type: String,
            trim: true,
        },
        file_public_id: {
            type: String,
            trim: true
        }

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
        trim: true
    },
    candidatStatus: {
        type: String,
        trim: true,
        default: "New"
    },
    candidatPreSelectedFor: [
        {
            clientId: {
                type: Schema.ObjectId,
                ref: () => client,
            },
            reasonForPreSelection: {
                type: String,
                trim: true
            }
        }
    ],
    candidatDocuments: [
        {
            documentName: {
                type: String,
                trim: true,
            },
            originalName: {
                type: String,
                trim: true
            },
            folderName: {
                type: String,
                trim: true
            },
            url: {
                type: String,
                trim: true,
            },
            file_public_id: {
                type: String,
                trim: true,
            }
        }
    ],
    candidatLinks: [{
        link: {
            type: String,
            trim: true
        },
        folder: {
            type: String,
            trim: true
        },
        displayName: {
            type: String,
            trim: true
        }
    }],
    candidatArchived: {
        reason: {
            type: String,
            trim: true
        }
    },
    candidatContract: {
        type: Schema.ObjectId,
        ref: () => contractCandidat
    },
    iban_euro: {
        type: String,
        trim: true
    },
    bankName_euro: {
        type: String,
        trim: true
    },
    iban_ron_lei: {
        type: String,
        trim: true
    },
    bankName_lei: {
        type: String,
        trim: true
    },
    leadNotes: {
        type: String,
        trim: true,
    },
    agencyNotes: {
        type: String,
        trim: true
    },
    transferredToRIS: {
        type: Boolean,
        default: false
    },
    reasonByRisForNotSelecting: {
        type: String,
        trim: true
    },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Candidat', candidatSchema, 'candidat');
