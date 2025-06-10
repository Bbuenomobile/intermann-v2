const Lead = require("../models/lead");
const fs = require('fs');
const xlsx = require('node-xlsx');
const Candidat = require("../models/candidat");
const User = require("../models/user");
const ActionLogger = require("../models/actionLogger");
const Ad = require("../models/ad");
const nodemailer = require("nodemailer");

// const mailList = [ "nikhilsunil90s@gmail.com"]
const mailList = ["workeraddedtocrm@intermann.ro"]


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

// GET 

//With Market With Skip Limit
exports.getAllLeads = async (req,res,next) => {
    const { market, skip } = req.query;
    // const { market } = req.query;
    let results = await Lead.find({ leadCountryMarket: market.toUpperCase()}).sort({ createdAt: -1 }).skip(skip).limit(50).exec();
    results.sort((r1, r2) => {
        const aKey = r1.leadContactedByAgency || 'Not Yet'; // Treat missing key as 'Not Yet'
        const bKey = r2.leadContactedByAgency || 'Not Yet'; // Treat missing key as 'Not Yet'
        if(aKey === 'Not Yet' && bKey !== 'Not Yet') {
            return -1;
        } else if (aKey !== 'Not Yet' && bKey === 'Not Yet') {
            return 1;
        } else {
            return 0;
        }
    })
    let contactedResults = await Lead.find({ leadCountryMarket: market.toUpperCase(), leadContactedByAgency: ["Not Yet", "No"] }).sort({ createdAt: -1 }).exec();

    let totalCounts = await Lead.find({ leadCountryMarket: market.toUpperCase() }).countDocuments();

    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            totalCount: totalCounts,
            notContactedCount: contactedResults.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            totalCount: 0,
            notContactedCount: 0
        })
    }
}

//With Market Without Skip Limit
exports.getAllLeads2 = async (req,res,next) => {
    // const { market, skip } = req.query;
    const { market } = req.query;
    // let results = await Lead.find({ leadCountryMarket: market.toUpperCase() }).sort({ createdAt: -1 }).skip(skip).limit(50).exec();
    let results = await Lead.find({ leadCountryMarket: market.toUpperCase() }).sort({ createdAt: -1}).exec();
    results.sort((r1, r2) => {
        const aKey = r1.leadContactedByAgency || 'Not Yet'; // Treat missing key as 'Not Yet'
        const bKey = r2.leadContactedByAgency || 'Not Yet'; // Treat missing key as 'Not Yet'
        if(aKey === 'Not Yet' && bKey !== 'Not Yet') {
            return -1;
        } else if (aKey !== 'Not Yet' && bKey === 'Not Yet') {
            return 1;
        } else {
            return 0;
        }
    })
    let contactedResults = await Lead.find({ leadCountryMarket: market.toUpperCase(), leadContactedByAgency: ["Not Yet", "No"] }).sort({ createdAt: -1 }).exec();
    //console.log(results.length);
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            totalCount: results.length,
            notContactedCount: contactedResults.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            notContactedCount: 0,
            totalCount: results.length,
        })
    }
}

// POST

exports.addLead = async (req,res,next) => { 
    let {
        leadCountryMarket,
        leadCandidatName,
        phoneNumber,
        leadSource,
        ad, // { adId: '' , adName: '' }
        email,
        leadPrice,
        leadNotes,
    } = req.body;

    const newLead = new Lead({
        leadCountryMarket: leadCountryMarket.toUpperCase(),
        leadCandidatName: leadCandidatName,
        phoneNumber: phoneNumber,
        leadSource: leadSource,
        adName: ad.adName,
        email: email,
        leadPrice: leadPrice,
        leadNotes: leadNotes,
        agencyNotes: "",
        leadQualified: 0,
        leadAddedToCRM: false,
        leadContactedByAgency: 'Not Yet',
        leadPreContacted: 'Not Yet',
    })

    newLead.save().then(async (success) => {
        if (ad.adId) {
            await Ad.findByIdAndUpdate(ad.adId, {
                $set: {
                    leadPriceForAd: leadPrice
                }
            }).then(s => {
                return res.status(200).json({
                    status: true,
                    message: 'Lead Registered Successfully!'
                })
            }).catch(err => {
                //console.log(err)
                return res.status(400).json({
                    status: false,
                    message: 'Lead Not Registered Successfully. Please Try Again!'
                })
            })
        } else {
            return res.status(200).json({
                status: true,
                message: 'Lead Registered Successfully!'
            })
        }
        
    }).catch(err => {
        //console.log(err)
        return res.status(400).json({
            status: false,
            message: 'Lead Not Registered Successfully. Please Try Again!'
        })
    })
}

