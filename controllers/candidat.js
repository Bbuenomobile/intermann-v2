const Candidat = require("../models/candidat");
const bcrypt = require("bcryptjs");
const client = require("../models/client");
const Contract = require("../models/contractCandidat");
const fs = require("fs");
const { json } = require("body-parser");
const cloudinary = require("cloudinary").v2;

cloudinary.config({ 
    cloud_name: 'dj06tvfjt', 
    api_key: '122145526342654', 
    api_secret: 'PgTTOnNXzbw2mcSVgCob59JBi6A' 
});
// Fetchers
exports.getProfiles = async (req,res,next) => {
    //console.log('fetch all profiles');
    let profiles = [];
    let candidatResults = await Candidat.find({}).exec();
    let clientResults = await client.find({}).exec();
    //console.log(candidatResults.length, clientResults.length);
    profiles.push(...candidatResults);
    profiles.push(...clientResults);
    return res.status(200).json({
        status: true,
        total: profiles.length,
        data: profiles
    })
}


exports.getCandidatsByClient = async(req,res,next) => {
    const { clientCompanyName } = req.query;
    try {
    let results = await client.find({
        clientCompanyName: clientCompanyName
    })
    .populate("employeesWorkingUnder")
    .exec()

    // //console.log(results);
    if (results.length == 0) {
        return res.status(400).json({
            status: false,
            data: []
        });
    } else {
        return res.status(200).json({
            status: true,
            data: results
        });
    }
} catch (err) {
    //console.log(err)
    res.status(500).send("Fetch Error!");
}
}

