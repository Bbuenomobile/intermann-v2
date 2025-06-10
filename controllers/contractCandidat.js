const Contract = require("../models/contractCandidat");
const nodemailer = require("nodemailer");
const Candidat = require("../models/candidat");
const pdf = require('pdf-creator-node');
const fs = require('fs');
const path = require('path');
const imageSrc = fs.readFileSync('./logo.svg');
const bis = imageSrc.toString("base64");

const cloudinary = require("cloudinary").v2;

cloudinary.config({ 
    cloud_name: 'dj06tvfjt', 
    api_key: '122145526342654', 
    api_secret: 'PgTTOnNXzbw2mcSVgCob59JBi6A' 
});

const mailList = [ "contact@intermann.ro", "patrickroggy@intermann.ro", "nikhilsunil90s@gmail.com", "oanasindieintermann@gmail.com", "daianaintermann@gmail.com", "daiana@intermann.ro", "adriantudor@intermann.ro" ];
// const mailList = ["sabir.pushideas@gmail.com", "nikhilsunil90s@gmail.com"];

// const mailList = ["nikhilsunil90s@gmail.com"];

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
    return str.replace(/[àâçéèêëîïôùûüÿ]/gi, function(match) {
        return replacements[match.toLowerCase()].toUpperCase() || match.toUpperCase();
    });
  }


async function uploadToCloudinary(locaFilePath) {
    // locaFilePath :
    // path of image which was just uploaded to "uploads" folder
  
    var mainFolderName = "uploads"
    // filePathOnCloudinary :
    // path of image we want when it is uploded to cloudinary
    var filePathOnCloudinary = mainFolderName + "/" + locaFilePath
    
    return cloudinary.uploader.upload(filePathOnCloudinary, {"public_id": locaFilePath, "resource_type": "auto"})
    .then((result) => {
      // Image has been successfully uploaded on cloudinary
      // So we dont need local image file anymore
      // Remove file from local uploads folder 
    //   fs.unlinkSync(filePathOnCloudinary);
      ////console.loge.log(result);
      return {
        message: "Success",
        url:result.url,
        public_id: result.public_id,
      };
    }).catch((error) => {
        ////console.loge.log(error);
      // Remove file from local uploads folder 
    //   fs.unlinkSync(filePathOnCloudinary)
      return {message: "Fail",};
    });
}