// POST

exports.deleteLead = async (req,res,next) => {
    const { leadId } = req.body;
    await Lead.findByIdAndRemove(leadId).then(success => {
        return res.status(200).json({
            status: true,
            message: 'Lead Removed Successfully!'
        })
    }).catch(err => {
        return res.status(400).json({
            status: false,
            message: 'Lead Remove Failed. Please Try Again!'
        })
    })
}

// POST

exports.addLeadToCRM = async (req,res,next) => { // change status also
    let { candidatName, candidatEmail, candidatPhone, leadNotes, agencyNotes } = req.body;
    let result = await Candidat.findOne({ candidatName: candidatName, candidatPhone: candidatPhone })
    if (result) {
        return res.status(400).json({
            status: false,
            message: 'Candidat with same Name and Number already Exists in CRM! Candidat Name - ' + result.candidatName,
        })
    } else {
        const newCandidat = new Candidat({
            candidatName: candidatName,
            candidatPhone: candidatPhone,
            candidatEmail: candidatEmail,
            candidatAddress: "Address",
            enteredBy: 'From Leads',
            leadNotes: leadNotes,
            agencyNotes: agencyNotes,
            candidatStatus: 'To-Do'
        })

        newCandidat.save().then(async (success) => {
            return res.status(200).json({
                    status: true,
                    message: 'Candidat ' + candidatName  +' Added to CRM Successfully with Lead and Agency Notes!'
            })
        }).catch(err => {
            //console.log(err);
            return res.status(400).json({
                status: false,
                message: 'Add to CRM Failed! Please Try Again.'
            })
        })
    }
}

// GET
// exports.changePreContactedStatus = async (req,res,next) => {
//     const { userId, leadId, status} = req.query;

//     await Lead.findByIdAndUpdate(leadId, {
//             leadPreContacted: status
//     }).then(async (success) => {
//         //console.log(success);
//         if (status != 'Not Yet') {
//             await User.findOne({_id: userId, "preContactedLeads.workedOnLeads": {$nin: [leadId]}})
//                 .then(async (suc) => {
//                 //console.log("suc - ",suc);
//                 if (suc) {
//                     await User.findByIdAndUpdate(userId, {
//                         $set: {
//                             "preContactedLeads.count": suc.preContactedLeads.count + 1,
//                         },
//                         $push: {
//                             "preContactedLeads.workedOnLeads": leadId,
//                         }
//                     }).then(async (su) => {
//                         //console.log(su);
//                         let now = new Date();
//                         let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//                         let resultArray = await ActionLogger.find({ date: {$gte: today}, user: userId});
//                         //console.log(resultArray);
//                         if (resultArray.length > 0) {
//                             await ActionLogger.findOneAndUpdate({ _id: resultArray[0]._id}, {
//                                 $set: {
//                                     "preContactedLeads": suc.preContactedLeads.count + 1,
//                                 },
//                                 }).then(resSuccess => {
//                                     return res.status(200).json({
//                                         status: true, 
//                                         message: 'Pre Contacted Status Updated to ' + status + '!',
//                                         preContactedCount: su.preContactedLeads.count + 1
//                                     }) 
//                             }).catch(err => {
//                                 //console.log(err);
//                                 return res.status(400).json({
//                                     status: false,
//                                     message: 'Status Change Failed! Please Try Again.'
//                                 })
//                             })
                            
//                         } else {
//                             let actionLog = new ActionLogger({
//                                 date: today,
//                                 user: userId,
//                                 preContactedLeads: su.preContactedLeads.count + 1
//                             })
//                             actionLog.save().then(async (resSuccess) => {
//                                 //console.log("Res Success - ", resSuccess);
//                                 await User.findByIdAndUpdate(userId, {
//                                     $push: {
//                                         actionLogger: resSuccess._id
//                                     }
//                                 }).then(updateSuccess => {
//                                     //console.log(updateSuccess);
//                                     return res.status(200).json({
//                                         status: true,
//                                         message: 'Pre-Contacted Status Updated to ' + status + '!',
//                                         preContactedCount: su.preContactedLeads.count + 1
//                                     })
//                                 }).catch(err => {
//                                     //console.log(err);
//                                     return res.status(400).json({
//                                         status: false,
//                                         message: 'Status Change Failed! Please Try Again.'
//                                     })    
//                                 })
//                             }).catch(err => {
//                                 //console.log(err);
//                                 return res.status(400).json({
//                                     status: false,
//                                     message: 'Status Change Failed! Please Try Again.'
//                                 })
//                             })
//                         }
                            
