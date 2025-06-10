const Avance = require("../models/avance");
const nodemailer = require("nodemailer");
const pdf = require('pdf-creator-node');
const fs = require('fs');
const path = require('path');
const cloudinary = require("cloudinary").v2;

cloudinary.config({ 
    cloud_name: 'dj06tvfjt', 
    api_key: '122145526342654', 
    api_secret: 'PgTTOnNXzbw2mcSVgCob59JBi6A' 
});

const mailList = ["daianaintermann@gmail.com", "daiana@intermann.ro", "contact@intermann.ro", "adriantudor@intermann.ro", "patrickroggy@intermann.ro", "nikhilsunil90s@gmail.com", "oanasindieintermann@gmail.com" ];
// const mailList = ["nikhilsunil90s@gmail.com"];
// const mailList = ["sabir.pushideas@gmail.com", "nikhilsunil90s@gmail.com"];


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

const avancePromise = async (data) => {
    ////console.loge.log(data);
    const html = fs.readFileSync("utils/candidat_avance.html" , 'utf-8');
    let avanceDocument = {
        html: html,
        data: data,
        path: `./uploads/${data.candidatName + "-" + data._id}.pdf`
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
    
    return await pdf.create(avanceDocument, options);
} 

const dateFormatter = (d) => {
    let _d = d.split("-")
    return _d[1] + "-" + _d[0] + "-" + _d[2];
}

exports.makeAvance = async (req,res,next) => {
    let {
       avanceId, // could be null - if new representence is being generated
       candidat, // candidatId,
       candidatName,
       amount_avance,
       period_avance,
    } = req.body;

    if (avanceId) {
        Avance.findById(avanceId).then(repdata => {
            if (repdata) {
                Avance.findByIdAndUpdate(avanceId, {
                    amount_avance: amount_avance,
                    period_avance: period_avance,
                }).then(resultData => {
                    const data = {
                        _id: resultData._id,
                        candidatName: candidatName,
                        avanceId: avanceId,
                        amountAvance: amount_avance,
                        periodAvance: period_avance,
                        generated_on: resultData.generated_on
                    }
                    avancePromise(data)
                    .then(response => {
                        //////console.loge.log(response);
                        if (!response) {
                            return 0;
                        }
                        //////console.loge.log(response);
                        return res.status(200)
                                .json({
                                    message: "Modified Avance Successfully!",
                                    filePath: response.filename.split("\\")[response.filename.split("\\").length - 1],
                                    status: true
                                })
                    })
                }).catch(err => {
                    return res.status(400)
                .json({
                    message: "Avance Make Failed!",
                    status: false
                })
                })
            } 
        })

    } 
    else {
        let datetoday = new Date();
        let dd = String(datetoday.getDate()).padStart(2, '0');
        let mm = String(datetoday.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = datetoday.getFullYear();
        let avance_generated_on = dd + "-" + mm + "-" + yyyy;
        const newAvance = new Avance({
            candidat: candidat,
            candidat_name: candidatName,
            amount_avance: amount_avance,
            period_avance: period_avance,
            generated_on: avance_generated_on
        })

        newAvance
        .save()
        .then((resData) => {
                const data = {
                    _id: resData._id,
                    candidatName: candidatName,
                    avanceId: avanceId,
                    amountAvance: amount_avance,
                    periodAvance: period_avance,
                    generated_on: avance_generated_on
                }
                avancePromise(data)
                .then(response => {
                    if (!response) {
                        return 0;
                    }
                    //////console.loge.log(response);
                    return res.status(200)
                            .json({
                                message: "Avance Generated Successfully!",
                                filePath: response.filename.split("\\")[response.filename.split("\\").length - 1],
                                status: true
                            })
                })
            })
        .catch(err => {
            //console.log(err);
            return res.status(400)
                .json({
                    message: "Avance Make Failed!",
                    status: false
                })
        })        
    }
}

exports.getAvance = async (req,res,next) => {
    //console.log("Getting Representence!");
    let { avanceId } = req.query;
    await Avance.findById(avanceId)
    .then(canResult => {
        const data = {
            _id: canResult._id,
            candidatName: canResult.candidat_name,
            amountAvance: canResult.amount_avance,
            periodAvance: canResult.period_avance,
            generated_on: canResult.generated_on,
            avanceId: avanceId,
        }
        avancePromise(data).then(async (reponse) => {
            // ////console.loge.log(reponse, reponse.filename.split("\\")[reponse.filename.split("\\").length - 1]);
            let locaFilePath = reponse.filename.split("\\")[reponse.filename.split("\\").length - 1];
            locaFilePath = locaFilePath.split("/")[locaFilePath.split("/").length - 1];
            let result = await uploadToCloudinary(locaFilePath);
            // ////console.loge.log(result);
            return res.status(200).json({
                status: true,
                filePath: result.url,
                public_id: result.public_id,
                message: "Avance Generated!"
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

exports.getAvanceForCandidat = async (req, res, next) => {
    const { candidatId } = req.query;
    let result = await Avance.findOne({ candidat: candidatId })
    if (result) {
        return res.status(200).json({
            status: true,
            data: result
        })
    } else {
        return res.status(400).json({
            status: false
        })
    }
}

exports.saveAvance = async (req,res,next) => {
    let {
        avanceId, // could be null - if new representence is being generated
        candidat, // candidatId,
        candidatName,
        amount_avance,
        period_avance
     } = req.body;
 
     if (avanceId) {
         Avance.findById(avanceId).then(repdata => {
             if (repdata) {
                 Avance.findByIdAndUpdate(avanceId, {
                     amount_avance: amount_avance,
                     period_avance: period_avance
                 }).then(resultData => {
                         return res.status(200)
                                 .json({
                                     message: "Modified Avance Successfully!",
                                     avanceid: resultData._id,
                                     status: true
                                 })
                 }).catch(err => {
                     return res.status(400)
                 .json({
                     message: "Avance Save Failed!",
                     status: true
                 })
                 })
             } 
         })
 
     } 
     else {
                 let datetoday = new Date();
                 let dd = String(datetoday.getDate()).padStart(2, '0');
                 let mm = String(datetoday.getMonth() + 1).padStart(2, '0'); //January is 0!
                 let yyyy = datetoday.getFullYear();
                 let avance_generated_on = dd + "-" + mm + "-" + yyyy;
                 const newAvance = new Avance({
                     candidat: candidat,
                     candidat_name: candidatName,
                     amount_avance: amount_avance,
                     period_avance: period_avance,
                     generated_on: avance_generated_on
                 })
         
                 newAvance
                 .save()
                 .then((resData) => {
                         
                             return res.status(200)
                                     .json({
                                         message: "Avance Generated Successfully!",
                                         avanceid: resData._id,
                                         status: true
                                     })
                     })
                 .catch(err => {
                     //////console.loge.log(err)
                     return res.status(400)
                         .json({
                             message: "Avance Make Failed!",
                             status: false
                         })
                 })        
     }
}

exports.addSignatures = async (req,res,next) => {
    let { avanceId, signature, public_id } = req.body;
    // ////console.loge.log(signature);
    let datetoday = new Date();
    let dd = String(datetoday.getDate()).padStart(2, '0');
    let mm = String(datetoday.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = datetoday.getFullYear();
    
    await Avance.findByIdAndUpdate(avanceId, { 
        $set: {
            signature: signature,
            signed_on: dd + "-" + mm + "-" + yyyy
        }
    })
    .then(success => {
        const data = {
            _id: success._id,
            candidatName: success.candidat_name,
            amountAvance: success.amount_avance,
            periodAvance: success.period_avance,
            avanceId: success._id,
            generated_on: success.generated_on,
            signature: signature,
            signed_on: dd + "-" + mm + "-" + yyyy
        }
        avancePromise(data).then(async (reponse) => {
            ////console.loge.log(reponse, reponse.filename.split("\\")[reponse.filename.split("\\").length - 1]);
            let locaFilePath = reponse.filename.split("\\")[reponse.filename.split("\\").length - 1];
            locaFilePath = locaFilePath.split("/")[locaFilePath.split("/").length - 1];
            let result = await uploadToCloudinary(locaFilePath);
            //console.loge.log(result);
            await Avance.findByIdAndUpdate(avanceId, {
                $set: {
                    signed_avance_url: result.url
                }
            })
            const mailData = {
                from: 'intermanncrm@gmail.com',  // sender address
                to: mailList,   // list of receivers
                subject: `${success.candidat_name} signed his Avance.`,
                text: 'That was easy!',
                html: `Hello, <br/> <b>${success.candidat_name}</b> signed his Avance with <b>Intermann</b> in the CRM. <br/>Please download the attachment and store it in the CRM/Drive`,
                attachments: [{
                    filename: success.candidat_name + ".pdf",
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


exports.getSignedAvances = async (req, res, next) => {
    let results = await Avance.find({ signature: { $exists: true, $ne: null } }).sort({ createdAt: -1 }).exec();
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

exports.getSignedAvance = async (req, res, next) => {
    let {id} = req.query;
    let result = await Avance.find({ _id :id }).lean();
    //console.log( "Result - " , result[0]);
    if (result.length > 0) {
        if (result[0]?.signature) {
            avancePromise(result[0]).then(success => {
                let file = success.filename.split("\\")[success.filename.split("\\").length - 1];
                return res.status(200).json({
                    status: true,
                    message: 'Avance Fetched Successfully!',
                    filepath: file
                })
            }).catch(err => {
                //console.log(err)
                return res.status(400).json({
                    status: false,
                    message: 'Unable To Fetch Avance! Please Try Again.'
                })
            })
        }
    } else {
        return res.status(400).json({
            status: false,
            message: 'No Signed Avance Found!'
        })
    }
}

exports.deleteAvance = async (req, res, next) => {
    const { avanceId } = req.query;
    
        await Avance.findByIdAndRemove(avanceId).then(removed => {
            return res.status(200).json({
                status: true,
                message: "Avance Deleted Successfully!"
            })
        }).catch(err => {
            //console.log(err);
            return res.status(400).json({
                status: false,
                message: "Avance Not Deleted! Please Try Again."
            })    
    }).catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: "Avance Not Deleted! Please Try Again."
        })
    })
}