const Contract = require("../models/contractCandidat");
const Candidat = require("../models/candidat");
const pdf = require('pdf-creator-node');
const fs = require('fs');
const path = require('path');
const imageSrc = fs.readFileSync('./logo.svg');
const bis = imageSrc.toString("base64");

const contractPromise = async (data) => {
    const html = fs.readFileSync("utils/contract.html" , 'utf-8');
    let contractDocument = {
        html: html,
        data: data,
        path: `./uploads/${data.candidatName + "-" + data.contract_date}.pdf`
    }
    
    const options = {
        format: 'A4',
        orientation: 'portrait',
        border: '10mm',
        remarkable: true,
        footer: {
            height: "5mm",
            contents: {
                first: 'First Page',
                default: '<span style="color: #444; text-align:right;">Page {{page}}</span> of <span>{{pages}}</span>', // fallback value
                last: 'Last Page'
            }
        }
    }
    
    return pdf.create(contractDocument, options);

}   

exports.addContractToCRM = async (req,res,next) => {
//console.log("Adding Contract To CRM");
let {
    lieu_mission,
    duree_mission,
    duree_hebdomadaire_mission,
    candidatJob,
    cmp_candidat,
    contract_date,
    company_contact_name,
    nr_inreg,
    serie_id,
    candidatAddress,
    company_siret,
    companyAddress,
    numeroTFCandidat,
    companyVat,
    salaireBrut,
    salaireNet,
    diurnaTotalParJour,
    debutMissionDate,
    heurePerSemaine,
    duree_hebdomadaire,
    indemnisationJour,
    fin_mision,
    candidatId,
    candidatName,
    contractId,
} = req.body;

if (contractId && contractId != "") {
    Contract.findById(contractId).then(data => {
        if (data) {
            //console.log("data - ", contractId ,data);
            Contract.findByIdAndUpdate(contractId, {
                lieu_mission: lieu_mission,
                duree_mission: duree_mission,
                duree_hebdomadaire_mission: duree_hebdomadaire_mission,
                candidatJob: candidatJob,
                cmp_candidat: cmp_candidat,
                contract_date: contract_date,
                company_contact_name: company_contact_name,
                nr_inreg: nr_inreg,
                serie_id: serie_id,
                candidatAddress: candidatAddress,
                company_siret: company_siret,
                companyAddress: companyAddress,
                numeroTFCandidat: numeroTFCandidat,
                companyVat: companyVat,
                salaireBrut: salaireBrut,
                salaireNet: salaireNet,
                diurnaTotalParJour: diurnaTotalParJour,
                debutMissionDate: debutMissionDate,
                heurePerSemaine: heurePerSemaine,
                duree_hebdomadaire: duree_hebdomadaire,
                indemnisationJour: indemnisationJour,
                fin_mision: fin_mision,
                candidatId: candidatId,
                candidatName: candidatName,
            }).then(resultData => {
                //console.log(resultData);
                return res.status(200)
                        .json({
                            message: "Contract Modified and Added To CRM Successfully!",
                            status: true
                        })
            }).catch(err => {
                return res.status(400)
            .json({
                message: "Contract Add Failed!",
                status: true
            })
            })
        }
    })
} else {
    const newContract = new Contract({
        lieu_mission,
        duree_mission,
        duree_hebdomadaire_mission,
        candidatJob,
        cmp_candidat,
        contract_date,
        company_contact_name,
        nr_inreg,
        serie_id,
        candidatAddress,
        company_siret,
        companyAddress,
        numeroTFCandidat,
        companyVat,
        salaireBrut,
        salaireNet,
        diurnaTotalParJour,
        debutMissionDate,
        heurePerSemaine,
        duree_hebdomadaire,
        indemnisationJour,
        fin_mision,
        candidatId,
        candidatName
    })

    newContract
    .save()
    .then((resData) => {
        //console.log(resData);
        Candidat.findByIdAndUpdate(resData.candidatId, {
            $set: {
                candidatContract: resData._id,
            }
        }).then((resdata) => {
            //console.log(resdata);
            return res.status(200)
                        .json({
                            message: "Contract Added To CRM Successfully!",
                            status: true
                        })
        }).catch(err => {
            //console.log(err);
            return res.status(400)
            .json({
                message: "Contract Add Failed!",
                status: true
            })
        })
    })
    .catch(err => {
        //console.log(err)
        return res.status(400)
            .json({
                message: "Contract Add Failed!",
                status: true
            })
    })        
}


}


