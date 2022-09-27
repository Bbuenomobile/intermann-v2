const clientContract = require("../models/contractClient");
const Client = require("../models/client");
const pdf = require('pdf-creator-node');
const fs = require('fs');
const path = require('path');
const imageSrc = fs.readFileSync('./logo.svg');
const bis = imageSrc.toString("base64");


const clientContractPromise = async (data) => {
    const html = fs.readFileSync("utils/client_contract.html" , 'utf-8');
    let contractDocument = {
        html: html,
        data: data,
        path: `./uploads/${data.initial_client_company + "-" + data.debut_date}.pdf`
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

exports.makeClientContract = async (req,res,next) => {
    //console.log("Making a client contract!");
    let {
        numero_contract,
        initial_client_company,
        siret,
        numero_tva,
        nom_gerant,
        telephone_gerant,
        metier_en_roumain,
        metier_en_francais,
        debut_date,
        date_fin_mission,
        prix_per_heure,
        salaire_euro,
        nombre_heure,
        poste_du_gerant,
        worker_number_1,
        worker_name_1,
        worker_number_2,
        worker_name_2,
        worker_number_3,
        worker_name_3,
        worker_number_4,
        worker_name_4,
        worker_number_5,
        worker_name_5,
        worker_number_6,
        worker_name_6,
        worker_number_7,
        worker_name_7,
        worker_number_8,
        worker_name_8,
        clientId,
        contractId,
        clientEmail,
        clientAddress
    } = req.body;

        //console.log(req.body);
        if (contractId) {
            clientContract.findById(contractId).then(data => {
                if (data) {
                    //console.log("data - ", contractId ,data);
                    clientContract.findByIdAndUpdate(contractId, {
                        numero_contract: numero_contract,
                        initial_client_company: initial_client_company,
                        siret: siret,
                        numero_tva: numero_tva,
                        nom_gerant: nom_gerant,
                        telephone_gerant: telephone_gerant,
                        metier_en_roumain: metier_en_roumain,
                        metier_en_francais: metier_en_francais,
                        debut_date: debut_date,
                        date_fin_mission: date_fin_mission,
                        prix_per_heure: prix_per_heure,
                        salaire_euro: salaire_euro,
                        nombre_heure: nombre_heure,
                        poste_du_gerant: poste_du_gerant,
                        worker_number_1: worker_number_1,
                        worker_name_1: worker_name_1,
                        worker_number_2: worker_number_2,
                        worker_name_2: worker_name_2,
                        worker_number_3: worker_number_3,
                        worker_name_3: worker_name_3,
                        worker_number_4: worker_number_4,
                        worker_name_4: worker_name_4,
                        worker_number_5: worker_number_5,
                        worker_name_5: worker_name_5,
                        worker_number_6: worker_number_6,
                        worker_name_6: worker_name_6,
                        worker_number_7: worker_number_7,
                        worker_name_7: worker_name_7,
                        worker_number_8: worker_number_8,
                        worker_name_8: worker_name_8,
                        clientId: clientId,
                    }).then(resultData => {
                        //console.log(resultData);
                        const data = {
                            numero_contract: numero_contract,
                            initial_client_company: initial_client_company,
                            siret: siret,
                            numero_tva: numero_tva,
                            nom_gerant: nom_gerant,
                            telephone_gerant: telephone_gerant,
                            metier_en_roumain: metier_en_roumain,
                            metier_en_francais: metier_en_francais,
                            debut_date: debut_date,
                            date_fin_mission: date_fin_mission,
                            prix_per_heure: prix_per_heure,
                            salaire_euro: salaire_euro,
                            nombre_heure: nombre_heure,
                            poste_du_gerant: poste_du_gerant,
                            clientAddress: clientAddress,
                            clientEmail: clientEmail,
                            worker_number_1: worker_number_1,
                            worker_name_1: worker_name_1,
                            worker_number_2: worker_number_2,
                            worker_name_2: worker_name_2,
                            worker_number_3: worker_number_3,
                            worker_name_3: worker_name_3,
                            worker_number_4: worker_number_4,
                            worker_name_4: worker_name_4,
                            worker_number_5: worker_number_5,
                            worker_name_5: worker_name_5,
                            worker_number_6: worker_number_6,
                            worker_name_6: worker_name_6,
                            worker_number_7: worker_number_7,
                            worker_name_7: worker_name_7,
                            worker_number_8: worker_number_8,
                            worker_name_8: worker_name_8,
                        }
                        clientContractPromise(data)
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
                    const newContract = new clientContract({
                        numero_contract,
                        initial_client_company,
                        siret,
                        numero_tva,
                        nom_gerant,
                        telephone_gerant,
                        metier_en_roumain,
                        metier_en_francais,
                        debut_date,
                        date_fin_mission,
                        prix_per_heure,
                        salaire_euro,
                        nombre_heure,
                        poste_du_gerant,
                        worker_number_1,
                        worker_name_1,
                        worker_number_2,
                        worker_name_2,
                        worker_number_3,
                        worker_name_3,
                        worker_number_4,
                        worker_name_4,
                        worker_number_5,
                        worker_name_5,
                        worker_number_6,
                        worker_name_6,
                        worker_number_7,
                        worker_name_7,
                        worker_number_8,
                        worker_name_8,
                        clientId,
                    })
            
                    newContract
                    .save()
                    .then((resData) => {
                        //console.log(resData);
                        Client.findByIdAndUpdate(resData.clientId, {
                            $set: {
                                clientContract: resData._id,
                            }
                        }).then((resdata) => {
                            //console.log(resdata);
                            const data = {
                                numero_contract: numero_contract,
                                initial_client_company: initial_client_company,
                                siret: siret,
                                numero_tva: numero_tva,
                                nom_gerant: nom_gerant,
                                telephone_gerant: telephone_gerant,
                                metier_en_roumain: metier_en_roumain,
                                metier_en_francais: metier_en_francais,
                                debut_date: debut_date,
                                date_fin_mission: date_fin_mission,
                                prix_per_heure: prix_per_heure,
                                salaire_euro: salaire_euro,
                                nombre_heure: nombre_heure,
                                poste_du_gerant: poste_du_gerant,
                                clientEmail: clientEmail,
                                clientAddress: clientAddress,
                                worker_number_1: worker_number_1,
                                worker_name_1: worker_name_1,
                                worker_number_2: worker_number_2,
                                worker_name_2: worker_name_2,
                                worker_number_3: worker_number_3,
                                worker_name_3: worker_name_3,
                                worker_number_4: worker_number_4,
                                worker_name_4: worker_name_4,
                                worker_number_5: worker_number_5,
                                worker_name_5: worker_name_5,
                                worker_number_6: worker_number_6,
                                worker_name_6: worker_name_6,
                                worker_number_7: worker_number_7,
                                worker_name_7: worker_name_7,
                                worker_number_8: worker_number_8,
                                worker_name_8: worker_name_8,
                            }
                            clientContractPromise(data)
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

exports.addClientContractToCRM = async (req,res,next) => {
     //console.log("Add Client Contract to CRM");
     let {
        numero_contract,
        initial_client_company,
        siret,
        numero_tva,
        nom_gerant,
        telephone_gerant,
        metier_en_roumain,
        metier_en_francais,
        debut_date,
        date_fin_mission,
        prix_per_heure,
        salaire_euro,
        nombre_heure,
        poste_du_gerant,
        worker_number_1,
        worker_name_1,
        worker_number_2,
        worker_name_2,
        worker_number_3,
        worker_name_3,
        worker_number_4,
        worker_name_4,
        worker_number_5,
        worker_name_5,
        worker_number_6,
        worker_name_6,
        worker_number_7,
        worker_name_7,
        worker_number_8,
        worker_name_8,
        clientId,
        contractId,
        clientEmail,
        clientAddress
     } = req.body;

     if (contractId && contractId != "") {
        clientContract.findById(contractId).then(data => {
            if (data) {
                //console.log("data - ", contractId ,data);
                clientContract.findByIdAndUpdate(contractId, {
                    numero_contract: numero_contract,
                    initial_client_company: initial_client_company,
                    siret: siret,
                    numero_tva: numero_tva,
                    nom_gerant: nom_gerant,
                    telephone_gerant: telephone_gerant,
                    metier_en_roumain: metier_en_roumain,
                    metier_en_francais: metier_en_francais,
                    debut_date: debut_date,
                    date_fin_mission: date_fin_mission,
                    prix_per_heure: prix_per_heure,
                    salaire_euro: salaire_euro,
                    nombre_heure: nombre_heure,
                    poste_du_gerant: poste_du_gerant,
                    worker_number_1: worker_number_1,
                    worker_name_1: worker_name_1,
                    worker_number_2: worker_number_2,
                    worker_name_2: worker_name_2,
                    worker_number_3: worker_number_3,
                    worker_name_3: worker_name_3,
                    worker_number_4: worker_number_4,
                    worker_name_4: worker_name_4,
                    worker_number_5: worker_number_5,
                    worker_name_5: worker_name_5,
                    worker_number_6: worker_number_6,
                    worker_name_6: worker_name_6,
                    worker_number_7: worker_number_7,
                    worker_name_7: worker_name_7,
                    worker_number_8: worker_number_8,
                    worker_name_8: worker_name_8,
                    clientId: clientId,
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
        const newContract = new clientContract({
            numero_contract,
            initial_client_company,
            siret,
            numero_tva,
            nom_gerant,
            telephone_gerant,
            metier_en_roumain,
            metier_en_francais,
            debut_date,
            date_fin_mission,
            prix_per_heure,
            salaire_euro,
            nombre_heure,
            poste_du_gerant,
            worker_number_1,
            worker_name_1,
            worker_number_2,
            worker_name_2,
            worker_number_3,
            worker_name_3,
            worker_number_4,
            worker_name_4,
            worker_number_5,
            worker_name_5,
            worker_number_6,
            worker_name_6,
            worker_number_7,
            worker_name_7,
            worker_number_8,
            worker_name_8,
            clientId,
        })
    
        newContract
        .save()
        .then((resData) => {
            //console.log(resData);
            Client.findByIdAndUpdate(resData.clientId, {
                $set: {
                    clientContract: resData._id,
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