exports.getSignedContracts = async (req, res, next) => {
    let results = await Contract.find({ signature: { $exists: true, $ne: null } }).sort({ contract_signed_on: -1 }).exec();
    //console.log(results);
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

const contractPromise = async (data) => {
    //console.log("Data - " ,data);
    const html = fs.readFileSync("utils/contract.html" , 'utf-8');
    let name = replaceFrenchLetters(data.candidatName);
    let contractDocument = {
        html: html,
        data: data,
        path: `./uploads/${name + "-" + data.candidatId}.pdf`
    }
    console.log(data);
    const options = {
        format: 'A4',
        orientation: 'portrait',
        border: '10mm',
        remarkable: true,
        footer: {
            height: "5mm",
            contents: {
                first: 'First Page',
                default: '<span style="color: #444; text-align:right; ">Page {{page}}</span> of <span>{{pages}}</span>', // fallback value
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

const dateFormatter = (d) => {
    let _d = d.split("-")
    return _d[1] + "-" + _d[0] + "-" + _d[2];
}

exports.addContractToCRM = async (req,res,next) => {
//////console.loge.log("Adding Contract To CRM");
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
    employee_hosting
} = req.body;

if (contractId && contractId != "") {
    Contract.findById(contractId).then(data => {
        if (data) {
            //////console.loge.log("data - ", contractId ,data);
            let datetoday = new Date();
            let dd = String(datetoday.getDate()).padStart(2, '0');
            let mm = String(datetoday.getMonth() + 1).padStart(2, '0'); //January is 0!
            let yyyy = datetoday.getFullYear();
            let contract_generated_on = dd + "-" + mm + "-" + yyyy;
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
                contract_generated_on: (data?.contract_generated_on == undefined || data?.contract_generated_on == "") ? contract_generated_on : data?.contract_generated_on,
                employee_hosting: employee_hosting
            }).then(resultData => {
                //////console.loge.log(resultData);
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
        candidatName,
        contract_generated_on,
        employee_hosting
    })

    newContract
    .save()
    .then((resData) => {
        //////console.loge.log(resData);
        Candidat.findByIdAndUpdate(resData.candidatId, {
            $set: {
                candidatContract: resData._id,
            }
        }).then((resdata) => {
            //////console.loge.log(resdata);
            return res.status(200)
                        .json({
                            message: "Contract Added To CRM Successfully!",
                            status: true
                        })
        }).catch(err => {
            //////console.loge.log(err);
            return res.status(400)
            .json({
                message: "Contract Add Failed!",
                status: true
            })
        })
    })
    .catch(err => {
        //////console.loge.log(err)
        return res.status(400)
            .json({
                message: "Contract Add Failed!",
                status: true
            })
    })        
}


}

exports.makeContract = async (req,res,next) => {
    //////console.loge.log("Making a contract!");
    //////console.loge.log(req.body);
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
        employee_hosting,
    } = req.body;

        console.log(req.body);
        if (contractId) {
            Contract.findById(contractId).then(data => {
                if (data) {
                    //////console.loge.log("data - ", contractId ,data);
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
                        employee_hosting: employee_hosting,
                    }).then(resultData => {
                        //////console.loge.log(resultData);
                        
                        //console.log(contract_date, debutMissionDate, fin_mision)
                        let d1 = contract_date.indexOf("-") > -1 ? dateFormatter(contract_date) : contract_date;
                        let d2 = debutMissionDate.indexOf("-") > -1 ? dateFormatter(debutMissionDate) : debutMissionDate;
                        let d3 = fin_mision.indexOf("-") > -1 ? dateFormatter(fin_mision) : fin_mision;
                        const data = {
                            candidatName: candidatName,
                            candidatJob: candidatJob,
                            candidatId: candidatId,
                            nr_inreg: nr_inreg,
                            contract_date: d1,
                            lieu_mission : lieu_mission,
                            duree_mission: duree_mission,
                            duree_hebdomadaire_mission : duree_hebdomadaire_mission,
                            cmp_candidat : cmp_candidat,
                            company_contact_name: company_contact_name,
                            serie_id: serie_id,
                            candidatAddress: candidatAddress,
                            company_siret: company_siret,
                            companyAddress: companyAddress,
                            numeroTFCandidat: numeroTFCandidat,
                            companyVat: companyVat,
                            salaireBrut: salaireBrut,
                            salaireNet: salaireNet,
                            diurnaTotalParJour: diurnaTotalParJour,
                            debutMissionDate: d2,
                            heurePerSemaine: heurePerSemaine,
                            duree_hebdomadaire: duree_hebdomadaire,
                            indemnisationJour: indemnisationJour,
                            fin_mision: d3,
                            employee_hosting: employee_hosting
                        }
                        contractPromise(data)
                        .then(response => {
                            //////console.loge.log(response);
                            //console.log(response);
                            if (!response) {
                                return 0;
                            }
                            //////console.loge.log(response);
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
                        candidatName,
                        contract_generated_on,
                        employee_hosting
                    })
            
                    newContract
                    .save()
                    .then((resData) => {
                        //////console.loge.log(resData);
                        Candidat.findByIdAndUpdate(resData.candidatId, {
                            $set: {
                                candidatContract: resData._id,
                            }
                        }).then((resdata) => {
                            //////console.loge.log(resdata);
                            let d1 = contract_date.indexOf("-") > -1 ? dateFormatter(contract_date) : contract_date;
                            let d2 = debutMissionDate.indexOf("-") > -1 ? dateFormatter(debutMissionDate) : debutMissionDate;
                            let d3 = fin_mision.indexOf("-") > -1 ? dateFormatter(fin_mision) : fin_mision;
                            const data = {
                                candidatName: candidatName,
                                candidatJob: candidatJob,
                                candidatId: candidatId,
                                nr_inreg: nr_inreg,
                                contract_date: d1,
                                lieu_mission : lieu_mission,
                                duree_mission: duree_mission,
                                duree_hebdomadaire_mission : duree_hebdomadaire_mission,
                                cmp_candidat : cmp_candidat,
                                company_contact_name: company_contact_name,
                                serie_id: serie_id,
                                candidatAddress: candidatAddress,
                                company_siret: company_siret,
                                companyAddress: companyAddress,
                                numeroTFCandidat: numeroTFCandidat,
                                companyVat: companyVat,
                                salaireBrut: salaireBrut,
                                salaireNet: salaireNet,
                                diurnaTotalParJour: diurnaTotalParJour,
                                debutMissionDate: d2,
                                heurePerSemaine: heurePerSemaine,
                                duree_hebdomadaire: duree_hebdomadaire,
                                indemnisationJour: indemnisationJour,
                                fin_mision: d3,
                                logo: bis,
                                employee_hosting: employee_hosting
                            }
                            contractPromise(data)
                            .then(response => {
                                if (!response) {
                                    return 0;
                                }
                                //////console.loge.log(response);
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
                        //////console.loge.log(err)
                        return res.status(400)
                            .json({
                                message: "Contract Make Failed!",
                                status: true
                            })
                    })        
                }
}

exports.getContract = async (req,res,next) => {
    console.log("Getting Contract!");
    let { contractId } = req.query;
    Contract.findById(contractId)
    .then(canResult => {
        //console.log("Date - ",canResult.contract_date);
        let d1 = canResult.contract_date.indexOf("-") > -1 ? dateFormatter(canResult.contract_date) : canResult.contract_date;
        let d2 = canResult.debutMissionDate.indexOf("-") > -1 ? dateFormatter(canResult.debutMissionDate) : canResult.debutMissionDate;
        let d3 = canResult.fin_mision.indexOf("-") > -1 ? dateFormatter(canResult.fin_mision) : canResult.fin_mision;

        const data = {
            candidatJob: canResult.candidatJob,
            candidatName: canResult.candidatName,
            candidatId: canResult.candidatId,
            nr_inreg: canResult.nr_inreg,
            contract_date: d1,
            lieu_mission : canResult.lieu_mission,
            duree_mission: canResult.duree_mission,
            duree_hebdomadaire_mission : canResult.duree_hebdomadaire_mission,
            cmp_candidat : canResult.cmp_candidat,
            company_contact_name: canResult.company_contact_name,
            serie_id: canResult.serie_id,
            candidatAddress: canResult.candidatAddress,
            company_siret: canResult.company_siret,
            companyAddress: canResult.companyAddress,
            numeroTFCandidat: canResult.numeroTFCandidat,
            companyVat: canResult.companyVat,
            salaireBrut: canResult.salaireBrut,
            salaireNet: canResult.salaireNet,
            diurnaTotalParJour: canResult.diurnaTotalParJour,
            debutMissionDate: d2,
            heurePerSemaine: canResult.heurePerSemaine,
            duree_hebdomadaire: canResult.duree_hebdomadaire,
            indemnisationJour: canResult.indemnisationJour,
            fin_mision: d3,
            employee_hosting: canResult.employee_hosting,
        }
        contractPromise(data).then(async (reponse) => {
            // ////console.loge.log(reponse, reponse.filename.split("\\")[reponse.filename.split("\\").length - 1]);
            let locaFilePath = reponse.filename.split("\\")[reponse.filename.split("\\").length - 1];
            locaFilePath = locaFilePath.split("/")[locaFilePath.split("/").length - 1];
            let result = await uploadToCloudinary(locaFilePath);
            // ////console.loge.log(result);
            return res.status(200).json({
                status: true,
                filePath: result.url,
                public_id: result.public_id,
                message: "Contract Generated For Signatures!"
            })
        })
        .catch(err => {
            console.log(err);
            return res.status(400).json({
                status: false,
                message: "Generate Failed"
            })
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(400).json({
            status: false,
            message: "Generate Failed"
        })
    })
}

exports.getSignedContract = async (req, res, next) => {
    let {contractId} = req.query;
    let result = await Contract.find({ _id :contractId }).lean();
    //console.log( "Result - " , result[0]);
    if (result.length > 0) {
        if (result[0]?.signature) {
            contractPromise(result[0]).then(success => {
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

exports.addSignatures = async (req,res,next) => {
    let { contractId, signature } = req.body;
    // ////console.loge.log(signature);
    let datetoday = new Date();
    let dd = String(datetoday.getDate()).padStart(2, '0');
    let mm = String(datetoday.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = datetoday.getFullYear();
    
    await Contract.findByIdAndUpdate(contractId, { 
        $set: {
            signature: signature,
            contract_signed_on: dd + "-" + mm + "-" + yyyy
        }
    })
    .then(success => {
        let d1 = success.contract_date.indexOf("-") > -1 ? dateFormatter(success.contract_date) : success.contract_date;
        let d2 = success.debutMissionDate.indexOf("-") > -1 ? dateFormatter(success.debutMissionDate) : success.debutMissionDate;
        let d3 = success.fin_mision.indexOf("-") > -1 ? dateFormatter(success.fin_mision) : success.fin_mision;
        const data = {
            candidatName: success.candidatName,
            candidatJob: success.candidatJob,
            candidatId: success.candidatId,
            nr_inreg: success.nr_inreg,
            contract_date: d1,
            lieu_mission : success.lieu_mission,
            duree_mission: success.duree_mission,
            duree_hebdomadaire_mission : success.duree_hebdomadaire_mission,
            cmp_candidat : success.cmp_candidat,
            company_contact_name: success.company_contact_name,
            serie_id: success.serie_id,
            candidatAddress: success.candidatAddress,
            company_siret: success.company_siret,
            companyAddress: success.companyAddress,
            numeroTFCandidat: success.numeroTFCandidat,
            companyVat: success.companyVat,
            salaireBrut: success.salaireBrut,
            salaireNet: success.salaireNet,
            diurnaTotalParJour: success.diurnaTotalParJour,
            debutMissionDate: d2,
            heurePerSemaine: success.heurePerSemaine,
            duree_hebdomadaire: success.duree_hebdomadaire,
            indemnisationJour: success.indemnisationJour,
            fin_mision: d3,
            signature: signature,
            employee_hosting: success.employee_hosting,
        }
        contractPromise(data).then(async (reponse) => {
            ////console.loge.log(reponse, reponse.filename.split("\\")[reponse.filename.split("\\").length - 1]);
            let locaFilePath = reponse.filename.split("\\")[reponse.filename.split("\\").length - 1]; 
            locaFilePath = locaFilePath.split("/")[locaFilePath.split("/").length - 1];
            let result = await uploadToCloudinary(locaFilePath);           
            //console.log(locaFilePath);
            await Contract.findByIdAndUpdate(contractId, {
                $set: {
                    signed_contract_url: result.url
                }
            })
            //console.log(result.url);
            const mailData = {
                from: 'intermanncrm@gmail.com',  // sender address
                to: mailList,   // list of receivers
                subject: `${success.candidatName} signed his contract.`,
                text: 'That was easy!',
                html: `Hello, <br/> <b>${success.candidatName}</b> signed his contract with <b>Intermann</b> in the CRM. <br/>Please download the attachment and store it in the CRM/Drive`,
                attachments: [{
                    filename: success.candidatName + ".pdf",
                    path: result.url,
                }]
            };
            
        transporter.sendMail(mailData, (err, info) => {
            if (err) {
                //console.log(err)
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
            //console.loge.log(err);
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
    const { candidatId, contractId } = req.query;
    await Candidat.findByIdAndUpdate(candidatId, {
        $set: {
            candidatContract: null   
        }
    }).then(async success => {
        //console.log(success);
        await Contract.findByIdAndRemove(contractId).then(removed => {
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