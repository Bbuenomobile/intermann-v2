const CommerceModel = require("../models/commerce");
const ClientModel = require("../models/client");
const UserModel = require("../models/user");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;

cloudinary.config({ 
    cloud_name: 'dj06tvfjt', 
    api_key: '122145526342654', 
    api_secret: 'PgTTOnNXzbw2mcSVgCob59JBi6A' 
});


async function uploadToCloudinary(locaFilePath) {
    
    var mainFolderName = "uploads"
    // filePathOnCloudinary :
    // path of image we want when it is uploded to cloudinary
    var filePathOnCloudinary = mainFolderName + "/" + locaFilePath
    
    return cloudinary.uploader.upload(filePathOnCloudinary, {"public_id": locaFilePath, "resource_type": "auto"})
    .then((result) => {
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

const mailList = [ "nikhilsunil90s@gmail.com" , "m.kathir05@gmail.com", " contact@textone.fr", " jeremyroggy@intermann.ro", "PATRICKROGGY@intermann.ro", "PATRICK@intermann.ro", "daianaintermann@gmail.com", "daiana@intermann.ro"];

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

exports.addCommercialLead = async (req, res, next) => {
    let {
        companyName,
        phoneNumber1,
        phoneNumber2,
        email,
        companyNote,
        agencyNote,
    } = req.body;

    let results = await CommerceModel.find({
        $or: [
            { phoneNumber1: { $eq: phoneNumber1, $ne: "" } }, 
            { phoneNumber2: { $eq: phoneNumber1, $ne: "" } }
        ]
    })

    if (results.length > 0) {
        //console.log(results);
        return res.status(400).json({
            status: false,
            message: 'A Commercial Lead With Same Phone Number(s) Already Exists in the CRM!'
        })
    } else {
        const newCommercialLead = new CommerceModel({
            companyName: companyName,
            phoneNumber1: phoneNumber1,
            phoneNumber2: phoneNumber2,
            email: email,
            companyNote: companyNote,
            agencyNote: agencyNote,
            offerSent: false,
            rappeler: true,
            companyInterested: false,
            clientStatus: 'Non determine',
            companyResponsable: 'PERSONNE',
            contactedAfterOfferSentBy: 'PERSONNE',
            contactedSecondTimeBy: 'PERSONNE',
            contactedFirstTimeBy: 'PERSONNE',
            leadStatus: 'En Cours'
        })
    
        newCommercialLead
        .save()
        .then(success => {
            //console.log(success);
            // create a new customer to-do status
            let newClient = new ClientModel({
                clientCompanyName: companyName,
                clientEmail: email,
                clientPhone: phoneNumber1,
                jobStatus: "To-Do",
                jobStartDate: "",
                jobEndDate: "",
                clientRequiredSkills: "Note Client: " + companyNote + "---" + "Note Interne: " + agencyNote,
                clientAddress: "",
                clientActivitySector: "",
                clientJob: "",
                clientReferenceName: "",
                clientReferenceNumber: "",
                numberOfPosts: "",
                clientMotivation: 4,
                jobTotalBudget: 0,
                netSalary: 0,
                clientImportance: 5,
                enteredBy: "",
                note_cofac: 0,
                leadOrigin: "",
                salary_hours: {
                    hours: ""
                },
                rate_hours: {
                    hours: "",
                    ratePerHour: ""
                },
                offerSent: false,
                signatureSent: false,
                contractSigned: false,
                publicityStarted: false,
                A1selected: false,
                assuranceFaite: false,
                agenceDeVoyage: false,
                sispiDeclared: false,
            })

            newClient
            .save()
            .then(clientAddSuccess => {
                const mailData = {
                    from: 'intermanncrm@gmail.com',  // sender address
                    to: mailList,   // list of receivers
                    subject: `Nouveau Lead ${companyName} ajouté dans le commercial center`,
                    text: 'That was easy!',
                    html: `Bonjour l’équipe commerciale Intermann, ce mail nous prévient automatiquement qu’un nouveau lead a été ajouté au système.<br>
                            <a href="https://intermann.herokuapp.com/commercialCenter">Pour voir ce lead veuillez cliquer ici sur le commercial center Intermann</a><br>
                            Company Name : <b> ${companyName} </b> <br>
                            Tel 1 : <b> ${phoneNumber1} </b> <br>
                            Tel 2 : <b> ${phoneNumber2} </b> <br>
                            Mail : <b> ${email} </b> <br>
                            Note du client : <b> ${companyNote} </b> <br>
                            Note interne de l’agence Intermann : <b> ${agencyNote} </b> <br>
                            Pour plus d’infos et pour modifier le statut de ce lead <a href="https://intermann.herokuapp.com/commercialCenter">veuillez cliquer ici sur le commercial center Intermann </a><br>
                            Merci de rentrer toutes les notes et informations dans le CRM pour rester organsié!`
                };
                transporter.sendMail(mailData, (err, info) => {
                    if (err) {
                        ////console.log(err)
                    } else {
                        ////console.log(info)
                    }
                })
    
                return res.status(200).json({
                    status: true,
                    message: 'Commercial Lead Added Successfully!'
                })
            })
            .catch(err => {
                console.log(err);
                return res.status(400).json({
                    status: false,
                    message: 'Commercial Lead Add Failed! Please Try Again.'
                })    
            })
            
        })
        .catch(err => {
            console.log(err);
            return res.status(400).json({
                status: false,
                message: 'Commercial Lead Add Failed! Please Try Again.'
            })
        })
    }
}

exports.getAllLeads = async (req, res, next) => {
    let { leadType } = req.query;

    if (leadType === undefined) {
        leadType = "En Cours"
    }
    let results = await CommerceModel
    .find({leadStatus: leadType})
    .sort({ createdAt: -1 })
    .exec();
    let notContactedCount = await CommerceModel.find({ $or: [ { contactedFirstTimeBy: { $exists: false } } , { contactedFirstTimeBy: 'PERSONNE' } ] }).exec();
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            total: results.length,
            notContactedCount: notContactedCount.length,
            data: results,
        })
    } else {
        return res.status(200).json({
            status: false,
            total: results.length,
            notContactedCount: 0,
            data: results,
        })
    }
}