//                     }).catch(err => {
//                         //console.log(err);
//                                 return res.status(400).json({
//                                     status: false,
//                                     message: 'Status Change Failed! Please Try Again.'
//                         })
//                     })
//                 } else {
//                     await User.findById(userId).then(resp => {
//                         return res.status(200).json({
//                             status: true,
//                             message: 'Pre-Contacted Status Updated to ' + status + '!',
//                             preContactedCount: resp.preContactedLeads.count
//                         })
//                     }).catch(err => {
//                         //console.log(err);
//                         return res.status(400).json({
//                             status: false,
//                             message: 'Pre-Contacted Status Update Failed! Please Try Again. ',
//                         })
//                     })
//                 }
                
//             }).catch(err => {
//                 //console.log(err);
//                 return res.status(400).json({
//                     status: false,
//                     message: 'Pre-Contacted Status Update Failed! Please Try Again. ',
//                 })

//             })
//         } else {
//             return res.status(200).json({
//                 status: true,
//                 message: 'Pre-Contacted Status Updated to ' + status + '!',
//             })
//         }
//     }).catch(err => {
//         //console.log(err);
//         return res.status(400).json({
//             status: false,
//             message: 'Status Update Failed. Please Try Again!'
//         })
//     })
// }

// GET

exports.changeLeadContactedStatus = async (req,res,next) => {
    const { userId, leadId, status } = req.query;
    await Lead.findByIdAndUpdate(leadId, {
        leadContactedByAgency: status
    }).then(async (success) => {

       if (status != 'No' || status != 'Not Yet') {
            await User.findOne({_id: userId, "contactedLeads.workedOnLeads": {$nin: [leadId]}}).then(async (suc) => {
                //console.log("suc - ",suc);
                if (suc) {
                    let date = new Date();
                    await User.findByIdAndUpdate(userId, {
                        $set: {
                            "contactedLeads.count": suc.contactedLeads.count + 1,
                        },
                        $push: {
                            "contactedLeads.workedOnLeads": leadId,
                        }
                    }).then(async (su) => {
                        //console.log(su);

                        let now = new Date();
                        let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        let resultArray = await ActionLogger.find({ date: {$gte: today}, user: userId});
                        //console.log(resultArray);
                        if (resultArray.length > 0) {
                            await ActionLogger.findOneAndUpdate({ _id: resultArray[0]._id}, {
                                $set: {
                                    "contactedLeads": suc.contactedLeads.count + 1,
                                },
                                }).then(resSuccess => {
                                    return res.status(200).json({
                                        status: true, 
                                        message: 'Contacted Status Updated to ' + status + '!',
                                        contactedCount: su.contactedLeads.count + 1
                                    }) 
                            }).catch(err => {
                                //console.log(err);
                                return res.status(400).json({
                                    status: false,
                                    message: 'Status Change Failed! Please Try Again.'
                                })
                            })
                        } else {
                            let actionLog = new ActionLogger({
                                date: today,
                                user: userId,
                                contactedLeads: su.contactedLeads.count + 1
                            })
                            actionLog.save().then(async (resSuccess) => {
                                //console.log("Res Success - ", resSuccess);
                                await User.findByIdAndUpdate(userId, {
                                    $push: {
                                        actionLogger: resSuccess._id
                                    }
                                }).then(updateSuccess => {
                                    return res.status(200).json({
                                        status: true,
                                        message: 'Contacted Status Updated to ' + status + '!',
                                        contactedCount: su.contactedLeads.count + 1
                                    })
                                }).catch(err => {
                                    //console.log(err);
                                    return res.status(400).json({
                                        status: false,
                                        message: 'Status Change Failed! Please Try Again.'
                                    })    
                                })
                            }).catch(err => {
                                //console.log(err);
                                return res.status(400).json({
                                    status: false,
                                    message: 'Status Change Failed! Please Try Again.'
                                })
                            })
                        }   
                    }).catch(err => {
                        //console.log(err)
                    })
                } else {
                    await User.findById(userId).then(resp => {
                        return res.status(200).json({
                            status: true,
                            message: 'Contacted Status Updated to ' + status + '!',
                            contactedCount: resp.contactedLeads.count
                        })
                    }).catch(err => {
                        //console.log(err);
                        return res.status(400).json({
                            status: false,
                            message: 'Contacted Status Update Failed! Please Try Again. ',

                        })
                    })
                }
                
            }).catch(err => {
                //console.log(err);
                return res.status(400).json({
                    status: false,
                    message: 'Contacted Status Update Failed! Please Try Again. ',
                })

            })
        } else {
            return res.status(200).json({
                status: true,
                message: 'Contacted Status Updated to ' + status + '!',
            })
        }
    }).catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: 'Status Update Failed. Please Try Again!'
        })
    })
}

