const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const contractCandidatSchema = new Schema({
    lieu_mission: {
        type: String,
        trim: true
    },
    duree_mission: {
        type: String,
        trim: true
    },
    duree_hebdomadaire_mission: {
        type: String,
        trim: true
    },
    candidatJob: {
        type: String,
        trim: true
    },
    cmp_candidat: {
        type: String,
        trim: true
    },
    contract_date: {
        type: String,
        trim: true
    },
    company_contact_name: {
        type: String,
        trim: true
    },
    nr_inreg: {
        type: String,
        trim: true
    },
    serie_id: {
        type: String,
        trim: true
    },
    candidatAddress: {
        type: String,
        trim: true
    },
    company_siret: {
        type: String,
        trim: true
    },
    companyAddress: {
        type: String,
        trim: true
    },
    numeroTFCandidat: {
        type: String,
        trim: true,
    },
    companyVat: {
        type: String,
        trim: true,
    },
    salaireBrut: {
        type: String,
        trim: true,
    },
    salaireNet: {
        type: String,
        trim: true,
    },
    diurnaTotalParJour: {
        type: String,
        trim: true,
    },
    debutMissionDate: {
        type: String,
        trim: true,
    },
    heurePerSemaine: {
        type: String,
        trim: true,
    },
    duree_hebdomadaire: {
        type: String,
        trim: true,
    },
    indemnisationJour: {
        type: String,
        trim: true,
    },
    fin_mision: {
        type: String,
        trim: true,
    },
    candidatId: {
        type: String,
        trim: true,
    },
    candidatName: {
        type: String,
        trim: true,
    }
})

module.exports = mongoose.model("ContractCandidat", contractCandidatSchema, 'contractCandidat');