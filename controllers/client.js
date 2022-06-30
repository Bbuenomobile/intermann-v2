const Client = require("../models/client");
const nodemailer = require("nodemailer");
const Candidat = require("../models/candidat");
const https = require("https");
const axios = require('axios');

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


exports.fetchClientsRecommendations = async (req, res, next) => {
    const { candidatSector } = req.query

    let results = await Client.find({ clientActivitySector: candidatSector }).exec()
    if (results) {
        console.log(results)
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
    // console.log(inProgressClientCount)
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
    console.log(req.body, 'adding client information!');
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
    } = req.body
    if (clientEmail == "" || clientPhone == "") {
        console.log("No Email or Phone");
        const mailData = {
            from: 'intermanncrm@gmail.com',  // sender address
            to: mailList,   // list of receivers
            subject: 'Client/Lead Registered without complete information.',
            text: 'That was easy!',
            html: `<b>Hey there!</b><br/><br/>A Client/Lead has been resgistered for Company:<b> ${clientCompanyName}</b>, which contains <b> No Email or Phone Address </b>.<br/>Please complete the required information.<br/><br/> Thank You!<br/><b>Intermann CRM</b>`
        };
        transporter.sendMail(mailData, (err, info) => {
            if (err) {
                console.log(err)
            } else {
                console.log(info)
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
            console.log(err)
            return res
                .status(400)
                .json({
                    error: "INTERNAL_SERVER_ERROR",
                    message: "Error in Saving Client/Job!",
                    status: false
                })
        })
}

exports.viewAllToDoClients = async (req, res, next) => {
    console.log("Fetching all To-Do Clients/Jobs");
    try {
        let clients = await Client.find({
            jobStatus: "To-Do"
        }).exec();
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
    console.log("Fetching all In-Progress Clients/Jobs");
    try {
        let clients = await Client.find({
            jobStatus: "In-Progress"
        }).exec();
        if (!clients) {
            res.status(400).send("No Data Found!");
        } else {
            res.status(200).json(clients);
        }
    } catch (err) {
        res.status(500).send("Fetch Error!");
    }
}

exports.viewAllSignedClients = async (req, res, next) => {
    console.log("Fetching all Signed Clients/Jobs");
    try {
        let clients = await Client.find({
            jobStatus: "Signed Contract"
        }).populate('employeesWorkingUnder')
            .exec();
        if (!clients) {
            res.status(400).send("No Data Found!");
        } else {
            res.status(200).json(clients);
        }
    } catch (err) {
        console.log(err)
        res.status(500).send("Fetch Error!");
    }
}

exports.viewAllArchivedClients = async (req, res, next) => {
    console.log("Fetching all Archived Clients/Jobs");
    try {
        let clients = await Client.find({
            jobStatus: "Archived"
        }).exec();
        if (!clients) {
            res.status(400).send("No Data Found!");
        } else {
            res.status(200).json(clients);
        }
    } catch (err) {
        res.status(500).send("Fetch Error!");
    }
}

exports.editToDoClient = async (req, res, next) => {
    console.log(JSON.parse(req.body.data), req.file)
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
        netSalary
    } = JSON.parse(req.body.data)
    let data = {}
    if (req.file) {
        var image = {
            data: req.file.filename,
            contentType: "image/png",
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
        }
    }

    await Client.findByIdAndUpdate(clientId, data)
        .then((response) => {
            console.log(response);
            return res.status(200).json({
                message: "Client (To-Do) Saved Successfully!",
                status: true,
            })
        })
        .catch(err => {
            console.log(err);
            return res.status(400).json({
                message: "Client Change Failed!",
                status: false,
            })
        })

}

exports.editInProgressClient = async (req, res, next) => {
    console.log(JSON.parse(req.body.data), req.file)
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
        netSalary
    } = JSON.parse(req.body.data)
    let data = {}
    if (req.file) {
        var image = {
            data: req.file.filename,
            contentType: "image/png",
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
        }
    }

    await Client.findByIdAndUpdate(clientId, data)
        .then((response) => {
            console.log(response);
            return res.status(200).json({
                message: "Client (In-Progress) Saved Successfully!",
                status: true,
            })
        })
        .catch(err => {
            console.log(err);
            return res.status(400).json({
                message: "Client Change Failed!",
                status: false,
            })
        })

}

exports.moveClientInProgress = async (req, res, next) => {
    console.log("Changing Client Status ...");
    const { clientId, clientCompanyName, clientJob } = req.body;
    console.log(clientId, clientCompanyName, clientJob)
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
            console.log(err);
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
    console.log(clientId, clientJob);
    await Client.updateOne({
        _id: clientId,
        clientJob: clientJob
    }, {
        $set: {
            jobStatus: "Signed Contract"
        }
    })
        .then(response => {
            console.log(response);
            return res.status(200).json({
                message: "Client/Lead Signed Successfully!",
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

exports.moveClientToArchived = async (req, res, next) => {
    const { clientId, reasonToArchive, clientJobName } = req.body;
    console.log(clientId, reasonToArchive, clientJobName);
    await Client.updateOne({
        _id: clientId,
        clientJob: clientJobName
    }, {
        $set: {
            clientArchived: {
                reason: reasonToArchive
            },
            jobStatus: "Archived"
        }
    })
        .then(response => {
            console.log(response);
            return res.status(200).json({
                message: "Client/Lead Archived Successfully!",
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


exports.getClientByName = async (req, res, next) => {
    const { clientCompanyName } = req.query;
    let results = await Client.find({ clientCompanyName: clientCompanyName })
    console.log(results);
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
    console.log("Filtering Clients By Languages ... ");
    let langs = req.query.languages
    langs = langs.split(",")
    let results = await Client.find({ clientLanguages: { $in: langs }, jobStatus: "To-Do" })
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
    console.log(req.query);
    let { sector, jobs } = req.query;
    console.log(sector, jobs);
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
    console.log(req.query);
    let { sector, languages } = req.query;
    console.log(sector, languages);
    languages = languages.split(",")
    let results = await Client.find({
        clientActivitySector: sector,
        jobStatus: "To-Do",
        clientLanguages: {
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

// Filters In-Progress
exports.filterInProgressClientByLanguages = async (req, res, next) => {
    console.log("Filtering Clients By Languages ... ");
    let langs = req.query.languages
    langs = langs.split(",")
    let results = await Client.find({ clientLanguages: { $in: langs }, jobStatus: "In-Progress" })
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
    console.log(req.query);
    let { sector, languages } = req.query;
    console.log(sector, languages);
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
    console.log(req.query);
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
    console.log(req.query);
    let { sector, jobs, languages } = req.query;
    console.log(sector, jobs, languages);
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
    console.log("Filtering Clients By Languages ... ");
    let langs = req.query.languages
    langs = langs.split(",")
    let results = await Client.find({ clientLanguages: { $in: langs }, jobStatus: "Signed Contract" })
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
    console.log(req.query);
    let { sector, languages } = req.query;
    console.log(sector, languages);
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
    console.log(req.query);
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
    console.log(req.query);
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


// Filter Archived

exports.filterArchivedClientByLanguages = async (req, res, next) => {
    console.log("Filtering Clients By Languages ... ");
    let langs = req.query.languages
    langs = langs.split(",")
    let results = await Client.find({ clientLanguages: { $in: langs }, jobStatus: "Archived" })
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
    console.log(req.query);
    let { sector, languages } = req.query;
    console.log(sector, languages);
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
    console.log(req.query);
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
    console.log(req.query);
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