// GET

exports.addedToCRMStatus = async (req, res, next) => {
    const { userId, leadId, status } = req.query;
    await Lead.findByIdAndUpdate(leadId, {
            leadAddedToCRM: status
    }).then(async (success) => {
        if (status != false) {
            await User.findOne({_id: userId, "leadsAddedToCRM.workedOnLeads": {$nin: [leadId]}}).then(async (suc) => {
                //console.log("suc - ",suc);
                if (suc) {
                    await User.findByIdAndUpdate(userId, {
                        $set: {
                            "leadsAddedToCRM.count": suc.leadsAddedToCRM.count + 1,
                        },
                        $push: {
                            "leadsAddedToCRM.workedOnLeads": leadId,
                        }
                    }).then(async (su) => {
                        //console.log(su);
                        let now = new Date();
                        let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        let resultArray = await ActionLogger.find({ date: {$gte: today}, user: userId});
                        //console.log(resultArray);
                        if (resultArray.length > 0) {
                            await ActionLogger.findOneAndUpdate({ _id: resultArray[0]._id}, {
                                $set: {
                                    "leadsAddedToCRM": su.leadsAddedToCRM.count + 1,
                                },
                                }).then(resSuccess => {
                                    return res.status(200).json({
                                        status: true,
                                        message: 'Added To CRM Status Updated to ' + status + '!',
                                        leadsAddedCount: su.leadsAddedToCRM.count + 1
                                    }) 
                            }).catch(err => {
                                //console.log(err);
                                return res.status(400).json({
                                    status: false,
                                    message: 'Status Change Failed! Please Try Again.'
                                })
                            })
                        } else {
                            let actionLog = new ActionLogger({
                                date: today,
                                user: userId,
                                leadsAddedToCRM: su.leadsAddedToCRM.count + 1
                            })
                            actionLog.save().then(async (resSuccess) => {
                                //console.log("Res Success - ", resSuccess);
                                await User.findByIdAndUpdate(userId, {
                                    $push: {
                                        actionLogger: resSuccess._id
                                    }
                                }).then(updateSuccess => {
                                    return res.status(200).json({
                                        status: true,
                                        message: 'Added To CRM Status Updated to ' + status + '!',
                                        leadsAddedCount: su.leadsAddedToCRM.count + 1
                                    })
                                }).catch(err => {
                                    //console.log(err);
                                    return res.status(400).json({
                                        status: false,
                                        message: 'Status Change Failed! Please Try Again.'
                                    })    
                                })
                            }).catch(err => {
                                //console.log(err);
                                return res.status(400).json({
                                    status: false,
                                    message: 'Status Change Failed! Please Try Again.'
                                })
                            })
                        }   
                            
                    }).catch(err => {
                        //console.log(err)
                    })
                } else {
                    await User.findById(userId).then(resp => {
                        return res.status(200).json({
                            status: true,
                            message: 'Added To CRM Status Updated to ' + status + '!',
                            leadsAddedCount: resp.leadsAddedToCRM.count
                        })
                    }).catch(err => {
                        //console.log(err);
                        return res.status(400).json({
                            status: false,
                            message: 'Added To CRM Status Update Failed! Please Try Again. ',

                        })
                    })
                }
                
            }).catch(err => {
                //console.log(err);
                return res.status(400).json({
                    status: false,
                    message: 'Added To CRM Status Update Failed! Please Try Again. ',
                })
            })
        } else {
            return res.status(200).json({
                status: true,
                message: 'Added To CRM Status Updated to ' + status + '!',
            })
        }
    }).catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: 'Status Update Failed. Please Try Again!'
        })
    })
}

