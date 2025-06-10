const Representence = require("../models/representence");
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

const mailList = [ "contact@intermann.ro", "adriantudor@intermann.ro", "patrickroggy@intermann.ro", "nikhilsunil90s@gmail.com", "oanasindieintermann@gmail.com", "daianaintermann@gmail.com", "daiana@intermann.ro" ];
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

const representencePromise = async (data) => {
    ////console.loge.log(data);
    const html = fs.readFileSync("utils/candidat_representence.html" , 'utf-8');
    let representenceDocument = {
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
    
    return await pdf.create(representenceDocument, options);

} 

const dateFormatter = (d) => {
    let _d = d.split("-")
    return _d[1] + "-" + _d[0] + "-" + _d[2];
}

exports.makeRepresentence = async (req,res,next) => {
    let {
       representenceId, // could be null - if new representence is being generated
       candidat, // candidatId,
       candidatName,
       candidatPhone,
       candidat_birthday,
       candidat_birthcity,
       debut_mission_date,
       fin_mission_date,
       company_address,
       company_name,
    } = req.body;

    if (representenceId) {
        Representence.findById(representenceId).then(repdata => {
            if (repdata) {
                Representence.findByIdAndUpdate(representenceId, {
                    candidat_birthday: candidat_birthday,
                    candidat_birthcity: candidat_birthcity,
                    debut_mission_date: debut_mission_date,
                    fin_mission_date: fin_mission_date,
                    company_address: company_address,
                    company_name: company_name,
                }).then(resultData => {
                    const data = {
                        _id: resultData._id,
                        candidatName: candidatName,
                        candidatBirthday: candidat_birthday,
                        candidatPhone: candidatPhone,
                        candidatBirthcity: candidat_birthcity,
                        debutMission: debut_mission_date,
                        finMission: fin_mission_date,
                        companyAddress: company_address,
                        companyName: company_name,
                        representenceId: representenceId,
                        generated_on: resultData.generated_on
                    }
                    representencePromise(data)
                    .then(response => {
                        //////console.loge.log(response);
                        if (!response) {
                            return 0;
                        }
                        //////console.loge.log(response);
                        return res.status(200)
                                .json({
                                    message: "Modified Representence Successfully!",
                                    filePath: response.filename.split("\\")[response.filename.split("\\").length - 1],
                                    status: true
                                })
                    })
                }).catch(err => {
                    return res.status(400)
                .json({
                    message: "Representence Make Failed!",
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
        let representence_generated_on = dd + "-" + mm + "-" + yyyy;
        const newRepresentence = new Representence({
            candidat: candidat,
            candidat_phone: candidatPhone,
            candidat_name: candidatName,
            candidat_birthday: candidat_birthday,
            candidat_birthcity: candidat_birthcity,
            debut_mission_date: debut_mission_date,
            fin_mission_date: fin_mission_date,
            company_name: company_name,
            company_address: company_address,
            generated_on: representence_generated_on
        })

        newRepresentence
        .save()
        .then((resData) => {
                const data = {
                    _id: resData._id,
                    candidatName: candidatName,
                    companyName: company_name,
                    candidatBirthday: candidat_birthday,
                    candidatBirthcity: candidat_birthcity,
                    debutMission: debut_mission_date,
                    finMission: fin_mission_date,
                    companyAddress: company_address,
                    candidatPhone: candidatPhone,
                    representenceId: resData._id,
                    generated_on: representence_generated_on
                }
                representencePromise(data)
                .then(response => {
                    if (!response) {
                        return 0;
                    }
                    //////console.loge.log(response);
                    return res.status(200)
                            .json({
                                message: "Representence Generated Successfully!",
                                filePath: response.filename.split("\\")[response.filename.split("\\").length - 1],
                                status: true
                            })
                })
            })
        .catch(err => {
            //console.log(err);
            return res.status(400)
                .json({
                    message: "Representence Make Failed!",
                    status: false
                })
        })        
    }
}

exports.getRepresentence = async (req,res,next) => {
    //console.log("Getting Representence!");
    let { representenceId } = req.query;
    await Representence.findById(representenceId)
    .then(canResult => {
        const data = {
            _id: canResult._id,
            candidatName: canResult.candidat_name,
            candidatBirthday: canResult.candidat_birthday,
            candidatPhone: canResult.candidat_phone,
            candidatBirthcity: canResult.candidat_birthcity,
            debutMission: canResult.debut_mission_date,
            finMission: canResult.fin_mission_date,
            companyAddress: canResult.company_address,
            companyName: canResult.company_name,
            representenceId: canResult._id,
            generated_on: canResult.generated_on
        }
        representencePromise(data).then(async (reponse) => {
            // ////console.loge.log(reponse, reponse.filename.split("\\")[reponse.filename.split("\\").length - 1]);
            let locaFilePath = reponse.filename.split("\\")[reponse.filename.split("\\").length - 1];
            locaFilePath = locaFilePath.split("/")[locaFilePath.split("/").length - 1];
            let result = await uploadToCloudinary(locaFilePath);
            // ////console.loge.log(result);
            return res.status(200).json({
                status: true,
                filePath: result.url,
                public_id: result.public_id,
                message: "Representence Generated!"
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

exports.getRepresentenceForCandidat = async (req, res, next) => {
    //console.log("representence candidat get - ");
    const { candidatId } = req.query;
    let result = await Representence.findOne({ candidat: candidatId })
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

exports.saveRepresentence = async (req,res,next) => {
    let {
        representenceId, // could be null - if new representence is being generated
        candidat, // candidatId,
        candidatName,
        candidatPhone,
        candidat_birthday,
        candidat_birthcity,
        debut_mission_date,
        fin_mission_date,
        company_address,
        company_name,
     } = req.body;
 
     if (representenceId) {
         Representence.findById(representenceId).then(repdata => {
             if (repdata) {
                 Representence.findByIdAndUpdate(representenceId, {
                     candidat_birthday: candidat_birthday,
                     candidat_birthcity: candidat_birthcity,
                     debut_mission_date: debut_mission_date,
                     fin_mission_date: fin_mission_date,
                     company_address: company_address,
                     company_name: company_name,
                 }).then(resultData => {
                         return res.status(200)
                                 .json({
                                     message: "Modified Representence Successfully!",
                                     representenceid: resultData._id,
                                     status: true
                                 })
                 }).catch(err => {
                     return res.status(400)
                 .json({
                     message: "Representence Save Failed!",
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
                 let representence_generated_on = dd + "-" + mm + "-" + yyyy;
                 const newRepresentence = new Representence({
                     candidat: candidat,
                     candidat_phone: candidatPhone,
                     candidat_name: candidatName,
                     candidat_birthday: candidat_birthday,
                     candidat_birthcity: candidat_birthcity,
                     debut_mission_date: debut_mission_date,
                     fin_mission_date: fin_mission_date,
                     company_name: company_name,
                     company_address: company_address,
                     generated_on: representence_generated_on
                 })
         
                 newRepresentence
                 .save()
                 .then((resData) => {
                         
                             return res.status(200)
                                     .json({
                                         message: "Representence Generated Successfully!",
                                         representenceid: resData._id,
                                         status: true
                                     })
                     })
                 .catch(err => {
                     //////console.loge.log(err)
                     return res.status(400)
                         .json({
                             message: "Representence Make Failed!",
                             status: false
                         })
                 })        
     }
}

exports.addSignatures = async (req,res,next) => {
    let { representenceId, signature, public_id } = req.body;
    // ////console.loge.log(signature);
    let datetoday = new Date();
    let dd = String(datetoday.getDate()).padStart(2, '0');
    let mm = String(datetoday.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = datetoday.getFullYear();
    
    await Representence.findByIdAndUpdate(representenceId, { 
        $set: {
            signature: signature,
            signed_on: dd + "-" + mm + "-" + yyyy
        }
    })
    .then(success => {
        const data = {
            _id: success._id,
            candidatName: success.candidat_name,
            candidatBirthday: success.candidat_birthday,
            candidatPhone: success.candidat_phone,
            candidatBirthcity: success.candidat_birthcity,
            debutMission: success.debut_mission_date,
            finMission: success.fin_mission_date,
            companyAddress: success.company_address,
            companyName: success.company_name,
            representenceId: success._id,
            generated_on: success.generated_on,
            signature: signature,
            signed_on: dd + "-" + mm + "-" + yyyy
        }
        representencePromise(data).then(async (reponse) => {
            ////console.loge.log(reponse, reponse.filename.split("\\")[reponse.filename.split("\\").length - 1]);
            let locaFilePath = reponse.filename.split("\\")[reponse.filename.split("\\").length - 1];
            locaFilePath = locaFilePath.split("/")[locaFilePath.split("/").length - 1];
            let result = await uploadToCloudinary(locaFilePath);
            ////console.loge.log(result);
            await Representence.findByIdAndUpdate(representenceId, {
                $set: {
                    signed_representence_url: result.url
                }
            })
            const mailData = {
                from: 'intermanncrm@gmail.com',  // sender address
                to: mailList,   // list of receivers
                subject: `${success.candidat_name} signed his Representence.`,
                text: 'That was easy!',
                html: `Hello, <br/> <b>${success.candidat_name}</b> signed his Representence with <b>Intermann</b> in the CRM. <br/>Please download the attachment and store it in the CRM/Drive`,
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

exports.getSignedRepresentence = async (req, res, next) => {
    let {id} = req.query;
    let result = await Representence.find({ _id :id }).lean();
    if (result.length > 0) {
        if (result[0]?.signature) {
            const data = {
                _id: result[0]._id,
                candidatName: result[0].candidat_name,
                companyName: result[0].company_name,
                candidatBirthday: result[0].candidat_birthday,
                candidatBirthcity: result[0].candidat_birthcity,
                debutMission: result[0].debut_mission_date,
                finMission: result[0].fin_mission_date,
                companyAddress: result[0].company_address,
                candidatPhone: result[0].candidat_phone,
                representenceId: result[0]._id,
                generated_on: result[0].generated_on,
                signature: result[0].signature
            }
            representencePromise(data).then(success => {
                let file = success.filename.split("\\")[success.filename.split("\\").length - 1];
                return res.status(200).json({
                    status: true,
                    message: 'Representence Fetched Successfully!',
                    filepath: file
                })
            }).catch(err => {
                //console.log(err)
                return res.status(400).json({
                    status: false,
                    message: 'Unable To Fetch Representence! Please Try Again.'
                })
            })
        } 
    } else {
        return res.status(400).json({
            status: false,
            message: 'No Signed Representence Found!'
        })
    }
}

exports.getSignedRepresentences = async (req, res, next) => {
    let results = await Representence.find({ signature: { $exists: true, $ne: null } }).sort({ createdAt: -1 }).exec();
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

exports.deleteRepresentence = async (req, res, next) => {
    const { representenceId } = req.query;
    
        await Representence.findByIdAndRemove(representenceId).then(removed => {
            return res.status(200).json({
                status: true,
                message: "Representence Deleted Successfully!"
            })
        }).catch(err => {
            //console.log(err);
            return res.status(400).json({
                status: false,
                message: "Representence Not Deleted! Please Try Again."
            })    
    }).catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: "Representence Not Deleted! Please Try Again."
        })
    })
}