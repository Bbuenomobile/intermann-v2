const Candidat = require("../models/candidat");
const bcrypt = require("bcryptjs");
const client = require("../models/client");
const Contract = require("../models/contractCandidat");
const fs = require("fs");
const { json } = require("body-parser");
const cloudinary = require("cloudinary").v2;
const nodemailer = require("nodemailer");

const mailList = ["nikhilsunil90s@gmail.com", "contact@ris-international.com", "pj.darche@ris-international.com", "contact@intermann.ro"];
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

cloudinary.config({
    cloud_name: 'dj06tvfjt',
    api_key: '122145526342654',
    api_secret: 'PgTTOnNXzbw2mcSVgCob59JBi6A'
});

exports.checkCandidatExists = async (req, res, next) => {
    let params = req.query
    let query = {};
    Object.keys(params).map((k) => {
        if (k == 'candidatPhone') {
            params[k] = '+' + params[k];
        }
        query[k] = params[k];
    })
    console.log(query);
    let results = await Candidat.find(query)
    //console.log(results);
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            total: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            total: 0,
            data: []
        })
    }
}

exports.renameCandidatLink = async (req, res, next) => {
    const { linkId, newName } = req.body;
    await Candidat.findOneAndUpdate({
        "candidatLinks._id": linkId
    }, {
        $set: {
            "candidatLinks.$.displayName": newName
        }
    }).then(response => {
        //console.log(response);
        return res.status(200).json({
            status: true,
            message: "Renamed Successfully!"
        })
    }).catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: "Rename Failed!"
        })
    })
}

exports.allCandidatLinks = async (req, res, next) => {
    const { candidatId } = req.query;
    await Candidat.findOne({ _id: candidatId }, 'candidatLinks').then(response => {
        //console.log(response);
        let links = response.candidatLinks;
        return res.status(200).json({
            status: true,
            data: links
        })
    })
        .catch(err => {
            //console.log(err);
            return res.status(400).json({
                status: false,
                data: []
            })
        })
}

exports.changeEmployeeSalary = async (req, res, next) => {
    const { candidatId, currentWorkId, currentSalary, newSalary } = req.body;
    //console.log(candidatId, currentSalary,  newSalary);
    await Candidat.findOneAndUpdate({ "candidatCurrentWork._id": currentWorkId }, {
        "candidatCurrentWork.$.salary": newSalary
    })
        .then(response => {
            //console.log(response);
            return res.status(200).json({
                status: true,
                message: 'Salary Saved!'
            })
        })
        .catch(err => {
            //console.log(err);
            return res.status(400).json({
                status: false,
                message: 'Salary Not Saved! Please Try Again'
            })
        })
}

// Fetchers
exports.getProfiles = async (req, res, next) => {
    const { search } = req.query;

    const regex = new RegExp(search, 'i');

    let profiles = [];
    let candidatResults = await Candidat.find({
        $or: [
            { candidatName: regex },
            { candidatPhone: regex },
            { candidatJob: regex },
            { candidatActivitySector: regex }
        ]
    }).populate({ path: "candidatPreSelectedFor.clientId", model: client }).exec();

    let clientResults = await client.find({
        $or: [
            { clientCompanyName: regex },
            { clientPhone: regex },
            { clientJob: regex },
            { clientActivitySector: regex }
        ]
    }).populate({ path: "employeesWorkingUnder", model: Candidat }).exec();

    if (candidatResults.length) {
        profiles = [...candidatResults];
    }

    if (clientResults.length) {
        profiles = [...profiles, ...clientResults];
    }

    return res.status(200).json({
        status: true,
        total: profiles.length,
        data: profiles
    });
}

exports.getCandidatsByClient = async (req, res, next) => {
    const { clientCompanyName } = req.query;
    try {
        let results = await client.find({
            clientCompanyName: clientCompanyName
        })
            .populate("employeesWorkingUnder")
            .exec()

        // ////console.log(results);
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
        ////console.log(err)
        res.status(500).send("Fetch Error!");
    }
}

exports.getCandidatsByPhoneNumber = async (req, res, next) => {
    const { phoneNumber } = req.query
    ////console.log(phoneNumber);
    let results = await Candidat.find({ candidatPhone: "+" + phoneNumber.trim() }).exec()
    if (!results) {
        return res.status(400).json({
            status: false,
            data: []
        })
    } else {
        ////console.log(results);
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            length: results.length,
            total: results.length,
            readyToWorkLength: filteredResults.length,
            data: results
        })
    }
}

