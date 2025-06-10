const OfferModel = require("../models/offer");
const ClientModel = require('../models/client');
const CommerceModel = require("../models/commerce");
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-creator-node');
const banner = fs.readFileSync('uploads/workimg.png');
const redcircle = fs.readFileSync('uploads/redcircle.png')
const qr = fs.readFileSync('uploads/qrcode.png');
const face = fs.readFileSync('uploads/facefood.png');
const lastpage = fs.readFileSync('uploads/lastpage.png');
const base64Banner = Buffer.from(banner).toString('base64');
const base64QRCode = Buffer.from(qr).toString('base64');
const lastPage = Buffer.from(lastpage).toString('base64');
const faceFood = Buffer.from(face).toString('base64');
const redCircleImg = Buffer.from(redcircle).toString('base64');
const nodemailer = require("nodemailer");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: 'dj06tvfjt',
    api_key: '122145526342654',
    api_secret: 'PgTTOnNXzbw2mcSVgCob59JBi6A'
});

const mailList = ["nikhilsunil90s@gmail.com", "contact@intermann.ro", "patrickroggy@intermann.ro", "morgan.roggy31@gmail.com"];
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

async function uploadToCloudinary(locaFilePath) {
    // locaFilePath :
    // path of image which was just uploaded to "uploads" folder

    var mainFolderName = "uploads"
    // filePathOnCloudinary :
    // path of image we want when it is uploded to cloudinary
    var filePathOnCloudinary = mainFolderName + "/" + locaFilePath
    // console.log(filePathOnCloudinary);
    return cloudinary.uploader.upload(filePathOnCloudinary, { "public_id": locaFilePath, "resource_type": "auto" })
        .then((result) => {
            // Image has been successfully uploaded on cloudinary
            // So we dont need local image file anymore
            // Remove file from local uploads folder 
            //   fs.unlinkSync(filePathOnCloudinary);
            //   console.log(result);
            return {
                message: "Success",
                url: result.url,
                public_id: result.public_id,
            };
        }).catch((error) => {
            console.log(error);
            // Remove file from local uploads folder 
            //   fs.unlinkSync(filePathOnCloudinary)
            return { message: "Fail", };
        });
}

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
        "ÿ": "y",
        "œ": "oe",
        "Œ": "OE",
    };
    return str.replace(/[àâçéèêëîïôùûüÿ]/gi, function (match) {
        return replacements[match.toLowerCase()].toUpperCase() || match.toUpperCase();
    });
}

const offerPromise = async (data) => {
    let html = fs.readFileSync("utils/offer.html", 'utf-8');
    html = html.replace('{{imageData}}', base64Banner);
    html = html.replace('{{qrCode}}', base64QRCode);
    html = html.replace('{{facefood}}', faceFood);
    html = html.replace('{{redcircle}}', redCircleImg);
    html = html.replace('{{lastPage}}', lastPage);
    let companyName = replaceFrenchLetters(data.company_name)
    console.log(companyName);
    let offerDocument = {
        html: html,
        data: data,
        path: `./uploads/${data._id}.pdf`
    }
    console.log(data);

    const options = {
        format: 'A4',
        orientation: 'portrait',
        border: '0mm',
        remarkable: true,
        footer: {
            height: "5mm",
            contents: {
                first: 'First Page',
                default: '<span style="color: #444; text-align:center; ">Page {{page}}</span> of <span>{{pages}}</span>', // fallback value
                last: 'Last Page'
            }
        },
        childProcessOptions: {
            env: {
                OPENSSL_CONF: '/dev/null'
            }
        }
    }
    return await pdf.create(offerDocument, options);
}