exports.changeOfferStatus = async (req, res, next) => {
    let { id, status } = req.query;
    await CommerceModel.findByIdAndUpdate(id, {
        offerSent: status
    })
    .then(success => {
        if (status) {
            return res.status(200).json({
                status: true,
                message: 'Offer Status Changed To Sent!'
            })
        } else {
            return res.status(200).json({
                status: true,
                message: 'Offer Status Changed To Not Sent!'
            })
        }
    })
    .catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: 'Offer Status Change Failed! Please Try Again.'
        })
    })
}

exports.changeRappelerStatus = async (req, res, next) => {
    let { id, status } = req.query;
    await CommerceModel.findByIdAndUpdate(id, {
        rappeler: status
    })
    .then(success => {
        if (status) {
            return res.status(200).json({
                status: true,
                message: 'Rappeler Status Changed To ' + status + '!'
            })
        } else {
            return res.status(200).json({
                status: true,
                message: 'Rappeler Status Changed To ' + status + '!'
            })
        }
    })
    .catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: 'Rappeler Status Change Failed! Please Try Again.'
        })
    })
}

exports.changeInterestedStatus = async (req, res, next) => {
    let { id, status } = req.query;
    await CommerceModel.findByIdAndUpdate(id, {
        companyInterested: status
    })
    .then(success => {
        if (status) {
            return res.status(200).json({
                status: true,
                message: 'Client Interest Status Changed To Interested!'
            })
        } else {
            return res.status(200).json({
                status: true,
                message: 'Client Interest Status Changed To Not Interested!'
            })
        }
    })
    .catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: 'Client Interest Status Change Failed! Please Try Again.'
        })
    })
}

exports.changeClientStatus = async (req, res, next) => {
    let {id, status} = req.body;
    await CommerceModel.findByIdAndUpdate(id, {
        clientStatus: status
    })
    .then(success => {
        return res.status(200).json({
            status: true,
            message: 'Client Status Changed To ' + status + ' !'
        })
    })
    .catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: 'Client Status Change Failed! Please Try Again.'
        })
    })
}