exports.makeContract = async (req,res,next) => {
    //console.log("Making a contract!");
    //console.log(req.body);
    let {
        lieu_mission,
        duree_mission,
        duree_hebdomadaire_mission,
        candidatJob,
        cmp_candidat,
        contract_date,
        company_contact_name,
        nr_inreg,
        serie_id,
        candidatAddress,
        company_siret,
        companyAddress,
        numeroTFCandidat,
        companyVat,
        salaireBrut,
        salaireNet,
        diurnaTotalParJour,
        debutMissionDate,
        heurePerSemaine,
        duree_hebdomadaire,
        indemnisationJour,
        fin_mision,
        candidatId,
        candidatName,
        contractId,
    } = req.body;


        if (contractId) {
            Contract.findById(contractId).then(data => {
                if (data) {
                    //console.log("data - ", contractId ,data);
                    Contract.findByIdAndUpdate(contractId, {
                        lieu_mission: lieu_mission,
                        duree_mission: duree_mission,
                        duree_hebdomadaire_mission: duree_hebdomadaire_mission,
                        candidatJob: candidatJob,
                        cmp_candidat: cmp_candidat,
                        contract_date: contract_date,
                        company_contact_name: company_contact_name,
                        nr_inreg: nr_inreg,
                        serie_id: serie_id,
                        candidatAddress: candidatAddress,
                        company_siret: company_siret,
                        companyAddress: companyAddress,
                        numeroTFCandidat: numeroTFCandidat,
                        companyVat: companyVat,
                        salaireBrut: salaireBrut,
                        salaireNet: salaireNet,
                        diurnaTotalParJour: diurnaTotalParJour,
                        debutMissionDate: debutMissionDate,
                        heurePerSemaine: heurePerSemaine,
                        duree_hebdomadaire: duree_hebdomadaire,
                        indemnisationJour: indemnisationJour,
                        fin_mision: fin_mision,
                        candidatId: candidatId,
                        candidatName: candidatName,
                        imageSrc: imageSrc,          
                    }).then(resultData => {
                        //console.log(resultData);
                        const data = {
                            candidatName: candidatName,
                            candidatJob: candidatJob,
                            nr_inreg: nr_inreg,
                            contract_date: contract_date,
                            lieu_mission : lieu_mission,
                            duree_mission: duree_mission,
                            duree_hebdomadaire_mission : duree_hebdomadaire_mission,
                            cmp_candidat : cmp_candidat,
                            company_contact_name: company_contact_name,
                            serie_id: serie_id,
                            candidatAddress: candidatAddress,
                            company_siret, company_siret,
                            companyAddress: companyAddress,
                            numeroTFCandidat: numeroTFCandidat,
                            companyVat: companyVat,
                            salaireBrut: salaireBrut,
                            salaireNet: salaireNet,
                            diurnaTotalParJour: diurnaTotalParJour,
                            debutMissionDate: debutMissionDate,
                            heurePerSemaine: heurePerSemaine,
                            duree_hebdomadaire: duree_hebdomadaire,
                            indemnisationJour: indemnisationJour,
                            fin_mision: fin_mision,
                            logo: bis,
                        }
                        contractPromise(data)
                        .then(response => {
                            //console.log(response);
                            if (!response) {
                                return 0;
                            }
                            //console.log(response);
                            return res.status(200)
                                    .json({
                                        message: "Modified Contract Successfully!",
                                        filePath: response.filename.split("\\")[response.filename.split("\\").length - 1],
                                        status: true
                                    })
                        })
                    }).catch(err => {
                        return res.status(400)
                    .json({
                        message: "Contract Make Failed!",
                        status: true
                    })
                    })
                } 
            })

        } else {
                    const newContract = new Contract({
                        lieu_mission,
                        duree_mission,
                        duree_hebdomadaire_mission,
                        candidatJob,
                        cmp_candidat,
                        contract_date,
                        company_contact_name,
                        nr_inreg,
                        serie_id,
                        candidatAddress,
                        company_siret,
                        companyAddress,
                        numeroTFCandidat,
                        companyVat,
                        salaireBrut,
                        salaireNet,
                        diurnaTotalParJour,
                        debutMissionDate,
                        heurePerSemaine,
                        duree_hebdomadaire,
                        indemnisationJour,
                        fin_mision,
                        candidatId,
                        candidatName
                    })
            
                    newContract
                    .save()
                    .then((resData) => {
                        //console.log(resData);
                        Candidat.findByIdAndUpdate(resData.candidatId, {
                            $set: {
                                candidatContract: resData._id,
                            }
                        }).then((resdata) => {
                            //console.log(resdata);
                            const data = {
                                candidatName: candidatName,
                                candidatJob: candidatJob,
                                nr_inreg: nr_inreg,
                                contract_date: contract_date,
                                lieu_mission : lieu_mission,
                                duree_mission: duree_mission,
                                duree_hebdomadaire_mission : duree_hebdomadaire_mission,
                                cmp_candidat : cmp_candidat,
                                company_contact_name: company_contact_name,
                                serie_id: serie_id,
                                candidatAddress: candidatAddress,
                                company_siret, company_siret,
                                companyAddress: companyAddress,
                                numeroTFCandidat: numeroTFCandidat,
                                companyVat: companyVat,
                                salaireBrut: salaireBrut,
                                salaireNet: salaireNet,
                                diurnaTotalParJour: diurnaTotalParJour,
                                debutMissionDate: debutMissionDate,
                                heurePerSemaine: heurePerSemaine,
                                duree_hebdomadaire: duree_hebdomadaire,
                                indemnisationJour: indemnisationJour,
                                fin_mision: fin_mision,
                                logo: bis,
                            }
                            contractPromise(data)
                            .then(response => {
                                if (!response) {
                                    return 0;
                                }
                                //console.log(response);
                                return res.status(200)
                                        .json({
                                            message: "Modified Contract Successfully!",
                                            filePath: response.filename.split("\\")[response.filename.split("\\").length - 1],
                                            status: true
                                        })
                            })
                        })
                    })
                    .catch(err => {
                        //console.log(err)
                        return res.status(400)
                            .json({
                                message: "Contract Make Failed!",
                                status: true
                            })
                    })        
                }
}


