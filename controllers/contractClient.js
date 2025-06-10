const clientContract = require("../models/contractClient");
const Client = require("../models/client");
const pdf = require('pdf-creator-node');
const fs = require('fs');
const nodemailer = require("nodemailer");
const path = require('path');
const imageSrc = fs.readFileSync('./logo.svg');
const bis = imageSrc.toString("base64");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: 'dj06tvfjt',
    api_key: '122145526342654',
    api_secret: 'PgTTOnNXzbw2mcSVgCob59JBi6A'
});

const mailList = ["contact@intermann.ro", "patrickroggy@intermann.ro", "nikhilsunil90s@gmail.com", "oanasindieintermann@gmail.com", "daianaintermann@gmail.com", "daiana@intermann.ro", "morgan.roggy31@gmail.com"];
// const mailList = ["sabir.pushideas@gmail.com", "nikhilsunil90s@gmail.com"];

function replaceFrenchLetters(str) {
    const replacements = {
        "à": "a",
        "â": "a",
        "ç": "c",
        "é": "e",
        "è": "e",
        "ê": "e",
        "ë": "e",
        "î": "i",
        "ï": "i",
        "ô": "o",
        "ù": "u",
        "û": "u",
        "ü": "u",
        "ÿ": "y"
    };
    return str.replace(/[àâçéèêëîïôùûüÿ]/gi, function (match) {
        return replacements[match.toLowerCase()].toUpperCase() || match.toUpperCase();
    });
}


const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,               // true for 465, false for other ports
    host: "smtp.gmail.com",
    auth: {
        user: 'intermanncrm@gmail.com',
        pass: 'rynxtmznfqnhisez',
    },
    secure: true,
    priority: "high",

});

const dateFormatter = (d) => {
    let _d = d.split("-")
    return _d[1] + "-" + _d[0] + "-" + _d[2];
}

exports.getSignedContract = async (req, res, next) => {
    let { contractId } = req.query;
    let result = await clientContract.find({ _id: contractId }).lean();
    //console.log( "Result - " , result[0]);
    if (result.length > 0) {
        if (result[0]?.signature) {
            clientContractPromise(result[0]).then(success => {
                let file = success.filename.split("\\")[success.filename.split("\\").length - 1];
                return res.status(200).json({
                    status: true,
                    message: 'Contract Fetched Successfully!',
                    filepath: file
                })
            }).catch(err => {
                //console.log(err)
                return res.status(400).json({
                    status: false,
                    message: 'Unable To Fetch Contract! Please Try Again.'
                })
            })
        }
    } else {
        return res.status(400).json({
            status: false,
            message: 'No Signed Contract Found!'
        })
    }
}


async function uploadToCloudinary(locaFilePath) {
    // locaFilePath :
    // path of image which was just uploaded to "uploads" folder

    var mainFolderName = "uploads"
    // filePathOnCloudinary :
    // path of image we want when it is uploded to cloudinary
    var filePathOnCloudinary = mainFolderName + "/" + locaFilePath

    return cloudinary.uploader.upload(filePathOnCloudinary, { "public_id": locaFilePath, "resource_type": "auto" })
        .then((result) => {
            // Image has been successfully uploaded on cloudinary
            // So we dont need local image file anymore
            // Remove file from local uploads folder 
            //   fs.unlinkSync(filePathOnCloudinary);
            ////console.loge.log(result);
            return {
                message: "Success",
                url: result.url,
                public_id: result.public_id,
            };
        }).catch((error) => {
            ////console.loge.log(error);
            // Remove file from local uploads folder 
            //   fs.unlinkSync(filePathOnCloudinary)
            return { message: "Fail", };
        });
}

exports.getSignedContracts = async (req, res, next) => {
    let results = await clientContract.find({ signature: { $exists: true, $ne: null } }).sort({ createdAt: -1 }).exec();
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            total: results.length,
            data: results,
        })
    } else {
        return res.status(400).json({
            status: false,
        })
    }
}