exports.fetchCandidatRecommendations = async (req, res, next) => {
    const { clientSector } = req.query

    let results = await Candidat.find({ candidatActivitySector: clientSector, candidatStatus: 'To-Do' }).exec()
    if (results) {
        ////console.log(results)
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

exports.getClientsForFilter = async (req, res, next) => {

    let result = await client.find({ employeesWorkingUnder: { $nin: [null, []] } }).populate("employeesWorkingUnder").exec()

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
    const result = await Candidat.findById(candidatId).populate("candidatContract").exec();

    if (result) {
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
}

exports.getCandidatDetailsById = async (req, res, next) => {
    const { candidatId
    } = req.query;
    ////console.log(candidatId)
    Candidat.findById(candidatId).populate("candidatContract").exec().then(result => {
        if (result) {
            // ////console.log(result)
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
            ////console.log(err);
            return res.status(400).json({
                status: false,
                data: result
            })
        })
}

exports.getCandidats = async (req, res, next) => {
    let params = req.query;
    let skip = params.skip; // send skip from FE always
    let query = {};
    Object.keys(params).map((k) => {
        if (k === 'enteredBy') {
            query[k] = { $in: params[k].split(',') };
        } else if (k === 'candidatLanguages') {
            query[k] = params[k].split(',');
        } else {
            query[k] = params[k];
        }
    })
    // add check for candidat languages
    let results = await Candidat
        .find(query)
        .sort({ createdAt: -1, updatedAt: -1 })
        .skip(skip)
        .limit(20)
        .exec();
    if (results.length > 0) {
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            length: results.length,
            total: results.length,
            readyToWorkLength: filteredResults.length,
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
    ////console.log(req.file, req.body)
    const { candidatId } = req.body;
    let locaFilePath = req.file.filename;
    var result = await uploadToCloudinary(locaFilePath);
    if (req.file) {
        var image = {
            documentName: req.file.filename,
            originalName: req.file.originalname,
            url: result.url,
            file_public_id: result.public_id
        };
        await Candidat.findByIdAndUpdate(candidatId, {
            candidatPhoto: image
        })
            .then((reData) => {
                return res.status(200).json({
                    status: true,
                    fileName: req.file.filename,
                    url: result.url,
                    message: 'Image Uploaded Successfully!'
                })
            })
            .catch(err => {
                ////console.log(err)
                return res.status(200).json({
                    status: false,
                    message: 'Image Not Uploaded!'
                })
            })
    }
}

async function uploadToCloudinary(locaFilePath) {
    var mainFolderName = "uploads"
    var filePathOnCloudinary = mainFolderName + "/" + locaFilePath

    return cloudinary.uploader.upload(filePathOnCloudinary, { "public_id": locaFilePath, "resource_type": "auto" })
        .then((result) => {
            return {
                message: "Success",
                url: result.url,
                public_id: result.public_id,
            };
        }).catch((error) => {
            return { message: "Fail", };
        });
}

// Document Uploaders
exports.uploadCandidatDocuments = async (req, res, next) => {
    ////console.log("*******************************");
    ////console.log(req.file, req.body)
    const { candidatId, folderName } = req.body;
    let locaFilePath = req.file.filename;
    var result = await uploadToCloudinary(locaFilePath);
    //console.log(result.url, typeof(result.url));
    if (req.file) {
        await Candidat.findByIdAndUpdate(candidatId, {
            $push: {
                candidatDocuments: {
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
                    folderName: folderName,
                    message: 'File Uploaded Successfully!'
                })
            })
            .catch(err => {
                ////console.log(err)
                return res.status(400).json({
                    status: false,
                    message: 'Upload Failed!'
                })
            })
    }
}

exports.renameCandidatDocument = async (req, res, next) => {
    const { documentId, newName, candidatId } = req.query
    ////console.log(documentId, newName, candidatId);
    Candidat.findById(candidatId)
        .then(result => {
            ////console.log(result)
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
            ////console.log(newDocs);
            Candidat.findByIdAndUpdate(candidatId, {
                $set: { candidatDocuments: newDocs }
            })
                .then(success => {
                    ////console.log(success)
                    return res.status(200).json({
                        status: true,
                        doc: newName,
                        message: 'Document Renamed Successfully!'
                    })
                })
                .catch(err => {
                    ////console.log(err)
                    return res.status(400).json({
                        status: false,
                        message: 'Document Rename Failed!'
                    })
                })

        })
        .catch(err => {
            ////console.log(err)
            return res.status(400).json({
                status: false,
                message: 'Document Delete Failed!'
            })
        })
}

exports.deleteCandidatDocument = async (req, res, next) => {
    const { documentId, documentName, candidatId } = req.query
    ////console.log(documentId, documentName, candidatId);
    cloudinary.uploader.destroy(documentName, { invalidate: true, resource_type: "raw" }, (resul) => {
        //console.log(resul);

    });
    Candidat.findByIdAndUpdate(candidatId, {
        $pull: {
            candidatDocuments: { _id: documentId }
        }
    })
        .then(result => {
            ////console.log(result)
            var filePath = "uploads/" + documentName
            fs.unlinkSync(filePath)
            return res.status(200).json({
                status: true,
                doc: documentName,
                message: 'Document Deleted Successfully!'
            })
        })
        .catch(err => {
            ////console.log(err)
            return res.status(400).json({
                status: false,
                message: 'Document Delete Failed!'
            })
        })
}

//LInk Documents Add
exports.addCandidatLink = async (req, res, next) => {
    const { candidatId, link, folder } = req.body;
    await Candidat.findByIdAndUpdate(candidatId, {
        $push: {
            candidatLinks: {
                link: link,
                folder: folder
            }
        }
    })
        .then(addRes => {
            //console.log(addRes);
            return res.status(200).json({
                status: true,
                link: link,
                folder: folder,
                message: 'Link Added Successfully!'
            })
        })
        .catch(err => {
            //console.log(err);
            return res.status(400).json({
                status: false,
                message: 'Link Not Added! Please Try Again.'
            })
        })
}

exports.removeCandidatLink = async (req, res, next) => {
    //console.log(req.body);
    const { candidatId, linkId } = req.body;
    //console.log(candidatId, linkId)
    await Candidat.findByIdAndUpdate(candidatId, {
        $pull: {
            candidatLinks: { _id: linkId }
        }
    })
        .then(addRes => {
            //console.log(addRes);
            return res.status(200).json({
                status: true,
                message: 'Link Removed Successfully!'
            })
        })
        .catch(err => {
            //console.log(err);
            return res.status(400).json({
                status: false,
                message: 'Link Not Removed! Please Try Again.'
            })
        })
}

exports.transferCandidateToRIS = async (req, res, next) => {
    const { candidatId } = req.body;
    let response = await Candidat.findByIdAndUpdate(candidatId, {
        transferredToRIS: true
    }, { new: true })

    if (response) {
        let experienceRows = '';
        response.candidatExperienceDetails.map((exp) => {
            experienceRows += `<tr>
                                    <td style="border: 1px solid black; text-align: center;">${exp.period}</td>
                                    <td style="border: 1px solid black; text-align: center;">${exp.location}</td>
                                    <td style="border: 1px solid black; text-align: center;">${exp.workDoneSample}</td>
                                </tr>`
        });

        const mailData = {
            from: 'intermanncrm@gmail.com',  // sender address
            to: mailList,   // list of receivers
            subject: `Un candidat travailleur a été ajouté pour RIS par Intermann`,
            text: 'That was easy!',
            html: `Bonjour l'équipe RIS,<br> Nous avons ajouté le candidat <b>${response.candidatName}</b> pour le métier de ${response.candidatJob ? response.candidatJob : '<b>No Job<b>'} et qui à l'age de ${response.candidatAge ? response.candidatAge : '<b>No Age</b>'}  qui peut intéresser RIS, vous trouverez tous les détails ici : <br>
                    https://intermann.herokuapp.com/ris-candidates <br>
                    Email : <b>pj.darche@ris-international.com</b> <br>
                    Mot de Passe : <b>pjdarche2025</b>,<br>
                    Experience Details : <br>
                    <table style="width:100%; border: 1px solid black; border-collapse: collapse;">
                        <tr>
                            <th style="border: 1px solid black; background-color: #f2f2f2;">Period</th>
                            <th style="border: 1px solid black; background-color: #f2f2f2;">Location</th>
                            <th style="border: 1px solid black; background-color: #f2f2f2;">Job</th>
                        </tr>
                        ${experienceRows}
                    </table>
                `
        };
        transporter.sendMail(mailData, (err, info) => {
            if (err) {
                //console.log("In If - ",err)
            } else {
                //console.log("In If - ",info)
            }
        });

        return res.status(200).json({
            status: true,
            message: "Candidate Transferred to RIS Successfully!"
        })
    } else {
        return res.status(400).json({
            status: false,
            message: "Candidate Transfer to RIS Failed!"
        })
    }
}

exports.getRISCandidates = async (req, res, next) => {
    let params = req.query;
    let skip = params.skip;

    let results = await Candidat
        .find({ transferredToRIS: true })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(20)
        .exec()

    if (results) {
        return res.status(200).json({
            status: true,
            total: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            totl: 0,
            data: []
        })
    }
}

exports.deleteRISCandidate = async (req, res, next) => {
    const { candidatId, reasonForNotSelecting } = req.body;
    let response = await Candidat.findByIdAndUpdate(candidatId, {
        transferredToRIS: false,
        reasonByRisForNotSelecting: reasonForNotSelecting
    }, { new: true });

    if (response) {
        const mailData = {
            from: 'intermanncrm@gmail.com',  // sender address
            to: mailList,   // list of receivers
            subject: `RIS n'accepte pas le candidat ${response.candidatName}`,
            text: 'That was easy!',
            html: `Bonjour, <br>RIS a décidé de ne PAS accepté le candidat ${response.candidatName}  dont le métier est ${response.candidatJob} et l'age est ${response.candidatAge} . <br> 
                    La raison de ce refus selon RIS est : <br>
                    <b>${reasonForNotSelecting}</b> <br>
                `
        };
        transporter.sendMail(mailData, (err, info) => {
            if (err) {
                //console.log("In If - ",err)
            } else {
                //console.log("In If - ",info)
            }
        });

        return res.status(200).json({
            status: true,
            message: "Candidate Deleted from RIS Successfully!"
        })
    } else {
        return res.status(400).json({
            status: false,
            message: "Candidate Delete from RIS Failed!"
        })
    }
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
    const newCount = await Candidat.find({
        candidatStatus: "New"
    })
    const contactedCount = await Candidat.find({
        candidatStatus: "Contacted"
    });
    const interestedCount = await Candidat.find({
        candidatStatus: "Interested"
    });
    const hiredCount = await Candidat.find({
        candidatStatus: "Hired"
    });
    const firedCount = await Candidat.find({
        candidatStatus: "Fired"
    });
    const collectingDocsCount = await Candidat.find({
        candidatStatus: "Collecting Docs"
    });
    const noAnswerCount = await Candidat.find({
        candidatStatus: "No Answer"
    });
    const deniedCount = await Candidat.find({
        candidatStatus: "Denied"
    });
    const finishedCount = await Candidat.find({
        candidatStatus: "Finished"
    });
    const deadLeadsCount = await Candidat.find({
        candidatStatus: "Dead Leads"
    });

    return res.status(200).json({
        message: "All Counts Found!",
        toDoCount: toDoCount.length,
        inProgressCount: inProgressCount.length,
        archivedCount: archivedCount.length,
        preSelectedCount: preSelectedCount.length,
        newCount: newCount.length,
        contactedCount: contactedCount.length,
        interestedCount: interestedCount.length,
        hiredCount: hiredCount.length,
        firedCount: firedCount.length,
        collectingDocsCount: collectingDocsCount.length,
        noAnswerCount: noAnswerCount.length,
        deniedCount: deniedCount.length,
        finishedCount: finishedCount.length,
        deadLeadsCount: deadLeadsCount.length
    });

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
    ////console.log(candidatName)
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
    ////console.log("Adding A Candidat!");
    ////console.log(req.body);
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
        ////console.log(candidatActivitySector)
        candidatActivitySector = ""
    }
    ////console.log(candidatActivitySector, candidatEmail)
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
            ////console.log(err)
            return res
                .status(400)
                .json({
                    error: "INTERNAL_SERVER_ERROR",
                    message: "Error in Saving Candidat!",
                    status: false
                })
        })

}

exports.editCandidat = async (req, res, next) => {
    const { _id } = req.query;
    const updateFields = req.body;
    if (!_id) {
        return res.status(400).json({
            status: false,
            message: "Candidate ID is required!"
        });
    }

    try {
        const updatedCandidat = await Candidat.findByIdAndUpdate(_id, updateFields, { new: true });

        if (req.body.contractId) {
            const contractUpdateFields = req.body.contract;
            await Contract.findByIdAndUpdate(req.body.contractId, contractUpdateFields, { new: true });
        }

        if (!updatedCandidat) {
            return res.status(404).json({
                status: false,
                message: "Candidate not found!"
            });
        }

        return res.status(200).json({
            status: true,
            message: "Candidate updated successfully!",
            data: updatedCandidat
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
}

// Send id in query to view Candidate
exports.viewCandidat = async (req, res, next) => {
    ////console.log("Finding A Candidat ... ");
    ////console.log(req.query);
    const foundCandidat = await Candidat.findById(req.query.id)
    return res.status(200).json({
        message: "Candidat Found",
        candidat: foundCandidat
    })
}

exports.viewToDoCandidats = async (req, res, next) => {
    ////console.log("List, Skip & Limit To-Do Candidates ... ");
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
    ////console.log("List All To-Do Candidates ... ");
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

exports.viewPreSelectedCandidats = async (req, res, next) => {
    ////console.log("List All Pre-Selected Candidates ... ");
    let skip = req.query.skip;
    try {
        let candidates = await Candidat.find({
            candidatStatus: "Pre-Selected"
        }).populate({ path: "candidatPreSelectedFor.clientId", model: client }).sort({ createdAt: -1 }).skip(skip).limit(20).exec();
        ////console.log(candidates);
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

exports.viewAllPreSelectedCandidats = async (req, res, next) => {
    ////console.log("List All Pre-Selected Candidates ... ");
    try {
        let candidates = await Candidat.find({
            candidatStatus: "Pre-Selected"
        }).populate({ path: "candidatPreSelectedFor.clientId", model: client }).sort({ createdAt: -1 }).exec();
        ////console.log(candidates);
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
    ////console.log("List All In-Progress Candidates ... ");
    let skip = req.query.skip;
    try {
        let candidates = await Candidat.find({
            candidatStatus: "In-Progress"
        }).populate({ path: "candidatPreSelectedFor.clientId", model: client }).sort({ createdAt: -1 }).skip(skip).limit(20).exec();
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
    ////console.log("List All In-Progress Candidates ... ");
    try {
        let candidates = await Candidat.find({
            candidatStatus: "In-Progress"
        }).populate({ path: "candidatPreSelectedFor.clientId", model: client }).sort({ createdAt: -1 }).exec();
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
    ////console.log("List All Archived Candidates ... ");
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
    ////console.log("List All Archived Candidates ... ");
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

exports.changeStatus = async (req, res, next) => {
    const { candidatId, status } = req.body;

    if (["Fired", "Denied", "Dead Lead"].includes(status)) {
        const { reasonToArchive } = req.body;

        await Candidat.updateOne({
            _id: candidatId
        }, {
            $set: {
                candidatArchived: {
                    reason: reasonToArchive
                },
                candidatStatus: status,
                candidatPreSelectedFor: [],
                candidatCurrentWork: []
            }
        })
            .then(response => {
                return res.status(200).json({
                    message: `Candidat Moved to ${status} Successfully!`,
                    status: true
                })
            })
            .catch(err => {
                return res.status(400).json({
                    message: "Status Change Not Successful. Try Again Later!",
                    status: false
                })
            })
    } else {
        await Candidat.updateOne({
            _id: candidatId
        }, {
            $set: {
                candidatStatus: status,
                candidatArchived: null
            }
        })
            .then(async response => {
                return res
                    .status(200)
                    .json({
                        message: `Candidat Moved to ${status} Successfully!`,
                        status: true
                    })
            })
            .catch(err => {
                return res
                    .status(400)
                    .json({
                        message: "Status Change Not Successful. Try Again Later!",
                        status: false
                    })
            })
    }
}

//move to todo/reset
exports.moveToToDo = async (req, res, next) => {
    ////console.log("Reset Candidat Status ...");
    const { candidatId } = req.body;
    await Candidat.updateOne({
        _id: candidatId
    }, {
        $set: {
            candidatStatus: "To-Do",
            candidatCurrentWork: [],
            candidatPreSelectedFor: [],
            candidatArchived: {}
        }
    })
        .then(async response => {
            //console.log(response);
            client.updateMany({ employeesWorkingUnder: { "$in": [candidatId] } }, { $pull: { employeesWorkingUnder: candidatId } })
                .then(resdata => {
                    //console.log(resdata);
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
        })
        .catch(err => {
            ////console.log(err);
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
    console.log(req.body)
    const data = {
        clientId: clientId,
        reasonForPreSelection: reason
    }
    await Candidat.updateOne({
        _id: candidatId
    }, {
        $set: {
            candidatStatus: "Collecting Docs"
        },
        $push: {
            candidatPreSelectedFor: data
        }
    })
        .then(async response => {
            return res
                .status(200)
                .json({
                    message: "Candidat Moved To Pre-Selected Successfully!",
                    status: true
                })
        })
        .catch(err => {
            ////console.log(err);
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
    ////console.log("Changing Candidat Status ...");
    const { candidatId, workingFor, workingSince, salary } = req.body;
    //console.log(candidatId, workingFor, workingSince, salary );
    await Candidat.updateOne({
        _id: candidatId
    }, {
        $set: {
            candidatCurrentWork: {
                workingFor: workingFor,
                workingSince: workingSince,
                salary: salary
            },
            candidatStatus: "Hired",
            candidatArchived: null,
            candidatPreSelectedFor: []
        }
    })
        .then(async response => {
            //console.log(response);
            await client.updateOne({
                clientCompanyName: workingFor,
                employeesWorkingUnder: { $nin: [candidatId] },
            }, {
                $push: {
                    employeesWorkingUnder: candidatId,
                }
            })
                .then(responsenew => {
                    return res
                        .status(200)
                        .json({
                            message: "Candidat Moved To In-Progress Successfully!",
                            status: true
                        })
                })
        })
        .catch(err => {
            ////console.log(err);
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
    ////console.log("Changing Candidat Status to Archived ... ");
    const { candidatId, reasonToArchive } = req.body;
    ////console.log(candidatId, reasonToArchive);

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
            ////console.log(response);
            return res.status(200).json({
                message: "Candidat Archived Successfully!",
                status: true
            })
        })
        .catch(err => {
            ////console.log(err);
            return res.status(400).json({
                message: "Update Not Successfull, Try Again Later!",
                status: false
            })
        })
}

// Body Required
exports.editToDoCandidat = async (req, res, next) => {
    //console.log("Editing A To-Do Candidat!");
    //console.log("Body - ",req.body);
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
        employee_hosting
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
        employee_hosting: employee_hosting
    }
    ////console.log("contract data - ",contractData);
    if (req.file) {
        let locaFilePath = req.file.filename;
        var reslt = await uploadToCloudinary(locaFilePath);

        var image = {
            documentName: req.file.filename,
            originalName: req.file.originalname,
            url: reslt.url,
            file_public_id: reslt.public_id

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
                    message: "Candidat (To-Do) Changed Successfully!",
                    status: true,
                })
            }).catch((err) => {
                ////console.log(err);
                return res.status(400).json({
                    message: "Candidat Change Failed!",
                    status: false,
                })
            })
        })
        .catch(err => {
            ////console.log(err);
            return res.status(400).json({
                message: "Candidat Change Failed!",
                status: false,
            })
        })
}

exports.editPreSelectedCandidat = async (req, res, next) => {
    ////console.log("Editing A Pre-Selected Candidat!");
    ////console.log(req.file);
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
        employee_hosting,
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
        employee_hosting: employee_hosting,
    }
    if (req.file) {
        let locaFilePath = req.file.filename;
        var reslt = await uploadToCloudinary(locaFilePath);
        var image = {
            documentName: req.file.filename,
            originalName: req.file.originalname,
            url: reslt.url,
            file_public_id: reslt.public_id
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
            ////console.log(response);
            Contract.findByIdAndUpdate(contractId, contractData).then(reponse => {
                return res.status(200).json({
                    message: "Candidat (Pre-Selected) Changed Successfully!",
                    status: true,
                })
            }).catch((err) => {
                ////console.log(err);
                return res.status(400).json({
                    message: "Candidat Change Failed!",
                    status: false,
                })
            })
        })
        .catch(err => {
            ////console.log(err);
            return res.status(400).json({
                message: "Candidat Change Failed!",
                status: false,
            })
        })
}

exports.editInProgressCandidat = async (req, res, next) => {
    ////console.log("Editing A Candidat In-Progress!");
    ////console.log(req.body);
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
        iban_euro,
        bankName_euro,
        iban_ron_lei,
        bankName_lei,
        employee_hosting,
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
        employee_hosting: employee_hosting
    };
    if (req.file) {
        let locaFilePath = req.file.filename;
        var reslt = await uploadToCloudinary(locaFilePath);

        var image = {
            documentName: req.file.filename,
            originalName: req.file.originalname,
            url: reslt.url,
            file_public_id: reslt.public_id
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
            iban_euro: iban_euro,
            bankName_euro: bankName_euro,
            iban_ron_lei: iban_ron_lei,
            bankName_lei: bankName_lei,
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
            candidatCurrentWork: candidatCurrentWork,
            iban_euro: iban_euro,
            bankName_euro: bankName_euro,
            iban_ron_lei: iban_ron_lei,
            bankName_lei: bankName_lei,
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
                ////console.log(err);
                return res.status(400).json({
                    message: "Candidat Change Failed!",
                    status: false,
                })
            })
        })
        .catch(err => {
            ////console.log(err);
            return res.status(400).json({
                message: "Candidat Change Failed!",
                status: false,
            })
        })
}

exports.editArchivedCandidat = async (req, res, next) => {
    ////console.log("Editing A Candidat Archived!");
    ////console.log(req.body);
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
        employee_hosting,
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
        employee_hosting: employee_hosting,
    };

    if (req.file) {
        let locaFilePath = req.file.filename;
        var reslt = await uploadToCloudinary(locaFilePath);

        var image = {
            documentName: req.file.filename,
            originalName: req.file.originalname,
            url: reslt.url,
            file_public_id: reslt.public_id
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
            ////console.log(response);
            Contract.findByIdAndUpdate(contractId, contractData).then(reponse => {
                return res.status(200).json({
                    message: "Candidat (Archived) Changed Successfully!",
                    status: true,
                })
            }).catch((err) => {
                ////console.log(err);
                return res.status(400).json({
                    message: "Candidat Change Failed!",
                    status: false,
                })
            })
        })
        .catch(err => {
            ////console.log(err);
            return res.status(400).json({
                message: "Candidat Change Failed!",
                status: false
            })
        })
}

// Filters 
exports.filterToDoCandidatByLanguages = async (req, res, next) => {
    ////console.log("Filtering Candidats By Languages ... ");
    let langs = req.query.languages
    langs = langs.split(",")
    let results = await Candidat.find({ candidatLanguages: { $in: langs }, candidatStatus: "To-Do" })
    ////console.log(results.length);

    if (results.length > 0) {
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
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
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
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
    ////console.log(req.query);
    let { sector, jobs } = req.query;
    ////console.log(sector, jobs);
    jobs = jobs.split(",")
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatJob: jobs,
        candidatStatus: "To-Do"
    })

    if (results.length > 0) {
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
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
    ////console.log(req.query);
    let { sector, languages } = req.query;
    ////console.log(sector, languages);
    languages = languages.split(",")
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatStatus: "To-Do",
        candidatLanguages: {
            $in: languages
        }
    })

    ////console.log(results)
    if (results.length > 0) {
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
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
    ////console.log(results);
    if (results.length > 0) {
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.filterToDoSectorJobMotivation = async (req, res, next) => {
    let { sector, jobs, motivation } = req.query;
    jobs = jobs.split(",")
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatJob: {
            $in: jobs
        },
        candidatStatus: "To-Do",
        candidatMotivation: motivation
    })
    ////console.log(results);
    if (results.length > 0) {
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.filterToDoSectorJobLicence = async (req, res, next) => {
    let { sector, jobs, licence } = req.query;
    jobs = jobs.split(",")
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatJob: {
            $in: jobs
        },
        candidatStatus: "To-Do",
        candidatLicensePermis: licence
    })
    ////console.log(results);
    if (results.length > 0) {
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
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
    ////console.log("Filtering Candidats By Languages ... ");
    let langs = req.query.languages
    langs = langs.split(",")
    let results = await Candidat.find({ candidatLanguages: { $in: langs }, candidatStatus: "In-Progress" })
    ////console.log(results.length);
    if (results.length > 0) {
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
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
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
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
    ////console.log(req.query);
    let { sector, languages } = req.query;
    ////console.log(sector, languages);
    languages = languages.split(",")
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatStatus: "In-Progress",
        candidatLanguages: {
            $in: languages
        }
    })
    if (results.length > 0) {
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
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
    ////console.log(req.query);
    let { sector, jobs } = req.query;
    jobs = jobs.split(",");
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatJob: jobs,
        candidatStatus: "In-Progress"
    })
    if (results.length > 0) {
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
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
    ////console.log(req.query);
    let { sector, jobs, languages } = req.query;
    ////console.log(sector, jobs, languages);
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
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.filterInProgressSectorJobMotivation = async (req, res, next) => {
    let { sector, jobs, motivation } = req.query;
    jobs = jobs.split(",")
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatJob: {
            $in: jobs
        },
        candidatStatus: "In-Progress",
        candidatMotivation: motivation
    })
    ////console.log(results);
    if (results.length > 0) {
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.filterInProgressSectorJobLicence = async (req, res, next) => {
    let { sector, jobs, licence } = req.query;
    jobs = jobs.split(",")
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatJob: {
            $in: jobs
        },
        candidatStatus: "In-Progress",
        candidatLicensePermis: licence
    })
    ////console.log(results);
    if (results.length > 0) {
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
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
    ////console.log("Filtering Candidats By Languages ... ");
    let langs = req.query.languages
    langs = langs.split(",")
    let results = await Candidat.find({ candidatLanguages: { $in: langs }, candidatStatus: "Archived" })
    ////console.log(results.length);
    if (results.length > 0) {
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
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
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
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
    ////console.log(req.query);
    let { sector, languages } = req.query;
    ////console.log(sector, languages);
    languages = languages.split(",")
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatStatus: "Archived",
        candidatLanguages: {
            $in: languages
        }
    })
    if (results.length > 0) {
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
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
    ////console.log(req.query);
    let { sector, jobs } = req.query;
    jobs = jobs.split(",")
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatJob: jobs,
        candidatStatus: "Archived"
    })
    if (results.length > 0) {
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
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
    ////console.log(req.query);
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
    ////console.log(results);
    if (results.length > 0) {
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.filterArchivedSectorJobMotivation = async (req, res, next) => {
    let { sector, jobs, motivation } = req.query;
    jobs = jobs.split(",")
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatJob: {
            $in: jobs
        },
        candidatStatus: "Archived",
        candidatMotivation: motivation
    })
    ////console.log(results);
    if (results.length > 0) {
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.filterArchivedSectorJobLicence = async (req, res, next) => {
    let { sector, jobs, licence } = req.query;
    jobs = jobs.split(",")
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatJob: {
            $in: jobs
        },
        candidatStatus: "Archived",
        candidatLicensePermis: licence
    })
    ////console.log(results);
    if (results.length > 0) {
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
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
    ////console.log("Filtering Candidats By Languages ... ");
    let langs = req.query.languages
    langs = langs.split(",")
    let results = await Candidat.find({ candidatLanguages: { $in: langs }, candidatStatus: "Pre-Selected" })
    ////console.log(results.length);
    if (results.length > 0) {
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.filterPreSelectedSectorJobMotivation = async (req, res, next) => {
    let { sector, jobs, motivation } = req.query;
    jobs = jobs.split(",")
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatJob: {
            $in: jobs
        },
        candidatStatus: "Pre-Selected",
        candidatMotivation: motivation
    })
    ////console.log(results);
    if (results.length > 0) {
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.filterPreSelectedSectorJobLicence = async (req, res, next) => {
    let { sector, jobs, licence } = req.query;
    jobs = jobs.split(",")
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatJob: {
            $in: jobs
        },
        candidatStatus: "Pre-Selected",
        candidatLicensePermis: licence
    })
    ////console.log(results);
    if (results.length > 0) {
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}

exports.filterPreSelectedSectorJobLanguage = async (req, res, next) => {
    ////console.log(req.query);
    let { sector, jobs, languages } = req.query;
    ////console.log(sector, jobs, languages);
    jobs = jobs.split(",")
    languages = languages.split(",")
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatJob: jobs,
        candidatStatus: "Pre-Selected",
        candidatLanguages: {
            $in: languages
        }
    })
    if (results.length > 0) {
        let filteredResults = results.filter(result => {
            return new Date() >= new Date(result.candidatStartDate) && new Date() <= new Date(result.candidatEndDate)
        });
        return res.status(200).json({
            status: true,
            length: results.length,
            readyToWorkLength: filteredResults.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            data: []
        })
    }
}