exports.getCandidatsByPhoneNumber = async (req,res,next) => {
    const { phoneNumber } = req.query
    //console.log(phoneNumber);
    let results = await Candidat.find({ candidatPhone: "+"+phoneNumber.trim() }).exec()
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

exports.fetchCandidatRecommendations = async (req, res, next) => {
    const { clientSector } = req.query

    let results = await Candidat.find({ candidatActivitySector: clientSector, candidatStatus: 'To-Do' }).exec()
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

exports.getClientsForFilter = async (req,res,next) => {

    let result = await client.find({ employeesWorkingUnder: {$nin: [null, []]} }).populate("employeesWorkingUnder").exec()

   if (!result) {
    return res.status(400).json({
        status: false,
        message: "No Data Found!"
    });
   } else {
       let clientNames = result.map(r => r.clientCompanyName)
    return res.status(200).json({
        status: true,
        data: clientNames,
    })
   }
}

exports.getCandidatById = async (req, res, next) => {
    const { candidatId
    } = req.query;
    //console.log(candidatId)
    Candidat.findById(candidatId).populate("candidatContract").exec().then(result => {
        if (result) {
            // //console.log(result)
            return res.status(200).json({
                status: true,
                data: result
            })
        } else {
            return res.status(400).json({
                status: false,
                data: result
            })
        }
    })
        .catch(err => {
            //console.log(err);
            return res.status(400).json({
                status: false,
                data: result
            })
        })

}

exports.getCandidats = async (req, res, next) => {
    let params = req.query
    let query = {};
    Object.keys(params).map((k) => {
        query[k]=params[k];
    })
    //console.log(query);
    let results = await Candidat.find(query)
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

exports.uploadCandidatImage = async (req, res, next) => {
    //console.log(req.file, req.body)
    const { candidatId } = req.body;
    if (req.file) {
        var image = {
            documentName: req.file.filename,
            originalName: req.file.originalname
        };
        await Candidat.findByIdAndUpdate(candidatId, {
            candidatPhoto: image
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

// Document Uploaders
exports.uploadCandidatDocuments = async (req, res, next) => {
    //console.log("*******************************");
    //console.log(req.file, req.body)
    const { candidatId } = req.body;
    let locaFilePath = req.file.filename;
    var result = await uploadToCloudinary(locaFilePath);
    console.log(result.url, typeof(result.url));
    if (req.file) {
        await Candidat.findByIdAndUpdate(candidatId, {
            $push: {
                candidatDocuments: {
                    documentName: req.file.filename,
                    originalName: req.file.originalname,
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
                //console.log(err)
                return res.status(400).json({
                    status: false,
                    message: 'Upload Failed!'
                })
            })
    }
}

exports.renameCandidatDocument = async (req, res, next) => {
    const { documentId, newName, candidatId } = req.query
    //console.log(documentId, newName, candidatId);
    Candidat.findById(candidatId)
        .then(result => {
            //console.log(result)
            // var filePath = "uploads/" + documentName
            // fs.unlinkSync(filePath)
            let newDocs = result.candidatDocuments.map((doc) => {
                if (doc._id == documentId) {
                    doc["originalName"] = newName
                    return doc;
                } else {
                    return doc;
                }
            })
            //console.log(newDocs);
            Candidat.findByIdAndUpdate(candidatId, {
                $set: {candidatDocuments : newDocs }
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
                message: 'Document Delete Failed!'
            })
        })
}

exports.deleteCandidatDocument = async (req, res, next) => {
    const { documentId, documentName, candidatId } = req.query
    //console.log(documentId, documentName, candidatId);
    cloudinary.uploader.destroy(documentName,  { invalidate: true, resource_type: "raw" }, (resul) => {
        console.log(resul);

    });
    Candidat.findByIdAndUpdate(candidatId, {
        $pull: {
            candidatDocuments: { _id: documentId }
        }
    })
        .then(result => {
            //console.log(result)
            var filePath = "uploads/" + documentName
            fs.unlinkSync(filePath)
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

// GET Counts
exports.getCounts = async (req, res, next) => {
    const toDoCount = await Candidat.find({
        candidatStatus: "To-Do"
    })
    const inProgressCount = await Candidat.find({
        candidatStatus: "In-Progress"
    })
    const archivedCount = await Candidat.find({
        candidatStatus: "Archived"
    })
    const preSelectedCount = await Candidat.find({
        candidatStatus: "Pre-Selected"
    })


    return res.status(200).json({
        message: "All Counts Found!",
        toDoCount: toDoCount.length,
        inProgressCount: inProgressCount.length,
        archivedCount: archivedCount.length,
        preSelectedCount: preSelectedCount.length,
    })
}

exports.candidatNameCheck = async (req, res, next) => {
    const { candidatName } = req.query;
    //console.log(candidatName)
    await Candidat.findOne({ candidatName: candidatName })
        .then((data) => {
            if (data) {
                return res.status(200).json({
                    status: true,
                    message: "Candidat Name Matched!"
                })
            } else {
                return res.status(200).json({
                    status: false,
                    message: "Candidat Name Not Matched!"
                })
            }
        })
        .catch(err => {
            return res.status(400).json({
                status: false,
                message: "Cannot Match Name!"
            })
        })
}

//Send in Body to Add Candidate
exports.addCandidat = async (req, res, next) => {
    //console.log("Adding A Candidat!");
    //console.log(req.body);
    let {
        candidatName,
        candidatEmail,
        candidatAddress,
        candidatPhone,
        candidatActivitySector,
        candidatJob,
        candidatFBURL,
        candidatAlternatePhone,
        candidatSkills,
        candidatAge,
        candidatMotivation,
        candidatLanguages,
        candidatLicensePermis,
        candidatConduireEnFrance,
        candidatStartDate,
        candidatEndDate,
        candidatYearsExperience,
        candidatFetes,
        candidatComingFrom,
        candidatPhoto,
        candidatExperienceDetails,
        candidatCurrentWork,
        enteredBy,
        candidatStatus
    } = req.body;

    if (candidatActivitySector.sectorName == "") {
        //console.log(candidatActivitySector)
        candidatActivitySector = ""
    }
    //console.log(candidatActivitySector, candidatEmail)
    if (candidatEmail == '') {
        candidatEmail = undefined
    }
    const newCandidat = new Candidat({
        candidatName,
        candidatEmail,
        candidatAddress,
        candidatActivitySector,
        candidatPhone,
        candidatJob,
        candidatFBURL,
        candidatAlternatePhone,
        candidatSkills,
        candidatAge,
        candidatMotivation,
        candidatLanguages,
        candidatLicensePermis,
        candidatConduireEnFrance,
        candidatStartDate,
        candidatEndDate,
        candidatYearsExperience,
        candidatComingFrom,
        candidatFetes,
        candidatPhoto,
        candidatExperienceDetails,
        candidatCurrentWork,
        enteredBy,
        candidatStatus
    })

    newCandidat
        .save()
        .then(() => {
            return res
                .status(200)
                .json({
                    message: "Candidat Registered Successfully!",
                    status: true
                })
        })
        .catch(err => {
            //console.log(err)
            return res
                .status(400)
                .json({
                    error: "INTERNAL_SERVER_ERROR",
                    message: "Error in Saving Candidat!",
                    status: false
                })
        })

}

// Send id in query to view Candidate
exports.viewCandidat = async (req, res, next) => {
    //console.log("Finding A Candidat ... ");
    //console.log(req.query);
    const foundCandidat = await Candidat.findById(req.query.id)
    return res.status(200).json({
        message: "Candidat Found",
        candidat: foundCandidat
    })
}

exports.viewToDoCandidats = async (req,res,next) => {
    //console.log("List, Skip & Limit To-Do Candidates ... ");
    let skip = req.query.skip;
    try {
        let candidates = await Candidat.find({
            candidatStatus: "To-Do"
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(20)
        .exec();
        if (!candidates) {
            res.status(400).send("No Data Found!");
        } else {
            res.status(200).json(candidates);
        }
    } catch (err) {
        res.status(500).send("Fetch Error!");
    }
}

// GET Request
exports.viewAllToDoCandidats = async (req, res, next) => {
    //console.log("List All To-Do Candidates ... ");
    try {
        let candidates = await Candidat.find({
            candidatStatus: "To-Do"
        })
        .sort({ createdAt: -1 })
        .exec();
        if (!candidates) {
            res.status(400).send("No Data Found!");
        } else {
            res.status(200).json(candidates);
        }
    } catch (err) {
        res.status(500).send("Fetch Error!");
    }
}

exports.viewPreSelectedCandidats = async (req,res,next) => {
    //console.log("List All Pre-Selected Candidates ... ");
    let skip = req.query.skip;
    try {
        let candidates = await Candidat.find({
            candidatStatus: "Pre-Selected"
        }).populate("candidatPreSelectedFor.clientId").sort({ createdAt: -1 }).skip(skip).limit(20).exec();
        //console.log(candidates);
        if (candidates.length == 0) {
            res.status(400).json({
                status: false,
                data: []
            });
        } else {
            
            res.status(200).json({
                status: true,
                data: candidates
            });
        }
    } catch (err) {
        res.status(500).json({
            status: false,
            data: []
        });
    }
}

exports.viewAllPreSelectedCandidats = async (req,res,next) => {
    //console.log("List All Pre-Selected Candidates ... ");
    try {
        let candidates = await Candidat.find({
            candidatStatus: "Pre-Selected"
        }).populate("candidatPreSelectedFor.clientId").sort({ createdAt: -1 }).exec();
        //console.log(candidates);
        if (candidates.length == 0) {
            res.status(400).json({
                status: false,
                data: []
            });
        } else {
            
            res.status(200).json({
                status: true,
                data: candidates
            });
        }
    } catch (err) {
        res.status(500).json({
            status: false,
            data: []
        });
    }
}

// GET Request
exports.viewInProgressCandidats = async (req, res, next) => {
    //console.log("List All In-Progress Candidates ... ");
    let skip = req.query.skip;
    try {
        let candidates = await Candidat.find({
            candidatStatus: "In-Progress"
        }).populate("candidatPreSelectedFor.clientId").sort({ createdAt: -1 }).skip(skip).limit(20).exec();
        if (!candidates) {
            res.status(400).send("No Data Found!");
        } else {
            res.status(200).json(candidates);
        }
    } catch (err) {
        res.status(500).send("Fetch Error!");
    }
}

exports.viewAllInProgressCandidats = async (req, res, next) => {
    //console.log("List All In-Progress Candidates ... ");
    try {
        let candidates = await Candidat.find({
            candidatStatus: "In-Progress"
        }).populate("candidatPreSelectedFor.clientId").sort({ createdAt: -1 }).exec();
        if (!candidates) {
            res.status(400).send("No Data Found!");
        } else {
            res.status(200).json(candidates);
        }
    } catch (err) {
        res.status(500).send("Fetch Error!");
    }
}

// GET Request
exports.viewArchivedCandidats = async (req, res, next) => {
    //console.log("List All Archived Candidates ... ");
    let skip = req.query.skip;
    try {
        let candidates = await Candidat.find({
            candidatStatus: "Archived"
        }).sort({ createdAt: -1 }).skip(skip).limit(20).exec();
        if (!candidates) {
            res.status(400).send("No Data Found!");
        } else {
            res.status(200).json(candidates);
        }
    } catch (err) {
        res.status(500).send("Fetch Error!");
    }
}

exports.viewAllArchivedCandidats = async (req, res, next) => {
    //console.log("List All Archived Candidates ... ");
    try {
        let candidates = await Candidat.find({
            candidatStatus: "Archived"
        }).sort({ createdAt: -1 }).exec();
        if (!candidates) {
            res.status(400).send("No Data Found!");
        } else {
            res.status(200).json(candidates);
        }
    } catch (err) {
        res.status(500).send("Fetch Error!");
    }
}

//move to todo/reset
exports.moveToToDo = async (req, res, next) => {
    //console.log("Reset Candidat Status ...");
    const { candidatId } = req.body;
    await Candidat.updateOne({
        _id: candidatId
    }, {
        $set: {
            candidatStatus: "To-Do"
        }
    })
        .then(async response => {
            return res
                .status(200)
                .json({
                    message: "Candidat Status Reset to To-DO Successfully!",
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

// move to proeselected
exports.moveToPreSelected = async (req, res, next) => {
    //console.log("Changing Candidat Status to Pre-Selected ...");
    const { candidatId, clientId, reason } = req.body;
    //console.log(req.body)
    const data = {
        clientId: clientId,
        reasonForPreSelection: reason
    }
    await Candidat.updateOne({
        _id: candidatId
    }, {
        $set: {
            candidatStatus: "Pre-Selected"
        },
        $push: {
            candidatPreSelectedFor: data
        }
    })
        .then(response => {
            return res
                .status(200)
                .json({
                    message: "Candidat Moved To Pre-Selected Successfully!",
                    status: true
                })
        })
        .catch(err => {
            //console.log(err);
            return res
                .status(400)
                .json({
                    message: "Update Not Successful, Try Again Later!",
                    status: false
                })
        })
}

// Body Required
exports.moveToInProgress = async (req, res, next) => {
    //console.log("Changing Candidat Status ...");
    const { candidatId, workingFor, workingSince, salary } = req.body;
    await Candidat.updateOne({
        _id: candidatId
    }, {
        $set: {
            candidatCurrentWork: {
                workingFor: workingFor,
                workingSince: workingSince,
                salary: salary
            },
            candidatStatus: "In-Progress"
        }
    })
        .then(async response => {
            //console.log(response);
            await client.updateOne({
                clientCompanyName: workingFor
            }, {
                $push: {
                    employeesWorkingUnder: candidatId,
                }
            })
            return res
                .status(200)
                .json({
                    message: "Candidat Moved To In-Progress Successfully!",
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

// Body Required
exports.moveToArchived = async (req, res, next) => {
    //console.log("Changing Candidat Status to Archived ... ");
    const { candidatId, reasonToArchive } = req.body;
    //console.log(candidatId, reasonToArchive);

    await Candidat.updateOne({
        _id: candidatId
    }, {
        $set: {
            candidatArchived: {
                reason: reasonToArchive
            },
            candidatStatus: "Archived",
            candidatPreSelectedFor: []
        }
    })
        .then(response => {
            //console.log(response);
            return res.status(200).json({
                message: "Candidat Archived Successfully!",
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

// Body Required
exports.editToDoCandidat = async (req, res, next) => {
    console.log("Editing A To-Do Candidat!");
    console.log("Body - ",req.body);
    const {
        candidatId,
        candidatName,
        candidatAge,
        candidatMotivation,
        candidatActivitySector,
        candidatJob,
        candidatLanguages,
        candidatStartDate,
        candidatEndDate,
        candidatLicensePermis,
        candidatConduireEnFrance,
        candidatSkills,
        candidatExperienceDetails,
        candidatEmail,
        candidatPhone,
        candidatAlternatePhone,
        candidatAddress,
        candidatFBURL,
        candidatYearsExperience,
        lieu_mission,
        duree_mission,
        duree_hebdomadaire_mission,
        cmp_candidat,
        contract_date,
        company_contact_name,
        nr_inreg,
        serie_id,
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
        contractId,
    } = JSON.parse(req.body.data);
    let data = {};
    let contractData = {
        lieu_mission: lieu_mission,
        duree_mission: duree_mission,
        duree_hebdomadaire_mission: duree_hebdomadaire_mission,
        cmp_candidat: cmp_candidat,
        contract_date: contract_date,
        company_contact_name: company_contact_name,
        nr_inreg: nr_inreg,
        serie_id: serie_id,
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
        contractId: contractId,
    }
    //console.log("contract data - ",contractData);
    if (req.file) {
        var image = {
            documentName: req.file.filename,
            originalName: req.file.originalname
        };
        data = {
            candidatName: candidatName,
            candidatAge: candidatAge,
            candidatMotivation: candidatMotivation,
            candidatActivitySector: candidatActivitySector,
            candidatJob: candidatJob,
            candidatLanguages: candidatLanguages,
            candidatStartDate: candidatStartDate,
            candidatEndDate: candidatEndDate,
            candidatLicensePermis: candidatLicensePermis,
            candidatConduireEnFrance: candidatConduireEnFrance,
            candidatSkills: candidatSkills,
            candidatExperienceDetails: candidatExperienceDetails,
            candidatEmail: candidatEmail,
            candidatPhone: candidatPhone,
            candidatAddress: candidatAddress,
            candidatFBURL: candidatFBURL,
            candidatYearsExperience: candidatYearsExperience,
            candidatAlternatePhone: candidatAlternatePhone,
            candidatPhoto: image
        }
        
    } else {
        var image = {};
        data = {
            candidatName: candidatName,
            candidatAge: candidatAge,
            candidatMotivation: candidatMotivation,
            candidatActivitySector: candidatActivitySector,
            candidatJob: candidatJob,
            candidatLanguages: candidatLanguages,
            candidatStartDate: candidatStartDate,
            candidatEndDate: candidatEndDate,
            candidatLicensePermis: candidatLicensePermis,
            candidatConduireEnFrance: candidatConduireEnFrance,
            candidatSkills: candidatSkills,
            candidatExperienceDetails: candidatExperienceDetails,
            candidatEmail: candidatEmail,
            candidatPhone: candidatPhone,
            candidatAddress: candidatAddress,
            candidatFBURL: candidatFBURL,
            candidatYearsExperience: candidatYearsExperience,
            candidatAlternatePhone: candidatAlternatePhone,

        }
    }

    await Candidat.findByIdAndUpdate(candidatId, data)
        .then((response) => {
            console.log(response);
            Contract.findByIdAndUpdate(contractId, contractData).then(reponse => {
                return res.status(200).json({
                    message: "Candidat (To-Do) Changed Successfully!",
                    status: true,
                })    
            }).catch((err) => {
                //console.log(err);
                return res.status(400).json({
                message: "Candidat Change Failed!",
                status: false,
                })    
            })
        })
        .catch(err => {
            //console.log(err);
            return res.status(400).json({
                message: "Candidat Change Failed!",
                status: false,
            })
        })
}

exports.editPreSelectedCandidat = async (req, res, next) => {
    //console.log("Editing A Pre-Selected Candidat!");
    //console.log(req.file);
    const {
        candidatId,
        candidatName,
        candidatAge,
        candidatMotivation,
        candidatActivitySector,
        candidatJob,
        candidatLanguages,
        candidatStartDate,
        candidatEndDate,
        candidatLicensePermis,
        candidatConduireEnFrance,
        candidatSkills,
        candidatExperienceDetails,
        candidatEmail,
        candidatPhone,
        candidatAlternatePhone,
        candidatAddress,
        candidatFBURL,
        candidatYearsExperience,
        lieu_mission,
        duree_mission,
        duree_hebdomadaire_mission,
        cmp_candidat,
        contract_date,
        company_contact_name,
        nr_inreg,
        serie_id,
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
        contractId,
    } = JSON.parse(req.body.data);
    let data = {};
    let contractData = {
        lieu_mission: lieu_mission,
        duree_mission: duree_mission,
        duree_hebdomadaire_mission: duree_hebdomadaire_mission,
        cmp_candidat: cmp_candidat,
        contract_date: contract_date,
        company_contact_name: company_contact_name,
        nr_inreg: nr_inreg,
        serie_id: serie_id,
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
        contractId: contractId,
    }
    if (req.file) {
        var image = {
            documentName: req.file.filename,
            originalName: req.file.originalname
        };
        data = {
            candidatName: candidatName,
            candidatAge: candidatAge,
            candidatMotivation: candidatMotivation,
            candidatActivitySector: candidatActivitySector,
            candidatJob: candidatJob,
            candidatLanguages: candidatLanguages,
            candidatStartDate: candidatStartDate,
            candidatEndDate: candidatEndDate,
            candidatLicensePermis: candidatLicensePermis,
            candidatConduireEnFrance: candidatConduireEnFrance,
            candidatSkills: candidatSkills,
            candidatExperienceDetails: candidatExperienceDetails,
            candidatEmail: candidatEmail,
            candidatPhone: candidatPhone,
            candidatAddress: candidatAddress,
            candidatFBURL: candidatFBURL,
            candidatYearsExperience: candidatYearsExperience,
            candidatAlternatePhone: candidatAlternatePhone,
            candidatPhoto: image
        }
    } else {
        var image = {};
        data = {
            candidatName: candidatName,
            candidatAge: candidatAge,
            candidatMotivation: candidatMotivation,
            candidatActivitySector: candidatActivitySector,
            candidatJob: candidatJob,
            candidatLanguages: candidatLanguages,
            candidatStartDate: candidatStartDate,
            candidatEndDate: candidatEndDate,
            candidatLicensePermis: candidatLicensePermis,
            candidatConduireEnFrance: candidatConduireEnFrance,
            candidatSkills: candidatSkills,
            candidatExperienceDetails: candidatExperienceDetails,
            candidatEmail: candidatEmail,
            candidatPhone: candidatPhone,
            candidatAddress: candidatAddress,
            candidatFBURL: candidatFBURL,
            candidatYearsExperience: candidatYearsExperience,
            candidatAlternatePhone: candidatAlternatePhone,
        }
    }

    await Candidat.findByIdAndUpdate(candidatId, data)
        .then((response) => {
            //console.log(response);
            Contract.findByIdAndUpdate(contractId, contractData).then(reponse => {
                return res.status(200).json({
                    message: "Candidat (Pre-Selected) Changed Successfully!",
                    status: true,
                })    
            }).catch((err) => {
                //console.log(err);
                return res.status(400).json({
                message: "Candidat Change Failed!",
                status: false,
                })    
            })
        })
        .catch(err => {
            //console.log(err);
            return res.status(400).json({
                message: "Candidat Change Failed!",
                status: false,
            })
        })
}

exports.editInProgressCandidat = async (req, res, next) => {
    //console.log("Editing A Candidat In-Progress!");
    //console.log(req.body);
    const {
        candidatId,
        candidatName,
        candidatAge,
        candidatMotivation,
        candidatActivitySector,
        candidatJob,
        candidatLanguages,
        candidatStartDate,
        candidatEndDate,
        candidatLicensePermis,
        candidatConduireEnFrance,
        candidatSkills,
        candidatExperienceDetails,
        candidatEmail,
        candidatPhone,
        candidatAlternatePhone,
        candidatAddress,
        candidatFBURL,
        candidatYearsExperience,
        candidatCurrentWork, // includes further JSON of workingFor and Salary fields
        lieu_mission,
        duree_mission,
        duree_hebdomadaire_mission,
        cmp_candidat,
        contract_date,
        company_contact_name,
        nr_inreg,
        serie_id,
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
        contractId,
    } = JSON.parse(req.body.data);
    let data = {}
    let contractData = {
        lieu_mission: lieu_mission,
        duree_mission: duree_mission,
        duree_hebdomadaire_mission: duree_hebdomadaire_mission,
        cmp_candidat: cmp_candidat,
        contract_date: contract_date,
        company_contact_name: company_contact_name,
        nr_inreg: nr_inreg,
        serie_id: serie_id,
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
        contractId: contractId,
    };
    if (req.file) {
        var image = {
            documentName: req.file.filename,
            originalName: req.file.originalname
        };
        data = {
            candidatName: candidatName,
            candidatAge: candidatAge,
            candidatMotivation: candidatMotivation,
            candidatActivitySector: candidatActivitySector,
            candidatJob: candidatJob,
            candidatLanguages: candidatLanguages,
            candidatStartDate: candidatStartDate,
            candidatEndDate: candidatEndDate,
            candidatLicensePermis: candidatLicensePermis,
            candidatConduireEnFrance: candidatConduireEnFrance,
            candidatSkills: candidatSkills,
            candidatExperienceDetails: candidatExperienceDetails,
            candidatEmail: candidatEmail,
            candidatPhone: candidatPhone,
            candidatAlternatePhone: candidatAlternatePhone,
            candidatAddress: candidatAddress,
            candidatFBURL: candidatFBURL,
            candidatYearsExperience: candidatYearsExperience,
            candidatCurrentWork: candidatCurrentWork,
            candidatPhoto: image
        }
    } else {
        var image = {};
        data = {
            candidatName: candidatName,
            candidatAge: candidatAge,
            candidatMotivation: candidatMotivation,
            candidatActivitySector: candidatActivitySector,
            candidatJob: candidatJob,
            candidatLanguages: candidatLanguages,
            candidatStartDate: candidatStartDate,
            candidatEndDate: candidatEndDate,
            candidatLicensePermis: candidatLicensePermis,
            candidatConduireEnFrance: candidatConduireEnFrance,
            candidatSkills: candidatSkills,
            candidatExperienceDetails: candidatExperienceDetails,
            candidatEmail: candidatEmail,
            candidatPhone: candidatPhone,
            candidatAlternatePhone: candidatAlternatePhone,
            candidatAddress: candidatAddress,
            candidatFBURL: candidatFBURL,
            candidatYearsExperience: candidatYearsExperience,
            candidatCurrentWork: candidatCurrentWork
        }
    }

    await Candidat.findByIdAndUpdate(candidatId, data)
        .then((response) => {
            Contract.findByIdAndUpdate(contractId, contractData).then(reponse => {
                return res.status(200).json({
                    message: "Candidat (In-Progress) Changed Successfully!",
                    status: true,
                })    
            }).catch((err) => {
                //console.log(err);
                return res.status(400).json({
                message: "Candidat Change Failed!",
                status: false,
                })    
            })
        })
        .catch(err => {
            //console.log(err);
            return res.status(400).json({
                message: "Candidat Change Failed!",
                status: false,
            })
        })
}

exports.editArchivedCandidat = async (req, res, next) => {
    //console.log("Editing A Candidat Archived!");
    //console.log(req.body);
    const {
        candidatId,
        candidatName,
        candidatAge,
        candidatMotivation,
        candidatActivitySector,
        candidatJob,
        candidatLanguages,
        candidatStartDate,
        candidatEndDate,
        candidatLicensePermis,
        candidatConduireEnFrance,
        candidatSkills,
        candidatExperienceDetails,
        candidatEmail,
        candidatPhone,
        candidatAlternatePhone,
        candidatAddress,
        candidatFBURL,
        candidatYearsExperience,
        candidatArchived,
        lieu_mission,
        duree_mission,
        duree_hebdomadaire_mission,
        cmp_candidat,
        contract_date,
        company_contact_name,
        nr_inreg,
        serie_id,
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
        contractId,
    } = JSON.parse(req.body.data);

    let data = {}
    let contractData = {
        lieu_mission: lieu_mission,
        duree_mission: duree_mission,
        duree_hebdomadaire_mission: duree_hebdomadaire_mission,
        cmp_candidat: cmp_candidat,
        contract_date: contract_date,
        company_contact_name: company_contact_name,
        nr_inreg: nr_inreg,
        serie_id: serie_id,
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
        contractId: contractId,
    };
    if (req.file) {
        var image = {
            documentName: req.file.filename,
            originalName: req.file.originalname
        };
        data = {
            candidatName: candidatName,
            candidatAge: candidatAge,
            candidatMotivation: candidatMotivation,
            candidatActivitySector: candidatActivitySector,
            candidatJob: candidatJob,
            candidatLanguages: candidatLanguages,
            candidatStartDate: candidatStartDate,
            candidatEndDate: candidatEndDate,
            candidatLicensePermis: candidatLicensePermis,
            candidatConduireEnFrance: candidatConduireEnFrance,
            candidatSkills: candidatSkills,
            candidatExperienceDetails: candidatExperienceDetails,
            candidatEmail: candidatEmail,
            candidatPhone: candidatPhone,
            candidatAlternatePhone: candidatAlternatePhone,
            candidatAddress: candidatAddress,
            candidatFBURL: candidatFBURL,
            candidatYearsExperience: candidatYearsExperience,
            candidatArchived: candidatArchived,
            candidatPhoto: image
        }
    } else {
        var image = {};
        data = {
            candidatName: candidatName,
            candidatAge: candidatAge,
            candidatMotivation: candidatMotivation,
            candidatActivitySector: candidatActivitySector,
            candidatJob: candidatJob,
            candidatLanguages: candidatLanguages,
            candidatStartDate: candidatStartDate,
            candidatEndDate: candidatEndDate,
            candidatLicensePermis: candidatLicensePermis,
            candidatConduireEnFrance: candidatConduireEnFrance,
            candidatSkills: candidatSkills,
            candidatExperienceDetails: candidatExperienceDetails,
            candidatEmail: candidatEmail,
            candidatPhone: candidatPhone,
            candidatAlternatePhone: candidatAlternatePhone,
            candidatAddress: candidatAddress,
            candidatFBURL: candidatFBURL,
            candidatYearsExperience: candidatYearsExperience,
            candidatArchived: candidatArchived
        }
    }

    await Candidat.findByIdAndUpdate(candidatId, data)
        .then((response) => {
            //console.log(response);
            Contract.findByIdAndUpdate(contractId, contractData).then(reponse => {
                return res.status(200).json({
                    message: "Candidat (Archived) Changed Successfully!",
                    status: true,
                })    
            }).catch((err) => {
                //console.log(err);
                return res.status(400).json({
                message: "Candidat Change Failed!",
                status: false,
                })    
            })
        })
        .catch(err => {
            //console.log(err);
            return res.status(400).json({
                message: "Candidat Change Failed!",
                status: false
            })
        })
}

// Filters 
exports.filterToDoCandidatByLanguages = async (req, res, next) => {
    //console.log("Filtering Candidats By Languages ... ");
    let langs = req.query.languages
    langs = langs.split(",")
    let results = await Candidat.find({ candidatLanguages: { $in: langs }, candidatStatus: "To-Do" })
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

exports.filterToDoBySector = async (req, res, next) => {
    let { sector } = req.query;
    let results = await Candidat.find({
        candidatStatus: 'To-Do',
        candidatActivitySector: sector
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

exports.filterToDoSectorJob = async (req, res, next) => {
    //console.log(req.query);
    let { sector, jobs } = req.query;
    //console.log(sector, jobs);
    jobs = jobs.split(",")
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatJob: jobs,
        candidatStatus: "To-Do"
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

exports.filterToDoSectorLanguage = async (req, res, next) => {
    //console.log(req.query);
    let { sector, languages } = req.query;
    //console.log(sector, languages);
    languages = languages.split(",")
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatStatus: "To-Do",
        candidatLanguages: {
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

exports.filterToDoSectorJobLanguage = async (req, res, next) => {
    let { sector, jobs, languages } = req.query;
    jobs = jobs.split(",")
    languages = languages.split(",")
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatJob: {
            $in: jobs
        },
        candidatStatus: "To-Do",
        candidatLanguages: {
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

exports.filterInProgressCandidatByLanguages = async (req, res, next) => {
    //console.log("Filtering Candidats By Languages ... ");
    let langs = req.query.languages
    langs = langs.split(",")
    let results = await Candidat.find({ candidatLanguages: { $in: langs }, candidatStatus: "In-Progress" })
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

exports.filterInProgressBySector = async (req, res, next) => {
    let { sector } = req.query;
    let results = await Candidat.find({
        candidatStatus: 'In-Progress',
        candidatActivitySector: sector
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

exports.filterInProgressSectorLanguage = async (req, res, next) => {
    //console.log(req.query);
    let { sector, languages } = req.query;
    //console.log(sector, languages);
    languages = languages.split(",")
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatStatus: "In-Progress",
        candidatLanguages: {
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

exports.filterInProgressSectorJob = async (req, res, next) => {
    //console.log(req.query);
    let { sector, jobs } = req.query;
    jobs = jobs.split(",");
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatJob: jobs,
        candidatStatus: "In-Progress"
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

exports.filterInProgressSectorJobLanguage = async (req, res, next) => {
    //console.log(req.query);
    let { sector, jobs, languages } = req.query;
    //console.log(sector, jobs, languages);
    jobs = jobs.split(",")
    languages = languages.split(",")
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatJob: jobs,
        candidatStatus: "In-Progress",
        candidatLanguages: {
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

exports.filterArchivedCandidatByLanguages = async (req, res, next) => {
    //console.log("Filtering Candidats By Languages ... ");
    let langs = req.query.languages
    langs = langs.split(",")
    let results = await Candidat.find({ candidatLanguages: { $in: langs }, candidatStatus: "Archived" })
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

exports.filterArchivedBySector = async (req, res, next) => {
    let { sector } = req.query;
    let results = await Candidat.find({
        candidatStatus: 'Archived',
        candidatActivitySector: sector
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

exports.filterArchivedSectorLanguage = async (req, res, next) => {
    //console.log(req.query);
    let { sector, languages } = req.query;
    //console.log(sector, languages);
    languages = languages.split(",")
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatStatus: "Archived",
        candidatLanguages: {
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

exports.filterArchivedSectorJob = async (req, res, next) => {
    //console.log(req.query);
    let { sector, jobs } = req.query;
    jobs = jobs.split(",")
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatJob: jobs,
        candidatStatus: "Archived"
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

exports.filterArchivedSectorJobLanguage = async (req, res, next) => {
    //console.log(req.query);
    let { sector, jobs, languages } = req.query;
    jobs = jobs.split(",");
    languages = languages.split(",");
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatJob: jobs,
        candidatStatus: "Archived",
        candidatLanguages: {
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

exports.filterPreSelectedCandidatByLanguages = async (req, res, next) => {
    //console.log("Filtering Candidats By Languages ... ");
    let langs = req.query.languages
    langs = langs.split(",")
    let results = await Candidat.find({ candidatLanguages: { $in: langs }, candidatStatus: "Pre-Selected" })
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