exports.getOffers = async (req, res, next) => {
    let { offerType } = req.query;
    if (offerType == 'signed') {
        //console.log('in if');
        let results = await OfferModel.find({ $or: [{ signature: { $exists: true, $ne: null } }, { offer_signed: true }] }).populate({ path: "associated_lead", model: CommerceModel }).sort({ form_signed_on: -1 }).exec({})
        //console.log(results);
        if (results.length > 0) {
            return res.status(200).json({
                status: true,
                total: results.length,
                data: results,
            })
        } else {
            return res.status(400).json({
                status: true,
                total: results.length,
                data: results,
            })
        }
    } else if (offerType == 'unsigned') {
        //console.log('in else');
        let results = await OfferModel.find({ $or: [{ offer_signed: false }] }).populate({ path: "associated_lead", model: CommerceModel }).sort({ createdAt: -1 }).exec({})
        //console.log(results);
        if (results.length > 0) {
            return res.status(200).json({
                status: true,
                total: results.length,
                data: results,
            })
        } else {
            return res.status(400).json({
                status: true,
                total: results.length,
                data: results,
            })
        }
    }
}

exports.getOffer = async (req, res, next) => {
    let { offerId } = req.query;
    let result = await OfferModel.findById(offerId).lean();
    try {
        if (result) {
            const transformedMetiers = result.metiers.map(metier => {
                const plainMetier = JSON.parse(JSON.stringify(metier));

                plainMetier.next_hours = metier.heure_fait.length > 0 ? (metier.heure_fait.indexOf("H") > -1 ? (Number(metier.heure_fait.slice(0, -1)) + 1) + "H" : " H") : " H";
                plainMetier.extra_item = metier.panier_repas ? "Cette offre inclus le panier repas comme convenu" : null;
                plainMetier.text_libre = metier.text_libre && metier.text_libre.length > 0 ? metier.text_libre : "";

                return plainMetier;
            });
            let [mm, dd, yyyy] = result.offer_made_date.toLocaleDateString().split("/");
            let data = {
                _id: result._id,
                company_name: result.company_name.toUpperCase(),
                metiers: transformedMetiers,
                offer_made_date: dd + "-" + mm + "-" + yyyy,
                signature: result.signature,
            }
            offerPromise(data).then(async (success) => {
                let fp = success.filename.split("\\")[success.filename.split("\\").length - 1];
                // uapp.com/uploads/app/uploads/TEST-643518cb7bc
                // fp = fp.replace("/app/uploads", "");
                // console.log("https://intermann-v2.herokuapp.com/uploads"+fp);
                // const pdfDoc = await PDFDocument.load(existingPdfBytes);
                // const newlyGenPDF = fs.readFileSync("https://intermann-v2.herokuapp.com/uploads"+fp);
                // const [newPage] = pdfDoc.getPages().slice(-1);
                // const newPDF = await PDFDocument.load(newlyGenPDF);
                // const { width, height } = newPDF.getPage(0);
                // newPage.setSize(width, height);
                // const newPageContentStream = await pdfDoc.embedPageContents(newPDF.getPage(0));
                // newPage.drawPage(newPageContentStream);  
                // const modifiedPdfBytes = await pdfDoc.save();
                // fs.writeFileSync(fp, modifiedPdfBytes);
                return res.status(200).json({
                    status: true,
                    message: 'Offer Fetched!',
                    filepath: fp
                })
            }).catch(err => {
                console.log(err);
                return res.status(400).json({
                    status: false,
                    message: 'Offer Fetch Failed! Please Try Again.'
                })
            })
        } else {
            //console.log('No Offer found with this _id!');
            return res.status(400).json({
                status: false,
                message: 'Offer Fetch Failed! Please Try Again.'
            })
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            status: false,
            message: 'Offer Fetch Failed! Please Try Again.'
        })
    }

}

