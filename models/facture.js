const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const factureSchema = new Schema({
   factureCurrency: {
    type: String,
    trim: true,
    enum: ["Euro", "Lei", "USD"],
    default: "Euro",
   },
   factureNumber: {
    type: String,
   },
   factureCreateDate: {
    type: String,
    trim: true,
   },
   factureDueDate: {
    type: String,
    trim: true,
   },
   factureTo: {
    type: String,
    trim: true,
   },
   factureVAT: {
    type: String,
    trim: true,
   },
   details: [
    {
        description: {
            type: String,
            trim: true,
        },
        quantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            default: 0,
        },
        montant: { // quantity * price //
            type: Number,
            default: 0
        }
    }
   ],
   total_h_t_tva: {
    type: Number,
    default: 0
   },
   factureStatus: {
    type: String,
    enum: ["Paid", "Unpaid"],
    default: "Unpaid"
   }
}, { timestamps: true, versionKey: false })

module.exports = mongoose.model('Facture', factureSchema, 'facture');