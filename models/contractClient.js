const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const contractClientSchema = new Schema({
    numero_contract: {
        type: String,
        trim: true
    },
    initial_client_company: {
        type: String,
        trim: true
    },
    siret: {
        type: String,
        trim: true
    },
    numero_tva: {
        type: String,
        trim: true
    },
    nom_gerant: {
        type: String,
        trim: true
    },
    telephone_gerant: {
        type: String,
        trim: true
    },
    metier_en_roumain: {
        type: String,
        trim: true
    },
    metier_en_francais: {
        type: String,
        trim: true
    },
    debut_date: {
        type: String,
        trim: true
    },
    date_fin_mission: {
        type: String,
        trim: true
    },
    prix_per_heure: {
        type: String,
        trim: true
    },
    salaire_euro: {
        type: String,
        trim: true
    },
    nombre_heure: {
        type: String,
        trim: true
    },
    poste_du_gerant: {
        type: String,
        trim: true
    },
    worker_number_1: {
        type: String,
        trim: true
    },
    worker_name_1: {
        type: String,
        trim: true
    },
    worker_number_2: {
        type: String,
        trim: true
    },
    worker_name_2: {
        type: String,
        trim: true
    },
    worker_number_3: {
        type: String,
        trim: true
    },
    worker_name_3: {
        type: String,
        trim: true
    },
    worker_number_4: {
        type: String,
        trim: true
    },
    worker_name_4: {
        type: String,
        trim: true
    },
    worker_number_5: {
        type: String,
        trim: true
    },
    worker_name_5: {
        type: String,
        trim: true
    },
    worker_number_6: {
        type: String,
        trim: true
    },
    worker_name_6: {
        type: String,
        trim: true
    },
    worker_number_7: {
        type: String,
        trim: true
    },
    worker_name_7: {
        type: String,
        trim: true
    },
    worker_number_8: {
        type: String,
        trim: true
    },
    worker_name_8: {
        type: String,
        trim: true
    },
    worker_number_9: {
        type: String,
        trim: true
    },
    worker_name_9: {
        type: String,
        trim: true
    },
    worker_number_10: {
        type: String,
        trim: true
    },
    worker_name_10: {
        type: String,
        trim: true
    },
    worker_number_11: {
        type: String,
        trim: true
    },
    worker_name_11: {
        type: String,
        trim: true
    },
    worker_number_12: {
        type: String,
        trim: true
    },
    worker_name_12: {
        type: String,
        trim: true
    },
    worker_number_13: {
        type: String,
        trim: true
    },
    worker_name_13: {
        type: String,
        trim: true
    },
    worker_number_14: {
        type: String,
        trim: true
    },
    worker_name_14: {
        type: String,
        trim: true
    },
    worker_number_15: {
        type: String,
        trim: true
    },
    worker_name_15: {
        type: String,
        trim: true
    },
    worker_number_16: {
        type: String,
        trim: true
    },
    worker_name_16: {
        type: String,
        trim: true
    },
    worker_number_17: {
        type: String,
        trim: true
    },
    worker_name_17: {
        type: String,
        trim: true
    },
    worker_number_18: {
        type: String,
        trim: true
    },
    worker_name_18: {
        type: String,
        trim: true
    },
    worker_number_19: {
        type: String,
        trim: true
    },
    worker_name_19: {
        type: String,
        trim: true
    },
    worker_number_20: {
        type: String,
        trim: true
    },
    worker_name_20: {
        type: String,
        trim: true
    },
    clientId: {
        type: String,
        trim: true
    },
    signature: {
        type: String,
        trim: true
    },
    contract_generated_on: {
        type: String,
        trim: true
    },
    contract_signed_on: {
        type: String,
        trim: true
    },
    signed_contract_url: {
        type: String,
        trim: true
    }
})

module.exports = mongoose.model('contractClient', contractClientSchema, 'contractClient');
