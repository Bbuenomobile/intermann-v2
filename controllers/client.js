const Client = require("../models/client");
const clientContract = require("../models/contractClient");
const nodemailer = require("nodemailer");
const Candidat = require("../models/candidat");
const https = require("https");
const axios = require('axios');
const fs = require('fs');
const cloudinary = require("cloudinary").v2;

cloudinary.config({ 
    cloud_name: 'dj06tvfjt', 
    api_key: '122145526342654', 
    api_secret: 'PgTTOnNXzbw2mcSVgCob59JBi6A' 
});

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
      console.log(result);
      return {
        message: "Success",
        url:result.url,
        public_id: result.public_id,
      };
    }).catch((error) => {
        console.log(error);
      // Remove file from local uploads folder 
    //   fs.unlinkSync(filePathOnCloudinary)
      return {message: "Fail",};
    });
}

const notifyWebhook = async (url, body) => {

    const res = await axios
        .post(url, body, {
            Accept: "application/json",
            "Content-Type": "application/json"
        })
}
// const mailList = [
//     "contact@intermann.ro",
//     "patrickshemtov@intermann.ro",
//     "patrick_roggy@yahoo.fr",
//     "tdradrian@yahoo.com",
//     "carmenistrate@intermann.ro",
//     "adriantudor@intermann.ro",
//     "patrickroggy@intermann.ro",
//     "jeremyroggy@intermann.ro"
// ]

const mailList = [
    "contact@intermann.ro",
]

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

exports.uploadClientDocuments = async (req, res, next) => {
    //console.log("*******************************");
    console.log(req.file, req.body)
    const { clientId, folderName } = req.body;

    if (req.file) {
        let locaFilePath = req.file.filename;
        var result = await uploadToCloudinary(locaFilePath);
        console.log(result.url, typeof(result.url));
        await Client.findByIdAndUpdate(clientId, {
            $push: {
                clientDocuments: {
                    documentName: req.file.filename,
                    originalName: req.file.originalname,
                    folderName: folderName,
                    url: result.url,
                    file_public_id: result.public_id
                }
            }
        })
            .then(uploadRes => {
                return res.status(200).json({
                    status: true,
                    fileName: req.file.originalname,
                    url: result.url,
                    file_public_id: result.public_id,
                    message: 'File Uploaded Successfully!'
                })
            })
            .catch(err => {
                console.log(err)
                return res.status(400).json({
                    status: false,
                    message: 'Upload Failed!'
                })
            })
    }
}

exports.renameClientDocument = async (req, res, next) => {
    const { documentId, newName, clientId } = req.query
    //console.log(documentId, newName, clientId);
    Client.findById(clientId)
        .then(result => {
            //console.log(result)
            // var filePath = "uploads/" + documentName
            // fs.unlinkSync(filePath)
            let newDocs = result.clientDocuments.map((doc) => {
                if (doc._id == documentId) {
                    doc["originalName"] = newName
                    return doc;
                } else {
                    return doc;
                }
            })
            //console.log(newDocs);
            Client.findByIdAndUpdate(clientId, {
                $set: {clientDocuments : newDocs }
            })
            .then(success => {
                //console.log(success)
                return res.status(200).json({
                    status: true,
                    doc: newName,
                    message: 'Document Renamed Successfully!'
                })
            })
            .catch(err => {
                //console.log(err)
                return res.status(400).json({
                    status: false,
                    message: 'Document Rename Failed!'
                })    
            })
            
        })
        .catch(err => {
            //console.log(err)
            return res.status(400).json({
                status: false,
                message: 'Document Rename Failed!'
            })
        })
}

exports.deleteClientDocument = async (req, res, next) => {
    const { documentId, documentName, clientId } = req.query
    console.log(documentId, documentName, clientId);
    cloudinary.uploader.destroy(documentName,  { invalidate: true, resource_type: "raw" }, (resul) => {
        console.log(resul);

    });
    Client.findByIdAndUpdate(clientId, {
        $pull: {
            clientDocuments: { _id: documentId }
        }
    })
        .then(result => {
            //console.log(result)
            var filePath = "uploads/" + documentName
            fs.unlinkSync(filePath);
            return res.status(200).json({
                status: true,
                doc: documentName,
                message: 'Document Deleted Successfully!'
            })
        })
        .catch(err => {
            //console.log(err)
            return res.status(400).json({
                status: false,
                message: 'Document Delete Failed!'
            })
        })
}

exports.switchAttributes = async (req,res,next) => {
    const {clientId, attribute, value} = req.query;
    let updateQuery = {  };
    updateQuery[attribute] = value;
    //console.log(updateQuery);
    await Client.findByIdAndUpdate(clientId, updateQuery).then(response => {
        //console.log(response)
        return res.status(200).json({
            status: true,
            message: 'Switched Attribute - '+ attribute 
        })
    })
    .catch(err => {
        //console.log(err)
        return res.status(400).json({
            status: false,
            message: 'Cannot Switch Attribute - '+ attribute 
        })
    })
}

exports.getClientsByPhoneNumber = async (req,res,next) => {
    const { phoneNumber } = req.query
    //console.log(phoneNumber);
    let results = await Client.find({ clientPhone: "+"+phoneNumber.trim() }).exec()
    if(!results){
        return res.status(400).json({
            status: false,
            data: []
        })
    } else {
        //console.log(results);
        return res.status(200).json({
            status: true,
            data: results
        })
    }
} 

