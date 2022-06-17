const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
        data: String,
        contentType: String,
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
            type: String,
            trim: true,
        }
    ],
    employeesWorkingUnder: [
        {
            type: Schema.Types.ObjectId,
            ref: 'candidat',
        }
    ],
    clientArchived: {
        reason: {
            type: String,
            trim: true
        }
    }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Client', clientSchema, 'client');