// GET

exports.changeQualifiedValue = async (req,res,next) => {
    let { userId, leadId, value} = req.query;
    let arr = ["?", "😟", "🙁" , "😊","🥰","😍"];
    await Lead.findByIdAndUpdate(leadId, {
            leadQualified: value
    }).then(async (success) => {
        if (value > 2) {
            await User.findOne({_id: userId, "qualifiedLeads.workedOnLeads": {$nin: [leadId]}}).then(async (suc) => {
                //console.log("suc - ",suc);
                if (suc) {
                    await User.findByIdAndUpdate(userId, {
                        $set: {
                            "qualifiedLeads.count": suc.qualifiedLeads.count + 1,
                        },
                        $push: {
                            "qualifiedLeads.workedOnLeads": leadId,
                        }
                    }).then(async (su) => {
                        //console.log(su);
                        let now = new Date();
                        let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        let resultArray = await ActionLogger.find({ date: {$gte: today}, user: userId});
                        //console.log(resultArray);
                        if (resultArray.length > 0) {
                            await ActionLogger.findOneAndUpdate({ _id: resultArray[0]._id}, {
                                $set: {
                                    "qualifiedLeads": suc.qualifiedLeads.count + 1,
                                },
                                }).then(resSuccess => {
                                    return res.status(200).json({
                                        status: true,
                                        message: 'Qualified Status Updated to ' + arr[value] + '!',
                                        qualifiedCount: su.qualifiedLeads.count + 1
                                    })  
                            }).catch(err => {
                                //console.log(err);
                                return res.status(400).json({
                                    status: false,
                                    message: 'Status Change Failed! Please Try Again.'
                                })
                            })
                        } else {
                            let actionLog = new ActionLogger({
                                date: today,
                                user: userId,
                                qualifiedLeads: su.qualifiedLeads.count + 1
                            })
                            actionLog.save().then(async (resSuccess) => {
                                //console.log("Res Success - ", resSuccess);
                                await User.findByIdAndUpdate(userId, {
                                    $push: {
                                        actionLogger: resSuccess._id
                                    }
                                }).then(updateSuccess => {
                                    return res.status(200).json({
                                        status: true,
                                        message: 'Qualified Status Updated to ' + arr[value] + '!',
                                        qualifiedCount: su.qualifiedLeads.count + 1
                                    })  
                                }).catch(err => {
                                    //console.log(err);
                                    return res.status(400).json({
                                        status: false,
                                        message: 'Status Change Failed! Please Try Again.'
                                    })    
                                })
                            }).catch(err => {
                                //console.log(err);
                                return res.status(400).json({
                                    status: false,
                                    message: 'Status Change Failed! Please Try Again.'
                                })
                            })
                        } 
                          
                    }).catch(err => {
                        //console.log(err)
                    })
                } else {
                    await User.findById(userId).then(resp => {
                        return res.status(200).json({
                            status: true,
                            message: 'Qualified Status Updated to ' + arr[value] + '!',
                            qualifiedCount: resp.qualifiedLeads.count
                        })
                    }).catch(err => {
                        //console.log(err);
                        return res.status(400).json({
                            status: false,
                            message: 'Qualified Status Update Failed! Please Try Again. ',

                        })
                    })
                }
                
            }).catch(err => {
                //console.log(err);
                return res.status(400).json({
                    status: false,
                    message: 'Qualified Status Update Failed! Please Try Again. ',
                })

            })
        } else {
            return res.status(200).json({
                status: true,
                message: 'Qualified Status Updated to ' + arr[value] + '!',
            })
        }
    }).catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: 'Qualified Value Update Failed. Please Try Again!'
        })
    })
}

// POST
exports.updateNotesByLeads = async (req, res, next) => {
    const { leadId, leadNotes } = req.body;
    await Lead.findByIdAndUpdate(leadId, {
        $set: {
            leadNotes: leadNotes
        }
    }).then(success => {
        return res.status(200).json({
            status: true,
            message: 'Notes By Leads Updated!'
        })
    }).catch(err => {
        return res.status(400).json({
            status: false,
            message: 'Notes By Leads Update Failed. Please Try Again!'
        })
    })
}