exports.generateOffer = async (req, res, next) => {
    let {
        company_name,
        company_email,
        metiers, // [] array of objects
        commercialLeadId,
    } = req.body;
    // salaire_35H,// will come with euro sign,
    // tax_35H, // will come with euro sign
    // heure_fait, // will come with H
    // tax_heure_fait, // will come with euaro sign
    // supplymentry_tax, // will come with euro sign
    // total_salaire,// will come with euro sign,
    let datetoday = new Date();
    try {
        const newOffer = new OfferModel({
            company_name: company_name,
            company_email: company_email,
            metiers: metiers, // [{ metier: "", salaire_35H, tax_35H, heure_fait, tax_heure_fait, supplymentary_tax, total_salaire }, ]
            offer_made_date: datetoday,
            associated_lead: commercialLeadId,
            offer_mode: 'commercial center',
            offer_signed: false,
        })

        newOffer.save().then(async (success) => {
            await CommerceModel.findByIdAndUpdate(commercialLeadId, {
                $set: {
                    offerSent: true,
                    offer_sent_date: datetoday,
                }
            })

            const transformedMetiers = success.metiers.map(metier => {
                const plainMetier = JSON.parse(JSON.stringify(metier));

                plainMetier.next_hours = metier.heure_fait.length > 0 ? (metier.heure_fait.indexOf("H") > -1 ? (Number(metier.heure_fait.slice(0, -1)) + 1) + "H" : " H") : " H";
                plainMetier.extra_item = metier.panier_repas ? "Cette offre inclus le panier repas comme convenu" : null;
                plainMetier.text_libre = metier.text_libre && metier.text_libre.length > 0 ? metier.text_libre : "";

                return plainMetier;
            });

            console.log(transformedMetiers);
            let [mm, dd, yyyy] = success.offer_made_date.toLocaleDateString().split("/");

            let data = {
                _id: success._id,
                company_name: success.company_name.toUpperCase(),
                metiers: transformedMetiers,
                offer_made_date: dd + "-" + mm + "-" + yyyy,
                signature: success.signature,
            }
            offerPromise(data).then(response => {
                let fp = response.filename.split("\\")[response.filename.split("\\").length - 1] // /app/uploads/filename - remove /app
                let fullpath = "https://intermann-v2.herokuapp.com" + fp.replace("/app", "");
                return res.status(200).json({
                    status: true,
                    message: "Offer Generation Successful! Please Check Email or the Downloaded file.",
                    data: success,
                    filepath: fullpath
                })
            }).catch(err => {
                console.log(err);
                return res.status(400).json({
                    status: false,
                    message: "Offer Generation Failed! Please Try Again."
                })
            })

        }).catch(err => {
            console.log(err);
            return res.status(400).json({
                status: false,
                message: "Offer Generation Failed! Please Try Again."
            })
        })
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            status: false,
            message: "Offer Generation Failed! Please Try Again."
        })
    }

}

