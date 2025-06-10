const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const clientContract = require("./contractClient");
const Candidat = require('./candidat');


const clientSchema = new Schema({
    clientCompanyName: {
        type: String,
        trim: true
    },
    clientEmail: {
        type: String,
        trim: true
    },
    clientPhone: {
        type: String,
        trim: true
    },
    clientAddress: {
        type: String,
        trim: true
    },
    clientPhoto: {
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
    clientActivitySector: {
        type: String,
        trim: true
    },
    clientJob: {
        type: String,
        trim: true
    },
    clientReferenceName: {
        type: String,
        trim: true
    },
    clientReferenceNumber: {
        type: String,
        trim: true
    },
    clientReferenceEmail: {
        type: String,
        trim: true
    },
    clientRequiredSkills: {
        type: String,
        trim: true
    },
    numberOfPosts: {
        type: String,
        trim: true
    },
    clientMotivation: {
        type: Number,
        trim: true
    },
    jobStartDate: {
        type: String,
        trim: true,
    },
    jobEndDate: {
        type: String,
        trim: true
    },
    jobTotalBudget: {
        type: Number,
        trim: true
    },
    netSalary: {
        type: Number,
        trim: true
    },
    clientImportance: {
        type: Number,
        trim: true
    },
    clientPermis: {
        type: Boolean,
        trim: true,
    },
    clientLanguages: [
        {
            type: String,
            trim: true
        }
    ],
    enteredBy: {
        type: String,
        trim: true
    },
    jobStatus: {
        type: String,
        trim: true,
        enum: ["To-Do", "In-Progress", "Signed Contract", "Archived"],
        default: "To-Do"
    },
    clientDocuments: [
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
                trim: true,
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
    employeesWorkingUnder: [
        {
            type: Schema.ObjectId,
            ref: () => Candidat,
        }
    ],
    clientArchived: {
        reason: {
            type: String,
            trim: true
        }
    },
    note_cofac: {
        type: Number,
    },
    leadOrigin: {
        type: String,
        trim: true,
    },
    salary_hours: [
    {
        hours: {
        type: String,
        trim: true
    },
    salaryPerHour: {
        type: String,
        trim: true
    }
    }
    ],
    rate_hours: [
        {
        hours: {
            type: String,
            trim: true,
        },
        ratePerHour: {
            type: String,
            trim: true,
        }
    }
    ],
    offerSent: {
        type: Boolean,
        default: false,
    },
    signatureSent: {
        type: Boolean,
        default: false,

    },
    contractSigned: {
        type: Boolean,
        default: false,

    },
    publicityStarted: {
        type: Boolean,
        default: false,

    },
    A1selected: {
        type: Boolean,
        default: false,

    },
    assuranceFaite: {
        type: Boolean,
        default: false,

    },
    agenceDeVoyage: {
        type: Boolean,
        default: false,

    },
    sispiDeclared: {
        type: Boolean,
        default: false,

    },
    clientContract: {
        type: Schema.ObjectId,
        ref: () => clientContract
    },
    clientLinks: [
        {
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
        }
    ]
}, { timestamps: true, versionKey: false });


module.exports = mongoose.model('Client', clientSchema, 'client');

