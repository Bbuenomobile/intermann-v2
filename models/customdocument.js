const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customDocumentSchema = new Schema({
    name: {
        type: String,
        trim: true,
    },
    telephone: {
        type: String,
        trim: true,
    },
    identity: {
        type: String,
        trim: true,
    },
    document_title: {
        type: String,
        trim: true,
    },
    document_content: {
        type: String,
        trim: true,
    },
    document_lieu: {
        type: String,
        trim: true,
    },
    generated_on: {
        type: Date,
        default: Date.now(),
    },
    signature: {
        type: String,
        trim: true,
    },
    signed_on: {
        type: Date,
    },
    signed_document_url: {
        type: String,
        trim: true,
    },
    public_id: {
        type: String,
        trim: true,
    }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('customDocument', customDocumentSchema, 'customDocument');