exports.uploadOffer = async (req, res, next) => {
    let {
        company_name,
        offer_made_on, // dd-mm-yy format
        offer_signed, // boolean
    } = req.body;
    let datetoday = new Date();
    let dd = String(datetoday.getDate()).padStart(2, '0');
    let mm = String(datetoday.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = datetoday.getFullYear();
    if (req.file) {
        let locaFilePath = req.file.filename;
        var result = await uploadToCloudinary(locaFilePath);
        let folder = "";
        if (offer_signed) {
            folder = "offre_signee"
        } else {
            folder = "offre_envoyee"
        }
        let newOffer = new OfferModel({
            company_name: company_name,
            offer_made_date: offer_made_on == "" ? datetoday : offer_made_on,
            offer_signed: offer_signed,
            offer_mode: 'manual',
            offerDocument: {
                documentName: req.file.filename,
                originalName: req.file.originalname,
                folderName: folder,
                url: result.url,
                file_public_id: result.public_id
            }
        })

        newOffer.save().then(success => {
            return res.status(200).json({
                status: true,
                fileName: req.file.originalname,
                url: result.url,
                file_public_id: result.public_id,
                message: 'File Uploaded Successfully!'
            })
        }).catch(err => {
            //console.log(err);
            return res.status(400).json({
                status: false,
                message: 'Upload Failed! Please Try Again.'
            })
        })
    }
}

exports.addSignatures = async (req, res, next) => {
    let { offerId, signature } = req.body;
    let datetoday = new Date();
    let dd = String(datetoday.getDate()).padStart(2, '0');
    let mm = String(datetoday.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = datetoday.getFullYear();
    await OfferModel.findByIdAndUpdate(offerId, {
        $set: {
            signature: signature,
            offer_signed_on: dd + "-" + mm + "-" + yyyy,
            offer_signed: true,
        }
    })
        .lean()
        .then(success => {
            // console.log("success after signatures add - " , success , " create data object for pdf html.");
            success['signature'] = signature;
            offerPromise(success).then(async (reponse) => {
                ////console.loge.log(reponse, reponse.filename.split("\\")[reponse.filename.split("\\").length - 1]);
                // console.log(reponse);
                let locaFilePath = reponse.filename.split("\\")[reponse.filename.split("\\").length - 1];
                ////console.loge.log(result);
                let pathForCloudinary = locaFilePath.split("/")[locaFilePath.split("/").length - 1];
                let result = await uploadToCloudinary(pathForCloudinary);
                // console.log(result);
                const mailData = {
                    from: 'intermanncrm@gmail.com',  // sender address
                    to: mailList,   // list of receivers
                    subject: `${success.company_name} signed the Offer.`,
                    text: 'That was easy!',
                    html: `Hello, <br/> <b>${success.company_name}</b> signed the Offer with <b>Intermann</b> in the CRM. <br/>Please download the attachment and store it in the CRM/Drive`,
                    attachments: [{
                        filename: success.company_name + ".pdf",
                        path: result.url,
                    }]
                };

                transporter.sendMail(mailData, (err, info) => {
                    if (err) {
                        console.log(err)
                    } else {
                        //////console.loge.log(info)
                        return res.status(200).json({
                            status: true,
                            message: 'Offer Signed Successfully!',
                        })
                    }
                })
            })
                .catch(err => {
                    console.log(err);
                    return res.status(400).json({
                        status: false,
                        message: "Offer Sign Failed! Please Try Again."
                    })
                })

        })
        .catch(err => {
            console.log(err);
            return res.status(400).json({
                status: 400,
                message: "Signature Add Failed. Please Try Again!"
            })
        })
}

exports.deleteOffer = async (req, res, next) => {
    let { offerId } = req.query;
    //console.log(offerId);

    await OfferModel.findById(offerId).then(async (findResult) => {
        let responses = await OfferModel.find({ company_name: findResult.company_name });
        //console.log(responses.length);
        if (responses.length == 1) {
            await OfferModel.findByIdAndRemove(offerId)
                .then(async (success) => {
                    await CommerceModel.findOneAndUpdate({ companyName: success.company_name }, {
                        $set: {
                            offerSent: false,
                        }
                    })
                    return res.status(200).json({
                        status: true,
                        message: 'Offer Deleted Successfully!'
                    })
                }).catch(err => {
                    //console.log(err);
                    return res.status(400).json({
                        status: false,
                        message: 'Offer Delete Failed! Please Try Again.'
                    })
                })
        } else {
            await OfferModel.findByIdAndRemove(offerId)
                .then(async (success) => {
                    return res.status(200).json({
                        status: true,
                        message: 'Offer Deleted Successfully!'
                    })
                }).catch(err => {
                    //console.log(err);
                    return res.status(400).json({
                        status: false,
                        message: 'Offer Delete Failed! Please Try Again.'
                    })
                })
        }
    }).catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: 'Offer Delete Failed! Please Try Again.'
        })
    })
}