exports.deleteNotesByLeads = async (req, res, next) => {
    const { leadId } = req.body;
    await Lead.findByIdAndUpdate(leadId, {
        $set: {
            leadNotes: ""
        }
    }).then(success => {
        return res.status(200).json({
            status: true,
            message: 'Notes By Leads Deleted!'
        })
    }).catch(err => {
        return res.status(400).json({
            status: false,
            message: 'Notes By Leads Delete Failed. Please Try Again!'
        })
    })
}

exports.editAgencyNotes = async (req, res, next) => {
    const {leadId, agencyNotes} = req.body;
    await Lead.findByIdAndUpdate(leadId, {            
            $set: {
                agencyNotes: agencyNotes
            }
        }).then(success => {
            return res.status(200).json({
                status: true,
                message: 'Agency Notes Saved!'
            })
        }).catch(err => {
            //console.log(err)
            return res.status(400).json({
                status: false,
                message: 'Notes Edit Failed! Please Try Again.'
            })
        })
}

exports.deleteAgencyNotes = async (req, res, next) => {
    const {leadId} = req.body;
    await Lead.findByIdAndUpdate(leadId, {
        $set: {
            agencyNotes: ""
        }
    }).then(success => {
        return res.status(200).json({
            status: true,
            message: 'Agency Note Deleted!'
        })
    }).catch(err => {
        //console.log(err)
        return res.status(400).json({
            status: false,
            message: 'Notes Delete Failed! Please Try Again.'
        })
    })
}

// Filters
exports.filterLeads = async (req, res, next) => {
    const queryObject = req.body;
    if(queryObject.adName && queryObject.adName == '') {
        delete queryObject.adName;
    }
    let results = await Lead.find(queryObject).sort({ createdAt: -1 }).exec();
    
    results.sort((r1, r2) => {
        const aKey = r1.leadContactedByAgency || 'Not Yet'; // Treat missing key as 'Not Yet'
        const bKey = r2.leadContactedByAgency || 'Not Yet'; // Treat missing key as 'Not Yet'
        if(aKey === 'Not Yet' && bKey !== 'Not Yet') {
            return -1;
        } else if (aKey !== 'Not Yet' && bKey === 'Not Yet') {
            return 1;
        } else {
            return 0;
        }
    })
    
    let contactedResults = results.filter((item) => {
        return item.leadContactedByAgency == 'Not Yet' || item.leadContactedByAgency == 'No'
    });

    return res.status(200).json({
        status: true,
        totalCount: results.length,
        notContactedCount: results.length > 0 ? contactedResults.length : 0,
        data: results
    })
}