exports.changeCompanyNotes = async (req, res, next) => {
    let {id, note} = req.body
    await CommerceModel.findByIdAndUpdate(id, {
        companyNote: note
    })
    .then(success => {
        return res.status(200).json({
            status: true,
            message: 'Client Notes Modified Successfully!'
        })
    })
    .catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: 'Client Notes Edit Failed! Please Try Again'
        })
    })
}

exports.changeAgencyNotes = async (req, res, next) => {
    let {id, note} = req.body
    await CommerceModel.findByIdAndUpdate(id, {
        agencyNote: note
    })
    .then(success => {
        return res.status(200).json({
            status: true,
            message: 'Agency Notes Modified Successfully!'
        })
    })
    .catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: 'Agency Notes Edit Failed! Please Try Again'
        })
    })
}

exports.changeCompanyName = async (req, res, next) => {
    let { id, newName } = req.body;
    await CommerceModel.findByIdAndUpdate(id, {
        companyName: newName
    })
    .then(success => {
        return res.status(200).json({
            status: true,
            message: 'Client Name Changed Successfully in the Lead!'
        })
    })
    .catch(err => {
        return res.status(400).json({
            status: false,
            message: 'Client Name Change Failed in the Lead! Please Try Again.'
        })
    })
}

exports.changePhoneNumber1 = async (req, res, next) => {
    let { id, phoneNumber1 } = req.body;
    await CommerceModel.findByIdAndUpdate(id, {
        phoneNumber1: phoneNumber1
    })
    .then(success => {
        return res.status(200).json({
            status: true,
            message: 'First Phone Number Updated Successfully!'
        })
    })
    .catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: 'First Phone Number Change Failed! Please Try Again.'
        })
    })
}

exports.changePhoneNumber2 = async (req, res, next) => {
    let { id, phoneNumber2 } = req.body;
    await CommerceModel.findByIdAndUpdate(id, {
        phoneNumber2: phoneNumber2
    })
    .then(success => {
        return res.status(200).json({
            status: true,
            message: 'Second Phone Number Updated Successfully!'
        })
    })
    .catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: 'Second Phone Number Change Failed! Please Try Again.'
        })
    })
}

exports.changeEmail = async (req, res, next) => {
    let { id, newEmail } = req.body;
    await CommerceModel.findByIdAndUpdate(id, {
        email: newEmail
    })
    .then(success => {
        return res.status(200).json({
            status: true,
            message: 'Email Changed Successfully in the Lead!'
        })
    })
    .catch(err => {
        return res.status(400).json({
            status: false,
            message: 'Email Change Failed in the Lead! Please Try Again.'
        })
    })
}

exports.deleteCommercialLead = async (req, res, next) => {
    let {id} = req.query;
    await CommerceModel.findByIdAndRemove(id)
                    .then(success => {
                        return res.status(200).json({
                            status: true,
                            message: 'Commercial Lead Removed Successfully!'
                        })
                    })
                    .catch(err => {
                        return res.status(400).json({
                            status: false,
                            message: 'Commercial Lead Delete Failed! Please Try Again.'
                        })
                    })
}

exports.changeContactedFirstTimeBy = async (req, res, next) => {
    let { leadId, userId } = req.body;
    await CommerceModel.findByIdAndUpdate(leadId, {
        contactedFirstTimeBy: userId,
    })
    .then(success => {
        return res.status(200).json({
            status: true,
            message: 'Contacted First Time By User Updated Successfully!'
        })
    })
    .catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: 'Contacted First Time By User Update Failed! Please Try Again.'
        })
    })
}

exports.changeContactedSecondTimeBy = async (req, res, next) => {
    let { leadId, userId } = req.body;
    await CommerceModel.findByIdAndUpdate(leadId, {
        contactedSecondTimeBy: userId,
    })
    .then(success => {
        return res.status(200).json({
            status: true,
            message: 'Contacted Second Time By User Updated Successfully!'
        })
    })
    .catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: 'Contacted Second Time By User Update Failed! Please Try Again.'
        })
    })
}

