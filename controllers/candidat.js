const Candidat = require("../models/candidat");
const bcrypt = require("bcryptjs");
const client = require("../models/client");

// Fetchers

exports.getCandidatById = async (req, res, next) => {
    const { candidatId
    } = req.query;
    console.log(candidatId)
    Candidat.findById(candidatId).then(result => {
        if (result) {
            console.log(result)
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
            console.log(err);
            return res.status(400).json({
                status: false,
                data: result
            })
        })

}

exports.getCandidat = async (req, res, next) => {
    const data = req.query
    let query = {};
    console.log(data);

    Object.keys(data).map((k) => {
        query[k] = data[k]
    })

    let results = await Candidat.find(query)
    if (results.length > 0) {
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

// Document Uploaders
exports.uploadCandidatDocuments = async (req, res, next) => {
    console.log(req.file, req.body)
    const { candidatId } = req.body;
    if (req.file) {
        await Candidat.findByIdAndUpdate(candidatId, {
            $push: {
                candidatDocuments: {
                    documentName: req.file.filename,
                    originalName: req.file.originalname
                }
            }
        })
            .then(uploadRes => {
                return res.status(200).json({
                    status: true,
                    fileName: req.file.originalname,
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
    console.log(candidatName)
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
    console.log("Adding A Candidat!");
    console.log(req.body);
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
        console.log(candidatActivitySector)
        candidatActivitySector = ""
    }
    console.log(candidatActivitySector, candidatEmail)
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
            console.log(err)
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
    console.log("Finding A Candidat ... ");
    console.log(req.query);
    const foundCandidat = await Candidat.findById(req.query.id)
    return res.status(200).json({
        message: "Candidat Found",
        candidat: foundCandidat
    })
}

// GET Request
exports.viewAllToDoCadidats = async (req, res, next) => {
    console.log("List All To-Do Candidates ... ");
    try {
        let candidates = await Candidat.find({
            candidatStatus: "To-Do"
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

// GET Request
exports.viewAllInProgressCadidats = async (req, res, next) => {
    console.log("List All In-Progress Candidates ... ");
    try {
        let candidates = await Candidat.find({
            candidatStatus: "In-Progress"
        }).exec();
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
exports.viewAllArchivedCadidats = async (req, res, next) => {
    console.log("List All Archived Candidates ... ");
    try {
        let candidates = await Candidat.find({
            candidatStatus: "Archived"
        }).exec();
        if (!candidates) {
            res.status(400).send("No Data Found!");
        } else {
            res.status(200).json(candidates);
        }
    } catch (err) {
        res.status(500).send("Fetch Error!");
    }
}

// Body Required
exports.moveToInProgress = async (req, res, next) => {
    console.log("Changing Candidat Status ...");
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
            console.log(response);
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
            console.log(err);
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
    console.log("Changing Candidat Status to Archived ... ");
    const { candidatId, reasonToArchive } = req.body;
    console.log(candidatId, reasonToArchive);

    await Candidat.updateOne({
        _id: candidatId
    }, {
        $set: {
            candidatArchived: {
                reason: reasonToArchive
            },
            candidatStatus: "Archived"
        }
    })
        .then(response => {
            console.log(response);
            return res.status(200).json({
                message: "Candidat Archived Successfully!",
                status: true
            })
        })
        .catch(err => {
            console.log(err);
            return res.status(400).json({
                message: "Update Not Successfull, Try Again Later!",
                status: false
            })
        })
}

// Body Required
exports.editToDoCandidat = async (req, res, next) => {
    console.log("Editing A To-Do Candidat!");
    console.log(req.file);
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
        candidatAddress,
        candidatFBURL,
        candidatYearsExperience,
    } = JSON.parse(req.body.data);
    let data = {}
    if (req.file) {
        var image = {
            data: req.file.filename,
            contentType: "image/png",
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
        }
    }

    await Candidat.findByIdAndUpdate(candidatId, data)
        .then((response) => {
            console.log(response);
            return res.status(200).json({
                message: "Candidat (To-Do) Saved Successfully!",
                status: true,
            })
        })
        .catch(err => {
            console.log(err);
            return res.status(400).json({
                message: "Candidat Change Failed!",
                status: false,
            })
        })
}

exports.editInProgressCandidat = async (req, res, next) => {
    console.log("Editing A Candidat In-Progress!");
    console.log(req.body);
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
        candidatAddress,
        candidatFBURL,
        candidatYearsExperience,
        candidatCurrentWork // includes further JSON of workingFor and Salary fields
    } = JSON.parse(req.body.data);
    let data = {}
    if (req.file) {
        var image = {
            data: req.file.filename,
            contentType: "image/png",
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
            candidatAddress: candidatAddress,
            candidatFBURL: candidatFBURL,
            candidatYearsExperience: candidatYearsExperience,
            candidatCurrentWork: candidatCurrentWork
        }
    }

    await Candidat.findByIdAndUpdate(candidatId, data)
        .then((response) => {
            console.log(response);
            return res.status(200).json({
                message: "Candidat (In-Progress) Saved Successfully!",
                status: true,
            })
        })
        .catch(err => {
            console.log(err);
            return res.status(400).json({
                message: "Candidat Change Failed!",
                status: false,
            })
        })
}

exports.editArchivedCandidat = async (req, res, next) => {
    console.log("Editing A Candidat Archived!");
    console.log(req.body);
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
        candidatAddress,
        candidatFBURL,
        candidatYearsExperience,
        candidatArchived
    } = JSON.parse(req.body.data);

    let data = {}
    if (req.file) {
        var image = {
            data: req.file.filename,
            contentType: "image/png",
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
            candidatAddress: candidatAddress,
            candidatFBURL: candidatFBURL,
            candidatYearsExperience: candidatYearsExperience,
            candidatArchived: candidatArchived
        }
    }

    await Candidat.findByIdAndUpdate(candidatId, data)
        .then((response) => {
            console.log(response);
            return res.status(200).json({
                message: "Candidat (Archived) Saved Successfully!",
                status: true
            })
        })
        .catch(err => {
            console.log(err);
            return res.status(400).json({
                message: "Candidat Change Failed!",
                status: false
            })
        })
}

// Filters 
exports.filterToDoCandidatByLanguages = async (req, res, next) => {
    console.log("Filtering Candidats By Languages ... ");
    let langs = req.query.languages
    langs = langs.split(",")
    let results = await Candidat.find({ candidatLanguages: { $in: langs }, candidatStatus: "To-Do" })
    console.log(results.length);
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
    console.log(req.query);
    let { sector, jobs } = req.query;
    console.log(sector, jobs);
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
    console.log(req.query);
    let { sector, languages } = req.query;
    console.log(sector, languages);
    languages = languages.split(",")
    let results = await Candidat.find({
        candidatActivitySector: sector,
        candidatStatus: "To-Do",
        candidatLanguages: {
            $in: languages
        }
    })
    console.log(results)
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
    console.log(results);
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
    console.log("Filtering Candidats By Languages ... ");
    let langs = req.query.languages
    langs = langs.split(",")
    let results = await Candidat.find({ candidatLanguages: { $in: langs }, candidatStatus: "In-Progress" })
    console.log(results.length);
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
    console.log(req.query);
    let { sector, languages } = req.query;
    console.log(sector, languages);
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
    console.log(req.query);
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
    console.log(req.query);
    let { sector, jobs, languages } = req.query;
    console.log(sector, jobs, languages);
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
    console.log("Filtering Candidats By Languages ... ");
    let langs = req.query.languages
    langs = langs.split(",")
    let results = await Candidat.find({ candidatLanguages: { $in: langs }, candidatStatus: "Archived" })
    console.log(results.length);
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
    console.log(req.query);
    let { sector, languages } = req.query;
    console.log(sector, languages);
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
    console.log(req.query);
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
    console.log(req.query);
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
    console.log(results);
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