const clientContractPromise = async (data) => {
    const html = fs.readFileSync("utils/client_contract.html", 'utf-8');
    let name = replaceFrenchLetters(data.initial_client_company);
    let contractDocument = {
        html: html,
        data: data,
        path: `./uploads/${name + "-" + data._id}.pdf`
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
        },
        childProcessOptions: {
            env: {
                OPENSSL_CONF: '/dev/null'
            }
        }
    }

    return pdf.create(contractDocument, options);

}

exports.makeClientContract = async (req, res, next) => {
    ////console.log("Making a client contract!");
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
        worker_number_9,
        worker_name_9,
        worker_number_10,
        worker_name_10,
        worker_number_11,
        worker_name_11,
        worker_number_12,
        worker_name_12,
        worker_number_13,
        worker_name_13,
        worker_number_14,
        worker_name_14,
        worker_number_15,
        worker_name_15,
        worker_number_16,
        worker_name_16,
        worker_number_17,
        worker_name_17,
        worker_number_18,
        worker_name_18,
        worker_number_19,
        worker_name_19,
        worker_number_20,
        worker_name_20,
        clientId,
        contractId,
        clientEmail,
        clientAddress
    } = req.body;

    ////console.log(req.body);
    if (contractId) {
        clientContract.findById(contractId).then(data => {
            if (data) {
                ////console.log("data - ", contractId ,data);
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
                    worker_number_9: worker_number_9,
                    worker_name_9: worker_name_9,
                    worker_number_10: worker_number_10,
                    worker_name_10: worker_name_10,
                    worker_number_11: worker_number_11,
                    worker_name_11: worker_name_11,
                    worker_number_12: worker_number_12,
                    worker_name_12: worker_name_12,
                    worker_number_13: worker_number_13,
                    worker_name_13: worker_name_13,
                    worker_number_14: worker_number_14,
                    worker_name_14: worker_name_14,
                    worker_number_15: worker_number_15,
                    worker_name_15: worker_name_15,
                    worker_number_16: worker_number_16,
                    worker_name_16: worker_name_16,
                    worker_number_17: worker_number_17,
                    worker_name_17: worker_name_17,
                    worker_number_18: worker_number_18,
                    worker_name_18: worker_name_18,
                    worker_number_19: worker_number_19,
                    worker_name_19: worker_name_19,
                    worker_number_20: worker_number_20,
                    worker_name_20: worker_name_20,
                    id: contractId,
                }).then(resultData => {
                    ////console.log(resultData);
                    let nombre_salaried_employees = 0;
                    let datetoday = new Date();
                    let dd = String(datetoday.getDate()).padStart(2, '0');
                    let mm = String(datetoday.getMonth() + 1).padStart(2, '0'); //January is 0!
                    let yyyy = datetoday.getFullYear();
                    let d1 = debut_date.indexOf("-") > -1 ? dateFormatter(debut_date) : debut_date;
                    let d2 = date_fin_mission.indexOf("-") > -1 ? dateFormatter(date_fin_mission) : date_fin_mission;
                    for (i = 1; i <= 8; i++) {
                        if (req.body["worker_name_" + i] != "") {
                            nombre_salaried_employees += 1;
                        } else {
                            continue;
                        }
                    }
                    const data = {
                        numero_contract: numero_contract,
                        initial_client_company: initial_client_company,
                        siret: siret,
                        numero_tva: numero_tva,
                        nom_gerant: nom_gerant,
                        telephone_gerant: telephone_gerant,
                        metier_en_roumain: metier_en_roumain,
                        metier_en_francais: metier_en_francais,
                        debut_date: d1,
                        date_fin_mission: d2,
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
                        worker_number_9: worker_number_9,
                        worker_name_9: worker_name_9,
                        worker_number_10: worker_number_10,
                        worker_name_10: worker_name_10,
                        worker_number_11: worker_number_11,
                        worker_name_11: worker_name_11,
                        worker_number_12: worker_number_12,
                        worker_name_12: worker_name_12,
                        worker_number_13: worker_number_13,
                        worker_name_13: worker_name_13,
                        worker_number_14: worker_number_14,
                        worker_name_14: worker_name_14,
                        worker_number_15: worker_number_15,
                        worker_name_15: worker_name_15,
                        worker_number_16: worker_number_16,
                        worker_name_16: worker_name_16,
                        worker_number_17: worker_number_17,
                        worker_name_17: worker_name_17,
                        worker_number_18: worker_number_18,
                        worker_name_18: worker_name_18,
                        worker_number_19: worker_number_19,
                        worker_name_19: worker_name_19,
                        worker_number_20: worker_number_20,
                        worker_name_20: worker_name_20,
                        id: contractId,
                        nombre_salaried_employees: nombre_salaried_employees,
                        contract_generation_date: dd + "-" + mm + "-" + yyyy,
                    }
                    clientContractPromise(data)
                        .then(response => {
                            ////console.log(response);
                            if (!response) {
                                return 0;
                            }
                            ////console.log(response);
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
        let datetoday = new Date();
        let dd = String(datetoday.getDate()).padStart(2, '0');
        let mm = String(datetoday.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = datetoday.getFullYear();
        let contract_generated_on = dd + "-" + mm + "-" + yyyy;
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
            worker_number_9,
            worker_name_9,
            worker_number_10,
            worker_name_10,
            worker_number_11,
            worker_name_11,
            worker_number_12,
            worker_name_12,
            worker_number_13,
            worker_name_13,
            worker_number_14,
            worker_name_14,
            worker_number_15,
            worker_name_15,
            worker_number_16,
            worker_name_16,
            worker_number_17,
            worker_name_17,
            worker_number_18,
            worker_name_18,
            worker_number_19,
            worker_name_19,
            worker_number_20,
            worker_name_20,
            clientId,
            contract_generated_on,
        })

        newContract
            .save()
            .then((resData) => {
                ////console.log(resData);
                Client.findByIdAndUpdate(resData.clientId, {
                    $set: {
                        clientContract: resData._id,
                    }
                }).then((resdata) => {
                    ////console.log(resdata);
                    let nombre_salaried_employees = 0;
                    let datetoday = new Date();
                    let dd = String(datetoday.getDate()).padStart(2, '0');
                    let mm = String(datetoday.getMonth() + 1).padStart(2, '0'); //January is 0!
                    let yyyy = datetoday.getFullYear();
                    let d1 = debut_date.indexOf("-") > -1 ? dateFormatter(debut_date) : debut_date;
                    let d2 = date_fin_mission.indexOf("-") > -1 ? dateFormatter(date_fin_mission) : date_fin_mission;
                    for (i = 1; i <= 8; i++) {
                        if (req.body["worker_name_" + i] != "") {
                            nombre_salaried_employees += 1;
                        } else {
                            continue;
                        }
                    }
                    const data = {
                        numero_contract: numero_contract,
                        initial_client_company: initial_client_company,
                        siret: siret,
                        numero_tva: numero_tva,
                        nom_gerant: nom_gerant,
                        telephone_gerant: telephone_gerant,
                        metier_en_roumain: metier_en_roumain,
                        metier_en_francais: metier_en_francais,
                        debut_date: d1,
                        date_fin_mission: d2,
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
                        worker_number_9: worker_number_9,
                        worker_name_9: worker_name_9,
                        worker_number_10: worker_number_10,
                        worker_name_10: worker_name_10,
                        worker_number_11: worker_number_11,
                        worker_name_11: worker_name_11,
                        worker_number_12: worker_number_12,
                        worker_name_12: worker_name_12,
                        worker_number_13: worker_number_13,
                        worker_name_13: worker_name_13,
                        worker_number_14: worker_number_14,
                        worker_name_14: worker_name_14,
                        worker_number_15: worker_number_15,
                        worker_name_15: worker_name_15,
                        worker_number_16: worker_number_16,
                        worker_name_16: worker_name_16,
                        worker_number_17: worker_number_17,
                        worker_name_17: worker_name_17,
                        worker_number_18: worker_number_18,
                        worker_name_18: worker_name_18,
                        worker_number_19: worker_number_19,
                        worker_name_19: worker_name_19,
                        worker_number_20: worker_number_20,
                        worker_name_20: worker_name_20,
                        nombre_salaried_employees: nombre_salaried_employees,
                        contract_generation_date: dd + "-" + mm + "-" + yyyy,
                    }
                    clientContractPromise(data)
                        .then(response => {
                            if (!response) {
                                return 0;
                            }
                            ////console.log(response);
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
                ////console.log(err)
                return res.status(400)
                    .json({
                        message: "Contract Make Failed!",
                        status: true
                    })
            })
    }
}

exports.addClientContractToCRM = async (req, res, next) => {
    ////console.log("Add Client Contract to CRM");
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
        worker_number_9,
        worker_name_9,
        worker_number_10,
        worker_name_10,
        worker_number_11,
        worker_name_11,
        worker_number_12,
        worker_name_12,
        worker_number_13,
        worker_name_13,
        worker_number_14,
        worker_name_14,
        worker_number_15,
        worker_name_15,
        worker_number_16,
        worker_name_16,
        worker_number_17,
        worker_name_17,
        worker_number_18,
        worker_name_18,
        worker_number_19,
        worker_name_19,
        worker_number_20,
        worker_name_20,
        clientId,
        contractId,
        clientEmail,
        clientAddress
    } = req.body;

    if (contractId && contractId != "") {
        clientContract.findById(contractId).then(data => {
            if (data) {
                ////console.log("data - ", contractId ,data);
                let datetoday = new Date();
                let dd = String(datetoday.getDate()).padStart(2, '0');
                let mm = String(datetoday.getMonth() + 1).padStart(2, '0'); //January is 0!
                let yyyy = datetoday.getFullYear();
                let contract_generated_on = dd + "-" + mm + "-" + yyyy;
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
                    worker_number_9: worker_number_9,
                    worker_name_9: worker_name_9,
                    worker_number_10: worker_number_10,
                    worker_name_10: worker_name_10,
                    worker_number_11: worker_number_11,
                    worker_name_11: worker_name_11,
                    worker_number_12: worker_number_12,
                    worker_name_12: worker_name_12,
                    worker_number_13: worker_number_13,
                    worker_name_13: worker_name_13,
                    worker_number_14: worker_number_14,
                    worker_name_14: worker_name_14,
                    worker_number_15: worker_number_15,
                    worker_name_15: worker_name_15,
                    worker_number_16: worker_number_16,
                    worker_name_16: worker_name_16,
                    worker_number_17: worker_number_17,
                    worker_name_17: worker_name_17,
                    worker_number_18: worker_number_18,
                    worker_name_18: worker_name_18,
                    worker_number_19: worker_number_19,
                    worker_name_19: worker_name_19,
                    worker_number_20: worker_number_20,
                    worker_name_20: worker_name_20,
                    clientId: clientId,
                    contract_generated_on: (data?.contract_generated_on == undefined || data?.contract_generated_on == "") ? contract_generated_on : data?.contract_generated_on,
                }).then(resultData => {
                    ////console.log(resultData);
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
        let datetoday = new Date();
        let dd = String(datetoday.getDate()).padStart(2, '0');
        let mm = String(datetoday.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = datetoday.getFullYear();
        let contract_generated_on = dd + "-" + mm + "-" + yyyy;
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
            worker_number_9,
            worker_name_9,
            worker_number_10,
            worker_name_10,
            worker_number_11,
            worker_name_11,
            worker_number_12,
            worker_name_12,
            worker_number_13,
            worker_name_13,
            worker_number_14,
            worker_name_14,
            worker_number_15,
            worker_name_15,
            worker_number_16,
            worker_name_16,
            worker_number_17,
            worker_name_17,
            worker_number_18,
            worker_name_18,
            worker_number_19,
            worker_name_19,
            worker_number_20,
            worker_name_20,
            clientId,
            contract_generated_on
        })

        newContract
            .save()
            .then((resData) => {
                ////console.log(resData);
                Client.findByIdAndUpdate(resData.clientId, {
                    $set: {
                        clientContract: resData._id,
                    }
                }).then((resdata) => {
                    ////console.log(resdata);
                    return res.status(200)
                        .json({
                            message: "Contract Added To CRM Successfully!",
                            status: true
                        })
                }).catch(err => {
                    ////console.log(err);
                    return res.status(400)
                        .json({
                            message: "Contract Add Failed!",
                            status: true
                        })
                })
            })
            .catch(err => {
                ////console.log(err)
                return res.status(400)
                    .json({
                        message: "Contract Add Failed!",
                        status: true
                    })
            })
    }

}

exports.getContract = async (req, res, next) => {
    //console.log("Getting Client Contract!");
    let { contractId } = req.query;
    clientContract.findById(contractId)

        .then(canResult => {
            let nombre_salaried_employees = 0;
            let datetoday = new Date();
            let dd = String(datetoday.getDate()).padStart(2, '0');
            let mm = String(datetoday.getMonth() + 1).padStart(2, '0'); //January is 0!
            let yyyy = datetoday.getFullYear();
            let d1 = canResult.debut_date.indexOf("-") > -1 ? dateFormatter(canResult.debut_date) : canResult.debut_date;
            let d2 = canResult.date_fin_mission.indexOf("-") > -1 ? dateFormatter(canResult.date_fin_mission) : canResult.date_fin_mission;
            for (i = 1; i <= 8; i++) {
                if (canResult["worker_name_" + i] != "") {
                    nombre_salaried_employees += 1;
                } else {
                    continue;
                }
            }
            const data = {
                numero_contract: canResult.numero_contract,
                initial_client_company: canResult.initial_client_company,
                siret: canResult.siret,
                numero_tva: canResult.numero_tva,
                nom_gerant: canResult.nom_gerant,
                telephone_gerant: canResult.telephone_gerant,
                metier_en_roumain: canResult.metier_en_roumain,
                metier_en_francais: canResult.metier_en_francais,
                debut_date: d1,
                date_fin_mission: d2,
                prix_per_heure: canResult.prix_per_heure,
                salaire_euro: canResult.salaire_euro,
                nombre_heure: canResult.nombre_heure,
                poste_du_gerant: canResult.poste_du_gerant,
                clientAddress: canResult.clientAddress,
                clientEmail: canResult.clientEmail,
                worker_number_1: canResult.worker_number_1,
                worker_name_1: canResult.worker_name_1,
                worker_number_2: canResult.worker_number_2,
                worker_name_2: canResult.worker_name_2,
                worker_number_3: canResult.worker_number_3,
                worker_name_3: canResult.worker_name_3,
                worker_number_4: canResult.worker_number_4,
                worker_name_4: canResult.worker_name_4,
                worker_number_5: canResult.worker_number_5,
                worker_name_5: canResult.worker_name_5,
                worker_number_6: canResult.worker_number_6,
                worker_name_6: canResult.worker_name_6,
                worker_number_7: canResult.worker_number_7,
                worker_name_7: canResult.worker_name_7,
                worker_number_8: canResult.worker_number_8,
                worker_name_8: canResult.worker_name_8,
                worker_number_9: canResult.worker_number_9,
                worker_name_9: canResult.worker_name_9,
                worker_number_10: canResult.worker_number_10,
                worker_name_10: canResult.worker_name_10,
                worker_number_11: canResult.worker_number_11,
                worker_name_11: canResult.worker_name_11,
                worker_number_12: canResult.worker_number_12,
                worker_name_12: canResult.worker_name_12,
                worker_number_13: canResult.worker_number_13,
                worker_name_13: canResult.worker_name_13,
                worker_number_14: canResult.worker_number_14,
                worker_name_14: canResult.worker_name_14,
                worker_number_15: canResult.worker_number_15,
                worker_name_15: canResult.worker_name_15,
                worker_number_16: canResult.worker_number_16,
                worker_name_16: canResult.worker_name_16,
                worker_number_17: canResult.worker_number_17,
                worker_name_17: canResult.worker_name_17,
                worker_number_18: canResult.worker_number_18,
                worker_name_18: canResult.worker_name_18,
                worker_number_19: canResult.worker_number_19,
                worker_name_19: canResult.worker_name_19,
                worker_number_20: canResult.worker_number_20,
                worker_name_20: canResult.worker_name_20,
                id: contractId,
                nombre_salaried_employees: nombre_salaried_employees,
                contract_generation_date: dd + "-" + mm + "-" + yyyy,
            }
            clientContractPromise(data).then(async (reponse) => {
                // ////console.loge.log(reponse, reponse.filename.split("\\")[reponse.filename.split("\\").length - 1]);
                let locaFilePath = reponse.filename.split("\\")[reponse.filename.split("\\").length - 1];
                locaFilePath = locaFilePath.split("/")[locaFilePath.split("/").length - 1];
                let result = await uploadToCloudinary(locaFilePath);
                // ////console.loge.log(result);
                return res.status(200).json({
                    status: true,
                    filePath: result.url,
                    public_id: result.public_id,
                    message: "Contract with Signature Generated!"
                })
            })
                .catch(err => {
                    ////console.loge.log(err);
                    return res.status(400).json({
                        status: false,
                        message: "Generate Failed"
                    })
                })
        })
        .catch(err => {
            ////console.loge.log(err);
            return res.status(400).json({
                status: false,
                message: "Generate Failed"
            })
        })
}

exports.addSignatures = async (req, res, next) => {
    let { contractId, signature, filePath, public_id } = req.body;
    let datetoday = new Date();
    let dd = String(datetoday.getDate()).padStart(2, '0');
    let mm = String(datetoday.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = datetoday.getFullYear();
    clientContract.findByIdAndUpdate(contractId, {
        $set: {
            signature: signature,
            contract_signed_on: dd + "-" + mm + "-" + yyyy
        }
    })
        .then(success => {
            let nombre_salaried_employees = 0;
            let datetoday2 = new Date();
            let dd = String(datetoday2.getDate()).padStart(2, '0');
            let mm = String(datetoday2.getMonth() + 1).padStart(2, '0'); //January is 0!
            let yyyy = datetoday2.getFullYear();
            let d1 = success.debut_date.indexOf("-") > -1 ? dateFormatter(success.debut_date) : success.debut_date;
            let d2 = success.date_fin_mission.indexOf("-") > -1 ? dateFormatter(success.date_fin_mission) : success.date_fin_mission;
            for (i = 1; i <= 8; i++) {
                if (success["worker_name_" + i] != "") {
                    nombre_salaried_employees += 1;
                } else {
                    continue;
                }
            }
            const data = {
                numero_contract: success.numero_contract,
                initial_client_company: success.initial_client_company,
                siret: success.siret,
                numero_tva: success.numero_tva,
                nom_gerant: success.nom_gerant,
                telephone_gerant: success.telephone_gerant,
                metier_en_roumain: success.metier_en_roumain,
                metier_en_francais: success.metier_en_francais,
                debut_date: d1,
                date_fin_mission: d2,
                prix_per_heure: success.prix_per_heure,
                salaire_euro: success.salaire_euro,
                nombre_heure: success.nombre_heure,
                poste_du_gerant: success.poste_du_gerant,
                clientAddress: success.clientAddress,
                clientEmail: success.clientEmail,
                worker_number_1: success.worker_number_1,
                worker_name_1: success.worker_name_1,
                worker_number_2: success.worker_number_2,
                worker_name_2: success.worker_name_2,
                worker_number_3: success.worker_number_3,
                worker_name_3: success.worker_name_3,
                worker_number_4: success.worker_number_4,
                worker_name_4: success.worker_name_4,
                worker_number_5: success.worker_number_5,
                worker_name_5: success.worker_name_5,
                worker_number_6: success.worker_number_6,
                worker_name_6: success.worker_name_6,
                worker_number_7: success.worker_number_7,
                worker_name_7: success.worker_name_7,
                worker_number_8: success.worker_number_8,
                worker_name_8: success.worker_name_8,
                worker_number_9: success.worker_number_9,
                worker_name_9: success.worker_name_9,
                worker_number_10: success.worker_number_10,
                worker_name_10: success.worker_name_10,
                worker_number_11: success.worker_number_11,
                worker_name_11: success.worker_name_11,
                worker_number_12: success.worker_number_12,
                worker_name_12: success.worker_name_12,
                worker_number_13: success.worker_number_13,
                worker_name_13: success.worker_name_13,
                worker_number_14: success.worker_number_14,
                worker_name_14: success.worker_name_14,
                worker_number_15: success.worker_number_15,
                worker_name_15: success.worker_name_15,
                worker_number_16: success.worker_number_16,
                worker_name_16: success.worker_name_16,
                worker_number_17: success.worker_number_17,
                worker_name_17: success.worker_name_17,
                worker_number_18: success.worker_number_18,
                worker_name_18: success.worker_name_18,
                worker_number_19: success.worker_number_19,
                worker_name_19: success.worker_name_19,
                worker_number_20: success.worker_number_20,
                worker_name_20: success.worker_name_20,
                id: contractId,
                signature: signature,
                nombre_salaried_employees: nombre_salaried_employees,
                contract_generation_date: dd + "-" + mm + "-" + yyyy,
            }
            clientContractPromise(data).then(async (reponse) => {
                ////console.loge.log(reponse, reponse.filename.split("\\")[reponse.filename.split("\\").length - 1]);
                let locaFilePath = reponse.filename.split("\\")[reponse.filename.split("\\").length - 1];
                locaFilePath = locaFilePath.split("/")[locaFilePath.split("/").length - 1];
                let result = await uploadToCloudinary(locaFilePath);
                ////console.loge.log(result);
                await clientContract.findByIdAndUpdate(contractId, {
                    $set: {
                        signed_contract_url: result.url
                    }
                })
                const mailData = {
                    from: 'intermanncrm@gmail.com',  // sender address
                    to: mailList,   // list of receivers
                    subject: `${success.initial_client_company} signed his contract.`,
                    text: 'That was easy!',
                    html: `Hello, <br/> Customer: <b>${success.initial_client_company}</b> signed the contract with <b>Intermann</b> in the CRM. <br/>Please download the attachment and store it in the CRM/Drive`,
                    attachments: [{
                        filename: success.initial_client_company + ".pdf",
                        path: result.url,
                    }]
                };

                transporter.sendMail(mailData, (err, info) => {
                    if (err) {
                        ////console.loge.log(err)
                    } else {
                        //////console.loge.log(info)
                        return res.status(200).json({
                            status: 200,
                            message: "Signature Added Successfully"
                        })
                    }
                })
            })
                .catch(err => {
                    ////console.loge.log(err);
                    return res.status(400).json({
                        status: false,
                        message: "Generate Failed"
                    })
                })

        })
        .catch(err => {
            ////console.loge.log(err);
            return res.status(400).json({
                status: 400,
                message: "Signature Add Failed. Please Try Again!"
            })
        })
}

exports.deleteContract = async (req, res, next) => {
    const { clientId, contractId } = req.query;
    await Client.findByIdAndUpdate(clientId, {
        $set: {
            clientContract: null
        }
    }).then(async success => {
        //console.log(success);
        await clientContract.findByIdAndRemove(contractId).then(removed => {
            return res.status(200).json({
                status: true,
                message: "Contract Deleted Successfully!"
            })
        }).catch(err => {
            //console.log(err);
            return res.status(400).json({
                status: false,
                message: "Contract Not Deleted! Please Try Again."
            })
        })
    }).catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: "Contract Not Deleted! Please Try Again."
        })
    })
}

exports.migrateClientContracts = async (req, res) => {
    try {
        // Fetch all contractClient documents
        const contracts = await clientContract.find();

        // Iterate over each contract and update missing worker fields
        for (let contract of contracts) {
            let updateNeeded = false;
            const updateFields = {};

            // Check worker_name and worker_number fields from 1 to 20
            for (let i = 1; i <= 20; i++) {
                const workerNameKey = `worker_name_${i}`;
                const workerNumberKey = `worker_number_${i}`;

                // If the field is missing, add it with an empty string
                if (!contract[workerNameKey]) {
                    updateFields[workerNameKey] = '';
                    updateNeeded = true;
                }
                if (!contract[workerNumberKey]) {
                    updateFields[workerNumberKey] = '';
                    updateNeeded = true;
                }
            }

            // If any updates are needed, apply them
            if (updateNeeded) {
                await clientContract.updateOne({ _id: contract._id }, { $set: updateFields });
                console.log(`Updated contract with ID: ${contract._id}`);
            }
        }
        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Error during migration:', error);
    }
}