exports.deleteManualOfferDocument = async (req, res, next) => {
    let { doc_id, public_id } = req.query;
    await OfferModel.findByIdAndRemove(doc_id);
    cloudinary.uploader.destroy(public_id, function (err, result) {
        if (err) {
            //console.log(err);
            return res.status(400).json({
                status: false,
                message: "Delete Failed! Please Try Again."
            })
        } else {
            // //console.log(result);
            return res.status(200).json({
                status: true,
                message: "Document Deleted Successfully."
            })
        }
    })
}

exports.getAssociatedOffers = async (req, res, next) => {
    let { leadId } = req.query;
    //console.log(leadId);
    let results = await OfferModel.find({ associated_lead: leadId }).populate({ path: "associated_lead", model: CommerceModel }).sort({ createdAt: -1 }).exec({});
    // //console.log(results);
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            total: results.length,
            data: results,
        })
    } else {
        return res.status(400).json({
            status: false,
            total: results.length,
            data: results,
        })
    }
}


// pending
exports.addToCRM = async (req, res, next) => {
    let {
        companyName,
        phoneNumbers,
        email,
        notes
    } = req.body;
    let results = await ClientModel.find({ clientCompanyName: companyName })
    if (results.length > 0) {
        return res.status(400).json({
            status: false,
            message: 'A Client with same name already exists in the CRM.'
        })
    } else {

    }
}

// associate offer with either a Lead or a Client!
exports.linkOffer = async (req, res, next) => {
    let { leadId, clientId, offerId } = req.body;
    if (leadId != "") {
        await OfferModel.findByIdAndUpdate(offerId, {
            $set: {
                associated_lead: leadId,
            }
        }).then(async (success) => {
            await CommerceModel.findByIdAndUpdate(leadId, {
                $set: {
                    offerSent: true,
                    offer_sent_date: new Date(),
                }
            }).then(reponse => {
                return res.status(200).json({
                    status: true,
                    message: 'Offer Linked to Lead Successfully!'
                })
            }).catch(err => {
                //console.log(err);
                return res.status(400).json({
                    status: false,
                    message: 'Link to Lead Failed! Please Try Again.'
                })
            })

        }).catch(err => {
            //console.log(err);
            return res.status(400).json({
                status: false,
                message: 'Link to Lead Failed! Please Try Again.'
            })
        })
    } else if (clientId != "") {
        await OfferModel.findByIdAndUpdate(offerId, {
            $set: {
                associated_client: clientId,
            }
        }).then(async (success) => {
            // if its a manually uploaded offer
            // //console.log("success - " , success);
            if (success.offer_mode == 'manual') {
                let folder = ""
                if (success.offer_signed) {
                    folder = 'offre_signee'
                } else {
                    folder = 'offre_envoye_et_nonsigne'
                }
                await ClientModel.findByIdAndUpdate(clientId, {
                    $push: {
                        clientDocuments: {
                            documentName: success.documentName,
                            originalName: success.originalName,
                            folderName: folder,
                            url: success.url,
                            file_public_id: success.file_public_id
                        }
                    }
                }).then(passed => {
                    // //console.log('passed - ' , passed)
                    return res.status(200).json({
                        status: true,
                        message: 'Link to Client Successfull!'
                    })
                }).catch(err => {
                    //console.log(err);
                    return res.status(400).json({
                        status: false,
                        message: 'Link to Client Failed! Please Try Again.'
                    })
                })
            } else if (success.offer_mode == "commercial center") {
                let [mm, dd, yyyy] = success.offer_made_date.toLocaleDateString().split("/");
                let data = {
                    _id: success._id,
                    company_name: success.company_name.toUpperCase(),
                    metiers: success.metiers,
                    offer_made_date: dd + "-" + mm + "-" + yyyy,
                    signature: success.signature,
                }
                // //console.log(data);
                offerPromise(data)
                    .then(async (response) => {
                        // //console.log('response - ' , response);
                        let fp = response.filename.split("\\")[response.filename.split("\\").length - 1] // /app/uploads/filename - remove /app
                        let fullpath = "https://intermann-v2.herokuapp.com" + fp.replace("/app", "");
                        let filename = fp.replace("/app", "");
                        let folder = ""
                        if (success.offer_signed) {
                            folder = 'offre_signee'
                        } else {
                            folder = 'offre_envoye_et_nonsigne'
                        }
                        await ClientModel.findByIdAndUpdate(clientId, {
                            $push: {
                                clientDocuments: {
                                    documentName: filename,
                                    originalName: filename,
                                    folderName: folder,
                                    url: fullpath,
                                    file_public_id: ""
                                }
                            }
                        }).then(passed => {
                            // //console.log('passed - ' , passed)
                            return res.status(200).json({
                                status: true,
                                message: 'Link to Client Successfull!'
                            })
                        }).catch(err => {
                            //console.log(err);
                            return res.status(400).json({
                                status: false,
                                message: 'Link to Client Failed! Please Try Again.'
                            })
                        })
                    }).catch(err => {
                        //console.log(err);
                        return res.status(400).json({
                            status: false,
                            message: "Offer Link with Client Failed! Please Try Again."
                        })
                    })
            }
        }).catch(err => {
            //console.log(err);
            return res.status(400).json({
                status: false,
                message: "Offer Link with Client Failed! Please Try Again."
            })
        })
    } else {
        return res.status(400).json({
            status: false,
            message: "Wrong Input! Please Try Again."
        })
    }

}