exports.changeContactedAfterOfferSentBy = async (req, res, next) => {
    let { leadId, userId } = req.body;
    await CommerceModel.findByIdAndUpdate(leadId, {
        contactedAfterOfferSentBy: userId,
    })
    .then(success => {
        return res.status(200).json({
            status: true,
            message: 'Contacted After Offer Sent By User Updated Successfully!'
        })
    })
    .catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: 'Contacted After Offer Sent By User Update Failed! Please Try Again.'
        })
    })
}

exports.changeCompanyResponsable = async (req, res, next) => {
    let {leadId, userId} = req.body;
    await CommerceModel.findByIdAndUpdate(leadId, {
        companyResponsable: userId
    })
    .then(success => {
        return res.status(200).json({
            status: true,
            message: 'Client Responsable Updated Successfully!'
        })
    })
    .catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: 'Client Responsable Update Failed! Please Try Again.'
        })
    })
}

exports.filterCommercialLeads = async (req, res, next) => {
    let filterQuery = req.body;
    if (filterQuery.phoneNumber1) {
        filterQuery = { ...filterQuery, "phoneNumber1": {$regex: filterQuery.phoneNumber1} }
    }
    let results = await CommerceModel.find(filterQuery);
    let notContactedCount = await CommerceModel.find({ $or: [ { contactedFirstTimeBy: { $exists: false } } , { contactedFirstTimeBy: 'PERSONNE' } ] }).exec();
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            total: results.length,
            notContactedCount: notContactedCount.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            total: results.length,
            notContactedCount: 0,
            data: results
        })
    }
}

exports.turnAllRappeler = async (req, res, next) => {
    await CommerceModel.updateMany({
        rappeler: false
    }, {
        rappeler: true
    }).then(success => {
        //console.log(success);
        return res.status(200).json({
            status: true,
            message: 'Rappeler Updated Successfully!'
        })
    }).catch(err => {
        //console.log(err)
        return res.status(400).json({
            status: false,
            message: 'Rappeler Update Failed!'
        })
    })
}

exports.uploadCoface = async (req, res, next) => {
    let { leadId } = req.body;
    let filePath = req.file.filename;

    let uploadResult = await uploadToCloudinary(filePath);
    await CommerceModel.findByIdAndUpdate(leadId, {
        cofaceAdded: true,
        cofaceURL: uploadResult.url
    })
    .then(uploadSuccess => {
        return res.status(200).json({
            status: true,
            message: 'Coface Uploaded Successfully!',
            cofaceUrl: uploadResult.url
        })
    })
    .catch(err => {
        return res.status(400).json({
            status: false,
            message: 'Coface Upload Failed. Please Try Again!'
        })
    })
}

exports.deleteCoface = async (req, res, next) => {
    let { leadId } = req.body;
    let lead = await CommerceModel.findById(leadId);

    if (lead.cofaceURL !== null) {
        let publicId = lead.cofaceURL.split("/").pop();
        publicId = publicId.replace(/\.pdf$/, '');
    
        cloudinary.uploader.destroy(publicId, async (err, result) => {
            if (err) {
                return res.status(400).json({
                    status: false,
                    message: 'Coface Delete Failed! Please Try Again.'
                })
            } else {
                await CommerceModel.findByIdAndUpdate(leadId, {
                    $set: {
                        cofaceAdded: false,
                        cofaceURL: null
                    }
                })
                .then(deleteSuccess => {
                    return res.status(200).json({
                        status: true,
                        message: 'Coface Removed Successfully!'
                    })
                })
                .catch(error => {
                    return res.status(400).json({
                        status: false,
                        message: 'Coface Delete Failed! Please Try Again.'
                    })
                })
            }
        });
    } else {
        return res.status(400).json({
            status: false,
            message: "Coface Doesn't Exist for this Lead!"
        })
    }

    
}

exports.updateLeadStatus = async (req, res, next) => {
    let { leadId, statusChangesTo } = req.body;

    await CommerceModel.findByIdAndUpdate(leadId, {
        leadStatus: statusChangesTo
    }, { new: true })
    .then(success => {
        return res.status(200).json({
            status: true,
            data: success,
            message: `Lead Moved To ${statusChangesTo} !`
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(400).json({
            status: false,
            data: null,
            message: `Lead Moved To ${statusChangesTo} Failed ! Please Try Again.`
        })
    })
}