exports.getClientDetailsById = async (req,res,next) => {
    const {clientId} = req.query
    let result = await Client.find({ _id: clientId }).populate("employeesWorkingUnder").populate("clientContract").exec();
    if (result) {
        return res.status(200).json({
            status: true,
            data: result
        })
    } else {
        return res.status(400).json({
            status: false,
            data: "No Client Found!"
        })
    }
}

exports.getClientById = async (req,res,next) => {
    const {clientId} = req.query
    let result = await Client.find({ _id: clientId }).populate("employeesWorkingUnder").populate("clientContract").exec();
    if (result) {
        return res.status(200).json({
            status: true,
            data: result
        })
    } else {
        return res.status(400).json({
            status: false,
            data: "No Client Found!"
        })
    }
}

exports.filterClientsByAttributes = async (req,res,next) => {
    const {filters, status} = req.query
    let filtersArr = filters.split(",");
    let query = {};
    filtersArr.map(filter => {
        return query[filter] = true
    })
    query['jobStatus'] = status;
    let results = await Client.find(query)
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.filterClientsByMissingEmailorPhone = async (req,res,next) => {
    const {field, status} = req.query;
    if (field ==  'phone') {
        let results = await Client.find({ clientPhone: "", jobStatus: status })
        if (results.length > 0) {
            return res.status(200).json({
                status: true,
                data: results
            })
        } else {
            return res.status(400).json({
                status: false,
                data: []
            })
        }
    } else if (field == 'email') {
        //console.log(field)
        let results = await Client.find({ clientEmail: "", jobStatus: status })
        if (results.length > 0) {
            return res.status(200).json({
                status: true,
                data: results
            })
        } else {
            return res.status(400).json({
                status: false,
                data: []
            })
        }
    }
}

exports.filterClients = async (req,res,next) => {
    let params = req.query;
    let query = {};
    Object.keys(params).map((k) => {
        query[k]=params[k];
    })
    let results = await Client.find(query).populate("employeesWorkingUnder").populate("clientContract").exec()
    if (results.length > 0) {
        //console.log(results);
        return res.status(200).json({
            total: results.length,
            data: results
        })
    } else {
        return res.status(200).json({
            total: 0,
            data: []
        })
    }
}


exports.fetchClientsRecommendations = async (req, res, next) => {
    const { candidatSector } = req.query

    let results = await Client.find({ clientActivitySector: candidatSector }).exec()
    if (results) {
        //console.log(results)
        return res.status(200).json({
            status: true,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.sendCountsToEmail = async (req, res, next) => {

    let ts = Date.now();
    let date_ob = new Date();
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();

    const toDoCandidatCount = await Candidat.find({
        candidatStatus: "To-Do"
    })
    const inProgressCandidatCount = await Candidat.find({
        candidatStatus: "In-Progress"
    })
    const preSelectedCandidatCount = await Candidat.find({
        candidatStatus: "Pre-Selected"
    })
    const archivedCandidatCount = await Candidat.find({
        candidatStatus: "Archived"
    })

    const toDoClientCount = await Client.find({
        jobStatus: "To-Do"
    })
    const inProgressClientCount = await Client.find({
        jobStatus: "In-Progress"
    })
    const archivedClientCount = await Client.find({
        jobStatus: "Archived"
    })
    const signedClientCount = await Client.find({
        jobStatus: "Signed Contract"
    })
    // //console.log(inProgressClientCount)
    let data = {
        date: date + "-" + month + "-" + year,
        totalCandidatCount: toDoCandidatCount.length + inProgressCandidatCount.length + preSelectedCandidatCount.length,
        inProgressCandidatCount: inProgressCandidatCount.length,
        totalClientCount: toDoClientCount.length + inProgressClientCount.length + signedClientCount.length,
        inProgressClientCount: inProgressClientCount.length,
        url: "https://intermann.herokuapp.com/"
    }

    notifyWebhook("https://connect.pabbly.com/workflow/sendwebhookdata/IjQwODAyOSI_3D", data)

    return res.status(200).json(data)
}

exports.getCandidatsCounts = async (req, res, next) => {
    const toDoCount = await Candidat.find({
        candidatStatus: "To-Do"
    })
    const inProgressCount = await Candidat.find({
        candidatStatus: "In-Progress"
    })
    const preSelectedCount = await Candidat.find({
        candidatStatus: "Pre-Selected"
    })
    const archivedCount = await Candidat.find({
        candidatStatus: "Archived"
    })

    return res
        .status(200)
        .json({
            message: "All Candidats Found!",
            toDoCount: toDoCount.length,
            inProgressCount: inProgressCount.length,
            preSelectedCount: preSelectedCount.length,
            archivedCount: archivedCount.length
        })
}

exports.getClientsCounts = async (req, res, next) => {
    const toDoCount = await Client.find({
        jobStatus: "To-Do"
    })
    const inProgressCount = await Client.find({
        jobStatus: "In-Progress"
    })
    const archivedCount = await Client.find({
        jobStatus: "Archived"
    })
    const signedCount = await Client.find({
        jobStatus: "Signed Contract"
    })


    return res.status(200).json({
        message: "All Counts Found!",
        toDoCount: toDoCount.length,
        inProgressCount: inProgressCount.length,
        archivedCount: archivedCount.length,
        signedCount: signedCount.length,
    })
}

exports.getClients = async (req, res, next) => {
    let results = await Client.find({})
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.clientNameAndJobCheck = async (req, res, next) => {
    const { clientName, jobName } = req.query;
    await Client.findOne({ clientCompanyName: clientName, clientJob: jobName })
        .then((data) => {
            if (data) {
                return res.status(200).json({
                    status: true,
                    message: "Client Name & Job Matched!"
                })
            } else {
                return res.status(200).json({
                    status: false,
                    message: "Client Name & Job Not Matched!"
                })
            }
        })
        .catch(err => {
            return res.status(400).json({
                status: false,
                message: "Cannot Match Name & Job!"
            })
        })
}

exports.addClient = async (req, res, next) => {
    //console.log(req.body, 'adding client information!');
    let {
        clientCompanyName,
        clientEmail,
        clientPhone,
        clientAddress,
        clientActivitySector,
        clientJob,
        clientReferenceName,
        clientReferenceNumber,
        clientRequiredSkills,
        numberOfPosts,
        clientMotivation,
        jobStartDate,
        jobEndDate,
        jobTotalBudget,
        netSalary,
        clientImportance,
        enteredBy,
        jobStatus,
        note_cofac,
        leadOrigin,
        salary_hours,
        rate_hours,
        offerSent,
        signatureSent,
        contractSigned,
        publicityStarted,
        A1selected,
        assuranceFaite,
        agenceDeVoyage,
        sispiDeclared,
    } = req.body
    if (clientEmail == "" || clientPhone == "") {
        //console.log("No Email or Phone");
        const mailData = {
            from: 'intermanncrm@gmail.com',  // sender address
            to: mailList,   // list of receivers
            subject: 'Client/Lead Registered without complete information.',
            text: 'That was easy!',
            html: `<b>Hey there!</b><br/><br/>A Client/Lead has been resgistered for Company:<b> ${clientCompanyName}</b>, which contains <b> No Email or Phone Address </b>.<br/>Please complete the required information.<br/><br/> Thank You!<br/><b>Intermann CRM</b>`
        };
        transporter.sendMail(mailData, (err, info) => {
            if (err) {
                //console.log(err)
            } else {
                //console.log(info)
            }
        })
    }
    const newClient = new Client({
        clientCompanyName,
        clientEmail,
        clientPhone,
        clientAddress,
        clientActivitySector,
        clientJob,
        clientReferenceName,
        clientReferenceNumber,
        clientRequiredSkills,
        numberOfPosts,
        clientMotivation,
        jobStartDate,
        jobEndDate,
        jobTotalBudget,
        netSalary,
        clientImportance,
        enteredBy,
        jobStatus,
        note_cofac,
        leadOrigin,
        salary_hours,
        rate_hours,
        offerSent,
        signatureSent,
        contractSigned,
        publicityStarted,
        A1selected,
        assuranceFaite,
        agenceDeVoyage,
        sispiDeclared,
    })

    newClient
        .save()
        .then((data) => {
            return res
                .status(200)
                .json({
                    message: "Client/Job Registered Successfully!",
                    status: true
                })
        })
        .catch(err => {
            //console.log(err)
            return res
                .status(400)
                .json({
                    error: "INTERNAL_SERVER_ERROR",
                    message: "Error in Saving Client/Job!",
                    status: false
                })
        })
}

exports.viewToDoClients = async (req, res, next) => {
    //console.log("Fetching all To-Do Clients/Jobs");
    let skip = req.query.skip;
    try {
        let clients = await Client.find({
            jobStatus: "To-Do"
        }).sort({ createdAt: -1 }).skip(skip).limit(20).exec();
        if (!clients) {
            res.status(400).send("No Data Found!");
        } else {
            res.status(200).json(clients);
        }
    } catch (err) {
        res.status(500).send("Fetch Error!");
    }
}

exports.viewAllToDoClients = async (req, res, next) => {
    //console.log("Fetching all To-Do Clients/Jobs");
    try {
        let clients = await Client.find({
            jobStatus: "To-Do"
        }).sort({ createdAt: -1 }).exec();
        if (!clients) {
            res.status(400).send("No Data Found!");
        } else {
            res.status(200).json(clients);
        }
    } catch (err) {
        res.status(500).send("Fetch Error!");
    }
}


exports.viewInProgressClients = async (req, res, next) => {
    //console.log("Fetching all In-Progress Clients/Jobs");
    let skip = req.query.skip;
    try {
        let clients = await Client.find({
            jobStatus: "In-Progress"
        }).sort({ createdAt: -1 }).skip(skip).limit(20).exec();
        if (!clients) {
            res.status(400).send("No Data Found!");
        } else {
            res.status(200).json(clients);
        }
    } catch (err) {
        res.status(500).send("Fetch Error!");
    }
}

exports.viewAllInProgressClients = async (req, res, next) => {
    //console.log("Fetching all In-Progress Clients/Jobs");
    try {
        let clients = await Client.find({
            jobStatus: "In-Progress"
        }).sort({ createdAt: -1 }).exec();
        if (!clients) {
            res.status(400).send("No Data Found!");
        } else {
            res.status(200).json(clients);
        }
    } catch (err) {
        res.status(500).send("Fetch Error!");
    }
}

exports.viewSignedClients = async (req, res, next) => {
    //console.log("Fetching all Signed Clients/Jobs");
    let skip = req.query.skip;
    try {
        let clients = await Client.find({
            jobStatus: "Signed Contract"
        })
        .populate("employeesWorkingUnder")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(20)
        .exec();
        if (!clients) {
            res.status(400).send("No Data Found!");
        } else {
            res.status(200).json(clients);
        }
    } catch (err) {
        //console.log(err)
        res.status(500).send("Fetch Error!");
    }
}

exports.viewAllSignedClients = async (req, res, next) => {
    //console.log("Fetching all Signed Clients/Jobs");
    try {
        let clients = await Client.find({
            jobStatus: "Signed Contract"
        })
        .populate("employeesWorkingUnder")
        .sort({ createdAt: -1 })
        .exec();
        if (!clients) {
            res.status(400).send("No Data Found!");
        } else {
            res.status(200).json(clients);
        }
    } catch (err) {
        //console.log(err)
        res.status(500).send("Fetch Error!");
    }
}

exports.viewArchivedClients = async (req, res, next) => {
    //console.log("Fetching all Archived Clients/Jobs");
    let skip = req.query.skip;

    try {
        let clients = await Client.find({
            jobStatus: "Archived"
        }).sort({ createdAt: -1 }).skip(skip).limit(20).exec();
        if (!clients) {
            res.status(400).send("No Data Found!");
        } else {
            res.status(200).json(clients);
        }
    } catch (err) {
        res.status(500).send("Fetch Error!");
    }
}

exports.viewAllArchivedClients = async (req, res, next) => {
    //console.log("Fetching all Archived Clients/Jobs");
    try {
        let clients = await Client.find({
            jobStatus: "Archived"
        }).sort({ createdAt: -1 }).exec();
        if (!clients) {
            res.status(400).send("No Data Found!");
        } else {
            res.status(200).json(clients);
        }
    } catch (err) {
        res.status(500).send("Fetch Error!");
    }
}

exports.uploadClientImage = async (req, res, next) => {
    //console.log(req.file, req.body)
    const { clientId } = req.body;
    if (req.file) {
        var image = {
            documentName: req.file.filename,
            originalName: req.file.originalname
        };
        await Client.findByIdAndUpdate(clientId, {
            clientPhoto: image
        })
            .then((reData) => {
                return res.status(200).json({
                    status: true,
                    fileName: req.file.filename,
                    message: 'Image Uploaded Successfully!'
                })
            })
            .catch(err => {
                //console.log(err)
                return res.status(200).json({
                    status: false,
                    message: 'Image Not Uploaded!'
                })
            })
    }
}

exports.editToDoClient = async (req, res, next) => {
    console.log("Editing ToDo Client");
    const {
        clientId,
        clientCompanyName,
        numberOfPosts,
        clientMotivation,
        clientImportance,
        clientActivitySector,
        clientJob,
        clientLanguages,
        jobStartDate,
        jobEndDate,
        clientPermis,
        clientRequiredSkills,
        clientEmail,
        clientPhone,
        clientAddress,
        clientReferenceName,
        clientReferenceNumber,
        clientReferenceEmail,
        jobTotalBudget,
        netSalary,
        salary_hours,
        rate_hours,
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
        contractId,
    } = JSON.parse(req.body.data)
    let data = {}
    let contractData = {
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
            contractId: contractId,
    }
    if (req.file) {
        var image = {
            documentName: req.file.filename,
            originalName: req.file.originalname
        };
        data = {
            clientId: clientId,
            clientCompanyName: clientCompanyName,
            numberOfPosts: numberOfPosts,
            clientMotivation: clientMotivation,
            clientImportance: clientImportance,
            clientActivitySector: clientActivitySector,
            clientJob: clientJob,
            clientLanguages: clientLanguages,
            jobTotalBudget: jobTotalBudget,
            netSalary: netSalary,
            salary_hours: salary_hours,
            rate_hours: rate_hours,
            jobStartDate: jobStartDate,
            jobEndDate: jobEndDate,
            clientPermis: clientPermis,
            clientRequiredSkills: clientRequiredSkills,
            clientEmail: clientEmail,
            clientPhone: clientPhone,
            clientAddress: clientAddress,
            clientReferenceName: clientReferenceName,
            clientReferenceNumber: clientReferenceNumber,
            clientReferenceEmail: clientReferenceEmail,
            clientPhoto: image
        }
    } else {
        var image = {};
        data = {
            clientId: clientId,
            clientCompanyName: clientCompanyName,
            numberOfPosts: numberOfPosts,
            clientMotivation: clientMotivation,
            clientImportance: clientImportance,
            clientActivitySector: clientActivitySector,
            clientJob: clientJob,
            clientLanguages: clientLanguages,
            jobStartDate: jobStartDate,
            jobEndDate: jobEndDate,
            salary_hours: salary_hours,
            rate_hours: rate_hours,
            clientPermis: clientPermis,
            clientRequiredSkills: clientRequiredSkills,
            clientEmail: clientEmail,
            clientPhone: clientPhone,
            clientAddress: clientAddress,
            clientReferenceName: clientReferenceName,
            clientReferenceNumber: clientReferenceNumber,
            clientReferenceEmail: clientReferenceEmail,
            jobTotalBudget: jobTotalBudget,
            netSalary: netSalary,
        }
    }

    await Client.findByIdAndUpdate(clientId, data)
        .then((response) => {
            //console.log(response);
            clientContract.findByIdAndUpdate(contractId, contractData).then(response => {
                //console.log(response)
                return res.status(200).json({
                    message: "Client (To-Do) Saved Successfully!",
                    status: true,
                })
            }).catch(err => {
                //console.log(err);
                return res.status(400).json({
                    message: "Client Change Failed!",
                    status: false,
                })    
            })
        })
        .catch(err => {
            //console.log(err);
            return res.status(400).json({
                message: "Client Change Failed!",
                status: false,
            })
        })

}

exports.editInProgressClient = async (req, res, next) => {
    //console.log(JSON.parse(req.body.data), req.file)
    const {
        clientId,
        clientCompanyName,
        numberOfPosts,
        clientMotivation,
        clientImportance,
        clientActivitySector,
        clientJob,
        clientLanguages,
        jobStartDate,
        jobEndDate,
        clientPermis,
        clientRequiredSkills,
        clientEmail,
        clientPhone,
        clientAddress,
        clientReferenceName,
        clientReferenceNumber,
        clientReferenceEmail,
        jobTotalBudget,
        netSalary,
        salary_hours,
        rate_hours,
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
        contractId,
    } = JSON.parse(req.body.data)
    let data = {}
    let contractData = {
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
            contractId: contractId,
    }
    if (req.file) {
        var image = {
            documentName: req.file.filename,
            originalName: req.file.originalname
        };
        data = {
            clientId: clientId,
            clientCompanyName: clientCompanyName,
            numberOfPosts: numberOfPosts,
            clientMotivation: clientMotivation,
            clientImportance: clientImportance,
            clientActivitySector: clientActivitySector,
            clientJob: clientJob,
            clientLanguages: clientLanguages,
            jobTotalBudget: jobTotalBudget,
            netSalary: netSalary,
            salary_hours: salary_hours,
            rate_hours: rate_hours,
            jobStartDate: jobStartDate,
            jobEndDate: jobEndDate,
            clientPermis: clientPermis,
            clientRequiredSkills: clientRequiredSkills,
            clientEmail: clientEmail,
            clientPhone: clientPhone,
            clientAddress: clientAddress,
            clientReferenceName: clientReferenceName,
            clientReferenceNumber: clientReferenceNumber,
            clientReferenceEmail: clientReferenceEmail,
            clientPhoto: image
        }
    } else {
        var image = {};
        data = {
            clientId: clientId,
            clientCompanyName: clientCompanyName,
            numberOfPosts: numberOfPosts,
            clientMotivation: clientMotivation,
            clientImportance: clientImportance,
            clientActivitySector: clientActivitySector,
            clientJob: clientJob,
            clientLanguages: clientLanguages,
            jobStartDate: jobStartDate,
            jobEndDate: jobEndDate,
            clientPermis: clientPermis,
            clientRequiredSkills: clientRequiredSkills,
            clientEmail: clientEmail,
            clientPhone: clientPhone,
            clientAddress: clientAddress,
            clientReferenceName: clientReferenceName,
            clientReferenceNumber: clientReferenceNumber,
            clientReferenceEmail: clientReferenceEmail,
            jobTotalBudget: jobTotalBudget,
            netSalary: netSalary,
            salary_hours: salary_hours,
            rate_hours: rate_hours
        }
    }

    await Client.findByIdAndUpdate(clientId, data)
        .then((response) => {
            //console.log(response);
            clientContract.findByIdAndUpdate(contractId, contractData).then(response => {
                //console.log(response)
                return res.status(200).json({
                    message: "Client (Progress) Saved Successfully!",
                    status: true,
                })
            }).catch(err => {
                //console.log(err);
                return res.status(400).json({
                    message: "Client Change Failed!",
                    status: false,
                })    
            })
        })
        .catch(err => {
            //console.log(err);
            return res.status(400).json({
                message: "Client Change Failed!",
                status: false,
            })
        })

}

exports.editSignedClient = async (req, res, next) => {
    //console.log(JSON.parse(req.body.data), req.file)
    const {
        clientId,
        clientCompanyName,
        numberOfPosts,
        clientMotivation,
        clientImportance,
        clientActivitySector,
        clientJob,
        clientLanguages,
        jobStartDate,
        jobEndDate,
        clientPermis,
        clientRequiredSkills,
        clientEmail,
        clientPhone,
        clientAddress,
        clientReferenceName,
        clientReferenceNumber,
        clientReferenceEmail,
        jobTotalBudget,
        netSalary,
        salary_hours,
        rate_hours,
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
        contractId,
    } = JSON.parse(req.body.data)
    let data = {}
    let contractData = {
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
            contractId: contractId,
    }
    if (req.file) {
        var image = {
            documentName: req.file.filename,
            originalName: req.file.originalname
        };
        data = {
            clientId: clientId,
            clientCompanyName: clientCompanyName,
            numberOfPosts: numberOfPosts,
            clientMotivation: clientMotivation,
            clientImportance: clientImportance,
            clientActivitySector: clientActivitySector,
            clientJob: clientJob,
            clientLanguages: clientLanguages,
            jobTotalBudget: jobTotalBudget,
            netSalary: netSalary,
            salary_hours: salary_hours,
            rate_hours: rate_hours,
            jobStartDate: jobStartDate,
            jobEndDate: jobEndDate,
            clientPermis: clientPermis,
            clientRequiredSkills: clientRequiredSkills,
            clientEmail: clientEmail,
            clientPhone: clientPhone,
            clientAddress: clientAddress,
            clientReferenceName: clientReferenceName,
            clientReferenceNumber: clientReferenceNumber,
            clientReferenceEmail: clientReferenceEmail,
            clientPhoto: image
        }
    } else {
        var image = {};
        data = {
            clientId: clientId,
            clientCompanyName: clientCompanyName,
            numberOfPosts: numberOfPosts,
            clientMotivation: clientMotivation,
            clientImportance: clientImportance,
            clientActivitySector: clientActivitySector,
            clientJob: clientJob,
            clientLanguages: clientLanguages,
            jobStartDate: jobStartDate,
            jobEndDate: jobEndDate,
            clientPermis: clientPermis,
            clientRequiredSkills: clientRequiredSkills,
            clientEmail: clientEmail,
            clientPhone: clientPhone,
            clientAddress: clientAddress,
            clientReferenceName: clientReferenceName,
            clientReferenceNumber: clientReferenceNumber,
            clientReferenceEmail: clientReferenceEmail,
            jobTotalBudget: jobTotalBudget,
            netSalary: netSalary,
            salary_hours: salary_hours,
            rate_hours: rate_hours
        }
    }

    await Client.findByIdAndUpdate(clientId, data)
        .then((response) => {
            //console.log(response);
            clientContract.findByIdAndUpdate(contractId, contractData).then(response => {
                //console.log(response)
                return res.status(200).json({
                    message: "Client (Signed) Saved Successfully!",
                    status: true,
                })
            }).catch(err => {
                //console.log(err);
                return res.status(400).json({
                    message: "Client Change Failed!",
                    status: false,
                })    
            })
        })
        .catch(err => {
            //console.log(err);
            return res.status(400).json({
                message: "Client Change Failed!",
                status: false,
            })
        })

}


exports.editArchivedClient = async (req, res, next) => {
    //console.log(JSON.parse(req.body.data), req.file)
    const {
        clientId,
        clientCompanyName,
        numberOfPosts,
        clientMotivation,
        clientImportance,
        clientActivitySector,
        clientJob,
        clientLanguages,
        jobStartDate,
        jobEndDate,
        clientPermis,
        clientRequiredSkills,
        clientEmail,
        clientPhone,
        clientAddress,
        clientReferenceName,
        clientReferenceNumber,
        clientReferenceEmail,
        jobTotalBudget,
        netSalary,
        salary_hours,
        rate_hours,
        clientArchived,
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
        contractId,
    } = JSON.parse(req.body.data)
    let data = {}
    let contractData = {
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
            contractId: contractId,
    }
    if (req.file) {
        var image = {
            documentName: req.file.filename,
            originalName: req.file.originalname
        };
        data = {
            clientId: clientId,
            clientCompanyName: clientCompanyName,
            numberOfPosts: numberOfPosts,
            clientMotivation: clientMotivation,
            clientImportance: clientImportance,
            clientActivitySector: clientActivitySector,
            clientJob: clientJob,
            clientLanguages: clientLanguages,
            jobTotalBudget: jobTotalBudget,
            netSalary: netSalary,
            salary_hours: salary_hours,
            rate_hours: rate_hours,
            jobStartDate: jobStartDate,
            jobEndDate: jobEndDate,
            clientPermis: clientPermis,
            clientRequiredSkills: clientRequiredSkills,
            clientEmail: clientEmail,
            clientPhone: clientPhone,
            clientAddress: clientAddress,
            clientReferenceName: clientReferenceName,
            clientReferenceNumber: clientReferenceNumber,
            clientReferenceEmail: clientReferenceEmail,
            clientArchived: clientArchived,
            clientPhoto: image
        }
    } else {
        var image = {};
        data = {
            clientId: clientId,
            clientCompanyName: clientCompanyName,
            numberOfPosts: numberOfPosts,
            clientMotivation: clientMotivation,
            clientImportance: clientImportance,
            clientActivitySector: clientActivitySector,
            clientJob: clientJob,
            clientLanguages: clientLanguages,
            jobStartDate: jobStartDate,
            jobEndDate: jobEndDate,
            clientPermis: clientPermis,
            clientRequiredSkills: clientRequiredSkills,
            clientEmail: clientEmail,
            clientPhone: clientPhone,
            clientAddress: clientAddress,
            clientReferenceName: clientReferenceName,
            clientReferenceNumber: clientReferenceNumber,
            clientReferenceEmail: clientReferenceEmail,
            jobTotalBudget: jobTotalBudget,
            netSalary: netSalary,
            salary_hours: salary_hours,
            rate_hours: rate_hours,
            clientArchived: clientArchived,

        }
    }

    await Client.findByIdAndUpdate(clientId, data)
        .then((response) => {
            //console.log(response);
            clientContract.findByIdAndUpdate(contractId, contractData).then(response => {
                //console.log(response)
                return res.status(200).json({
                    message: "Client (Archived) Saved Successfully!",
                    status: true,
                })
            }).catch(err => {
                //console.log(err);
                return res.status(400).json({
                    message: "Client Change Failed!",
                    status: false,
                })    
            })
        })
        .catch(err => {
            //console.log(err);
            return res.status(400).json({
                message: "Client Change Failed!",
                status: false,
            })
        })

}

exports.moveClientToToDo = async (req, res, next) => {
    //console.log("Reset Client Status ...");
    const { clientId } = req.body;
    await Client.updateOne({
        _id: clientId
    }, {
        $set: {
            jobStatus: "To-Do"
        }
    })
        .then(async response => {
            return res
                .status(200)
                .json({
                    message: "Client Status Reset to To-DO Successfully!",
                    status: true
                })
        })
        .catch(err => {
            //console.log(err);
            return res
                .status(400)
                .json({
                    message: "Update Not Successfull, Try Again Later!",
                    status: false
                })
        })
}

exports.moveClientInProgress = async (req, res, next) => {
    //console.log("Changing Client Status ...");
    const { clientId, clientCompanyName, clientJob } = req.body;
    //console.log(clientId, clientCompanyName, clientJob)
    await Client.updateOne({
        _id: clientId,
        clientCompanyName: clientCompanyName,
        clientJob: clientJob
    }, {
        $set: {
            jobStatus: "In-Progress"
        }
    })
        .then(resp => {
            return res
                .status(200)
                .json({
                    message: "Client/Lead Moved To In-Progress Successfully!",
                    status: true
                })
        })
        .catch(err => {
            //console.log(err);
            return res
                .status(400)
                .json({
                    message: "Update Not Successfull, Try Again Later!",
                    status: false
                })
        })


}


exports.moveClientToSigned = async (req, res, next) => {
    const { clientId, clientJob } = req.body;
    //console.log(clientId, clientJob);
    await Client.updateOne({
        _id: clientId,
        clientJob: clientJob
    }, {
        $set: {
            jobStatus: "Signed Contract"
        }
    })
        .then(response => {
            //console.log(response);
            return res.status(200).json({
                message: "Client/Lead Signed Successfully!",
                status: true
            })
        })
        .catch(err => {
            //console.log(err);
            return res.status(400).json({
                message: "Update Not Successfull, Try Again Later!",
                status: false
            })
        })
}

exports.moveClientToArchived = async (req, res, next) => {
    const { clientId, reasonToArchive, clientJobName } = req.body;
    //console.log(clientId, reasonToArchive, clientJobName);
    await Client.updateOne({
        _id: clientId,
        clientJob: clientJobName
    }, {
        $set: {
            clientArchived: {
                reason: reasonToArchive
            },
            jobStatus: "Archived",
            employeesWorkingUnder: []
        }
    })
        .then(response => {
            //console.log(response);
            return res.status(200).json({
                message: "Client/Lead Archived Successfully!",
                status: true
            })
        })
        .catch(err => {
            //console.log(err);
            return res.status(400).json({
                message: "Update Not Successfull, Try Again Later!",
                status: false
            })
        })
}


exports.getClientByName = async (req, res, next) => {
    const { clientCompanyName } = req.query;
    let results = await Client.find({ clientCompanyName: clientCompanyName })
    //console.log(results);
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            data: results[0]
        })
    } else {
        return res.status(400).json({
            status: false,
            data: null
        })
    }
}


// Filters To-Do
exports.filterToDoClientByLanguages = async (req, res, next) => {
    //console.log("Filtering Clients By Languages ... ");
    let langs = req.query.languages
    langs = langs.split(",")
    let results = await Client.find({ clientLanguages: { $in: langs }, jobStatus: "To-Do" })
    //console.log(results.length);
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            length: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.filterToDoClientBySector = async (req, res, next) => {
    let { sector } = req.query;
    let results = await Client.find({
        jobStatus: 'To-Do',
        clientActivitySector: sector
    })
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            length: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.filterToDoClientSectorJob = async (req, res, next) => {
    //console.log(req.query);
    let { sector, jobs } = req.query;
    //console.log(sector, jobs);
    jobs = jobs.split(",")
    let results = await Client.find({
        clientActivitySector: sector,
        clientJob: jobs,
        jobStatus: "To-Do"
    })
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            length: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.filterToDoClientSectorLanguage = async (req, res, next) => {
    //console.log(req.query);
    let { sector, languages } = req.query;
    //console.log(sector, languages);
    languages = languages.split(",")
    let results = await Client.find({
        clientActivitySector: sector,
        jobStatus: "To-Do",
        clientLanguages: {
            $in: languages
        }
    })
    //console.log(results)
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            length: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.filterToDoClientSectorJobLanguage = async (req, res, next) => {
    let { sector, jobs, languages } = req.query;
    jobs = jobs.split(",")
    languages = languages.split(",")
    let results = await Client.find({
        clientActivitySector: sector,
        clientJob: {
            $in: jobs
        },
        clientStatus: "To-Do",
        clientLanguages: {
            $in: languages
        }
    })
    //console.log(results);
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            length: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

// Filters In-Progress
exports.filterInProgressClientByLanguages = async (req, res, next) => {
    //console.log("Filtering Clients By Languages ... ");
    let langs = req.query.languages
    langs = langs.split(",")
    let results = await Client.find({ clientLanguages: { $in: langs }, jobStatus: "In-Progress" })
    //console.log(results.length);
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            length: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }

}

exports.filterInProgressClientBySector = async (req, res, next) => {
    let { sector } = req.query;
    let results = await Client.find({
        jobStatus: 'In-Progress',
        clientActivitySector: sector
    })
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            length: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.filterInProgressClientSectorLanguage = async (req, res, next) => {
    //console.log(req.query);
    let { sector, languages } = req.query;
    //console.log(sector, languages);
    languages = languages.split(",")
    let results = await Client.find({
        clientActivitySector: sector,
        jobStatus: "In-Progress",
        clientLanguages: {
            $in: languages
        }
    })
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            length: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.filterInProgressClientSectorJob = async (req, res, next) => {
    //console.log(req.query);
    let { sector, jobs } = req.query;
    jobs = jobs.split(",");
    let results = await Client.find({
        clientActivitySector: sector,
        clientJob: jobs,
        jobStatus: "In-Progress"
    })
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            length: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.filterInProgressClientSectorJobLanguage = async (req, res, next) => {
    //console.log(req.query);
    let { sector, jobs, languages } = req.query;
    //console.log(sector, jobs, languages);
    jobs = jobs.split(",")
    languages = languages.split(",")
    let results = await Client.find({
        clientActivitySector: sector,
        clientJob: jobs,
        jobStatus: "In-Progress",
        clientLanguages: {
            $in: languages
        }
    })
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            length: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

// Filter Signed Contracts
exports.filterSignedClientByLanguages = async (req, res, next) => {
    //console.log("Filtering Clients By Languages ... ");
    let langs = req.query.languages
    langs = langs.split(",")
    let results = await Client.find({ clientLanguages: { $in: langs }, jobStatus: "Signed Contract" })
    //console.log(results.length);
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            length: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }

}

exports.filterSignedClientBySector = async (req, res, next) => {
    let { sector } = req.query;
    let results = await Client.find({
        jobStatus: 'Signed Contract',
        clientActivitySector: sector
    })
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            length: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.filterSignedClientSectorLanguage = async (req, res, next) => {
    //console.log(req.query);
    let { sector, languages } = req.query;
    //console.log(sector, languages);
    languages = languages.split(",")
    let results = await Client.find({
        clientActivitySector: sector,
        jobStatus: "Signed Contract",
        clientLanguages: {
            $in: languages
        }
    })
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            length: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.filterSignedClientSectorJob = async (req, res, next) => {
    //console.log(req.query);
    let { sector, jobs } = req.query;
    jobs = jobs.split(",")
    let results = await Client.find({
        clientActivitySector: sector,
        clientJob: jobs,
        jobStatus: "Signed Contract"
    })
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            length: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.filterSignedClientSectorJobLanguage = async (req, res, next) => {
    //console.log(req.query);
    let { sector, jobs, languages } = req.query;
    jobs = jobs.split(",");
    languages = languages.split(",");
    let results = await Client.find({
        clientActivitySector: sector,
        clientJob: jobs,
        jobStatus: "Signed Contract",
        clientLanguages: {
            $in: languages
        }
    })
    //console.log(results);
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            length: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}


// Filter Archived
exports.filterArchivedClientByLanguages = async (req, res, next) => {
    //console.log("Filtering Clients By Languages ... ");
    let langs = req.query.languages
    langs = langs.split(",")
    let results = await Client.find({ clientLanguages: { $in: langs }, jobStatus: "Archived" })
    //console.log(results.length);
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            length: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }

}

exports.filterArchivedClientBySector = async (req, res, next) => {
    let { sector } = req.query;
    let results = await Client.find({
        jobStatus: 'Archived',
        clientActivitySector: sector
    })
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            length: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.filterArchivedClientSectorLanguage = async (req, res, next) => {
    //console.log(req.query);
    let { sector, languages } = req.query;
    //console.log(sector, languages);
    languages = languages.split(",")
    let results = await Client.find({
        clientActivitySector: sector,
        jobStatus: "Archived",
        clientLanguages: {
            $in: languages
        }
    })
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            length: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.filterArchivedClientSectorJob = async (req, res, next) => {
    //console.log(req.query);
    let { sector, jobs } = req.query;
    jobs = jobs.split(",")
    let results = await Client.find({
        clientActivitySector: sector,
        clientJob: jobs,
        jobStatus: "Archived"
    })
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            length: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.filterArchivedClientSectorJobLanguage = async (req, res, next) => {
    //console.log(req.query);
    let { sector, jobs, languages } = req.query;
    jobs = jobs.split(",");
    languages = languages.split(",");
    let results = await Client.find({
        clientActivitySector: sector,
        clientJob: jobs,
        jobStatus: "Archived",
        clientLanguages: {
            $in: languages
        }
    })
    //console.log(results);
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            length: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}