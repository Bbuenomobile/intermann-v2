const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ClientModel = require('./client');
const LeadModel = require('./lead');

const offerSchema = new Schema({
    company_name: {
        type: String,
        trim: true,
    },
    company_email: {
        type: String,
        trim: true
    },
    metiers: [{
        metier: {
            type: String,
            trim: true,
        },
        salaire_35H: { // will come with euro sign
            type: String,
            trim: true
        },
        panier_repas: { // will come with euro sign
            type: Boolean,
            default: false,
        },
        text_libre: {
            type: String,
            trim: true,
        },
        heure_fait: {
            type: String, // will come with H
            trim:  true,
        },
        tax_heure_fait: {
            type: String, // will come with euaro sign
            trim:  true,
        },
        supplymentry_tax: {
            type: String, // will come with euro sign
            trim:  true,
        },
        total_salaire: {
            type: String, // will come with euro sign
            trim: true,
        },}],
    offer_made_date: { // todays date when Generate Offer from Commercial Center
        type: Date,
    },
    offer_signed: {
        type: Boolean,
        default: false,
    },
    offer_signed_on: {
        type: String,
        trim: true,
    },
    signature: {
        type: String,
        trim: true,
    },
    associated_lead: {
        type: Schema.ObjectId,
        ref: () => LeadModel
    },
    associated_client: {
        type: Schema.ObjectId,
        ref: () => ClientModel
    },
    offer_mode: {
        type: String,
        trim: true,
    },
    offerDocument: {
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
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Offer', offerSchema, 'offer');