exports.addLeadsViaCSV = async (req, res, next) => {
    let filePath = req.file.path;
    let {jobName, countryName} = req.body;
    //console.log(jobName, countryName);
    let file = xlsx.parse(filePath);
    let message = "";
    let status = false;
    let job = jobName ? JSON.parse(jobName) : {};
    let uploadCount = 0;
    let sourceName = "";
    let jobAdName = "";
    uploadCount = (file[0].data).length - 1;
    let isCompleted = new Promise(async (resolve, reject) => {
        for (var i = 1; i < (file[0].data).length; i++) {
            let mainData = file[0].data[i];
            if (mainData[0] == undefined) {
                mainData[0] = ""
            }
            console.log(mainData);
            let countryMarket = (countryName === mainData[0]) ? countryName.toUpperCase() : mainData[0].toUpperCase();
            let candidatName = mainData[1];
            let phone = mainData[2] ? mainData[2].replaceAll(/[A-Za-z`+ :]/g,"") : "";
            let source = mainData[3];
            sourceName = source;
            let adName = job.adName;
            jobAdName = adName;
            let email = mainData[4] ? mainData[4] : "";
            let leadPrice = mainData[5] ? mainData[5] : "";
            let leadNotes = mainData[6] ? mainData[6] : "";
            
            await Lead.findOneAndUpdate({
                leadCountryMarket: countryMarket,
                phoneNumber: phone,
                adName: adName,
            }, {
                    leadCountryMarket: countryMarket,
                    leadCandidatName: candidatName,
                    phoneNumber: phone,
                    leadSource: source,
                    adName: adName,
                    email: email,
                    leadPrice: leadPrice,
                    leadNotes: leadNotes,
                    leadPreContacted: "Not Yet",
                    leadContactedByAgency: "Not Yet",
                    leadAddedToCRM: false,
                    leadQualified: 0,
                    agencyNotes: "",
                }
            )
            .then(suc => {
                console.log(suc);
                if(suc == null) {
                    const newLead = new Lead({
                        leadCountryMarket: countryMarket,
                        leadCandidatName: candidatName,
                        phoneNumber: phone,
                        leadSource: source,
                        adName: adName,
                        email: email,
                        leadPrice: leadPrice,
                        leadNotes: leadNotes,
                        leadPreContacted: "Not Yet",
                        leadContactedByAgency: "Not Yet",
                        leadAddedToCRM: false,
                        leadQualified: 0,
                        agencyNotes: "",
                    })
                    newLead.save().then(() => {
                        message = 'Leads from the CSV has been successfully added to the CRM!'
                        status = true;
                    }).catch(err => {
                        //console.log(err)
                        message = 'Leads from the CSV has NOT been added to the CRM! Please Try Again.'
                        status = false;
                    })
                } else {
                    message = "Leads Updated in the CRM!";
                    status = true;
                }
            })
            .catch(err => {
                status = false;
            })

            if (i == (file[0].data).length - 1) {
                resolve(true)
            }
        }
    })

    if (await isCompleted) {
        fs.unlinkSync(req.file.path);
        if (message !== "") {
            const mailData = {
                from: 'intermanncrm@gmail.com',  // sender address
                to: mailList,   // list of receivers
                subject: `${uploadCount} Leads for ${jobAdName} imported on job center`,
                text: 'That was easy!',
                html: `Hello Intermann team, <b> ${uploadCount}</b> Leads have been imported for <b>${jobAdName}</b><br>
                       ${uploadCount} Leads from <b> ${sourceName ? sourceName : 'Source Name Not Available!'}. </b>`
            };
            transporter.sendMail(mailData, (err, info) => {
                if (err) {
                    //console.log("In If - ",err)
                } else {
                    //console.log("In If - ",info)
                }
            })
            res.write(JSON.stringify({
                status: status,
                message: message
            }))
            res.end();
        } else {
            status = true;
            message = 'Leads Added Successfully!';
            const mailData = {
                from: 'intermanncrm@gmail.com',  // sender address
                to: mailList,   // list of receivers
                subject: `${uploadCount} Leads for ${jobAdName} imported on job center`,
                text: 'That was easy!',
                html: `Hello Intermann team, <b> ${uploadCount}</b> Leads have been imported for <b>${jobAdName}</b><br>
                       ${uploadCount} Leads from <b> ${sourceName ? sourceName : 'Source Name Not Available!'}. </b>`
            };
            transporter.sendMail(mailData, (err, info) => {
                if (err) {
                    //console.log("In Else - ", err)
                } else {
                    //console.log("In Else - ",info)
                }
            })
            res.write(JSON.stringify({
                status: status,
                message: message
            }));
            res.end()
        }
    } else {
        message = 'Leads from the CSV has NOT been added to the Database! The Leads might already exists in the CRM. Please Check and Try Again.'
        res.write(JSON.stringify({
            status: false,
            message: message
        }))
        res.end()
    }
}

exports.viewAllLeads = async (req, res, next) => {
    const { market, skip } = req.query;
    let results = await Lead.find({ leadCountryMarket: market }).sort({ createdAt: -1 }).skip(skip).limit(20).exec();
    // let results = await Lead.find({ leadCountryMarket: market }).sort({ createdAt: -1 }).exec();
    let contactedResults = await Lead.find({ leadCountryMarket: market, leadContactedByAgency: ["Not Yet", "No"] }).sort({ createdAt: -1 }).exec();
    let preContactedResults = await Lead.find({ leadCountryMarket: market, leadPreContacted: ["Not Yet", "No"] }).sort({ createdAt: -1 }).exec();

    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            totalCount: results.length,
            notContactedCount: contactedResults.length,
            notPreContactedCount: preContactedResults.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            notContactedCount: 0,
            notPreContactedCount: 0,
            totalCount: results.length,
        })
    }
}

exports.updateLeads = async (req, res, next) => {
    const {value} = req.body;
    await Lead.updateMany({ adName: value }, {
        adName: 'ELECTRICIAN/ELECTRICIAN'
    }).then(success => {
        //console.log(success)
    }).catch(err => {
        //console.log(err)
    })
}

exports.getAllDistinctLeads = async (req, res, next) => {
    let results = await Lead.distinct("adName");
    return res.status(200).json({
        data: results
    })
}