exports.markAsSigned = async (req, res, next) => {
    let { offerId } = req.body;
    let datetoday = new Date();
    let dd = String(datetoday.getDate()).padStart(2, '0');
    let mm = String(datetoday.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = datetoday.getFullYear();
    await OfferModel.findByIdAndUpdate(offerId, {
        $set: {
            offer_signed: true,
            offer_signed_on: dd + "-" + mm + "-" + yyyy
        }
    }).then(success => {
        return res.status(200).json({
            status: true,
            message: 'Offer Marked as Signed!'
        })
    }).catch(err => {
        //console.log(err); 
        return res.status(400).json({
            status: false,
            message: "Offer Marking Failed! Please Try Again."
        })
    })
}

const changeDateFormat = (dateval) => {
    const originalDateString = dateval;
    const parts = originalDateString.split('-');
    const year = parts[2];
    const month = parts[1];
    const day = parts[0];

    const date = new Date(`${year}-${month}-${day}`);
    const isoDateString = date.toISOString();
    const formattedDateString = isoDateString.slice(0, 10);
    return formattedDateString;
}

exports.filterOffers = async (req, res, next) => {
    let query = req.body // { company_name, start_date, end_date, metier, offer_signed }
    if (query.start_date && query.end_date) {
        let sD = new Date(query.start_date);
        let eD = new Date(query.end_date);
        let results = await OfferModel.find({
            offer_made_date: {
                $gte: sD,
                $lt: eD
            },
            offer_signed: query.offer_signed,
        })
        //console.log(sD, eD, results.length);;
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
                data: results,
                message: 'No Offers Found in this date range.'
            })
        }
    } else {
        let results = await OfferModel.find(query);
        if (results.length > 0) {
            return res.status(200).json({
                status: true,
                total: results.length,
                data: results,
            })
        } else {
            return res.status(400).json({
                status: false,
                total: 0,
                data: results,
                message: 'No Offers Found with these Filters.'
            })
        }
    }
}

exports.updateDate = async (req, res, next) => {
    await OfferModel.updateMany(
        { offer_made_date: { $ne: "" } }, // only update documents where myDateField is not empty
        { $set: { offer_made_date: { $toDate: "$offer_made_date" } } }, // set myDateField to a Date object
        { multi: true } // update multiple documents
    ).then(success => {
        // //console.log(success);
        return res.status(200).json({
            status: true,
            message: 'Entries Updated!'
        })
    }).catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: 'Entries Update Failed!'
        })
    })
}