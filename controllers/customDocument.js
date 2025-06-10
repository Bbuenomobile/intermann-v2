const CustomDocumentModel = require("../models/customdocument");
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-creator-node');
const nodemailer = require("nodemailer");
const moment = require("moment");
const Handlebars = require("handlebars");
const cloudinary = require("cloudinary").v2;

cloudinary.config({ 
    cloud_name: 'dj06tvfjt', 
    api_key: '122145526342654', 
    api_secret: 'PgTTOnNXzbw2mcSVgCob59JBi6A' 
});

Handlebars.registerHelper('unescape', function (content) {
    return new Handlebars.SafeString(content);
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

const mailList = [ "nikhilsunil90s@gmail.com", "contact@intermann.ro", "adriantudor@intermann.ro", "bbueno@hotmail.fr", "intermanngabi@gmail.com", "oanasindieintermann@gmail.com", "daianaintermann@gmail.com", "daiana@intermann.ro" ];
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

const customDocumentPromise = async (data) => {
    let html = fs.readFileSync("utils/customdocument.html" , 'utf-8');
    let customDocument = {
        html: html,
        data: data,
        path: `./uploads/${data.name && data.name !== "" ? data.name : data.id}.pdf`
    }
    const options = {
        format: 'A4',
        orientation: 'portrait',
        border: '0mm',
        remarkable: true,
        childProcessOptions: {
            env: {
                OPENSSL_CONF: '/dev/null'
            }
        }
    }
    return pdf.create(customDocument, options);
}

exports.addCustomDocumentDetails = async (req, res, next) => {
    let {
        name,
        telephone,
        identity,
        document_title,
        document_content,
        document_lieu,
        generated_on
    } = req.body;
    const [day, month, year] = generated_on.split("-");
    let datetoday = new Date(`${year}-${month}-${day}`);
    let results = await CustomDocumentModel.find({
        name: name,
        telephone: telephone,
        identity: identity,
        document_title: document_title,
        document_content: document_content,
        document_lieu: document_lieu,
    })
    if (results.length > 0) {
        return res.status(400).json({
            status: false,
            message: 'A Document with exactly same details has already been generated. Please check Download Center for document with Name - ' + name, 
        })
    } else {
        const newDocument = new CustomDocumentModel({
            name: name,
            telephone: telephone,
            identity: identity,
            document_title: document_title,
            document_content: document_content,
            document_lieu: document_lieu,
            generated_on: datetoday,
        })

        newDocument
        .save()
        .then(saveSuccess => {
            return res.status(200).json({
                status: true,
                message: 'New Document Created Successfully!',
                documentId: saveSuccess._id,
            })
        }).catch(err => {
            console.log(err);
            return res.status(400).json({
                status: false,
                message: 'Custom Document Create Failed! Please Try Again.'
            })
        })
    }
}

exports.getCustomDocumentForSignatures = async (req, res, next) => {
    let { docId } = req.query;
    let result = await CustomDocumentModel.findById(docId).lean();
    if (result) {
        
        const docData = {
            id: result._id,
            name: result.name,
            telephone: result.telephone,
            identity: result.identity,
            generated_on: moment(result.generated_on).format("DD-MM-YYYY"),
            document_lieu: result.document_lieu,
            document_title: result.document_title,
            document_content: result.document_content,
            signature: null,
        }
        await customDocumentPromise(docData)
        .then(response => {
            return res.status(200).json({
                status: true,
                filepath: response.filename.split("\\")[response.filename.split("\\").length - 1],
                message: 'Document Generated!'
            })    
        }).catch(err => {
            console.log(err);
            return res.status(400).json({
                status: false,
                message: 'Document Generate Failed! Please Try Again on the Same URL.'
            })
        })
    } else {
        return res.status(400).json({
            status: false,
            message: 'Document Generate Failed! Please Try Again on the Same URL.'
        })
    }
}

exports.addDocumentSignatures = async (req, res, next) => {
    let {
        docId,
        signature
    } = req.body;

    await CustomDocumentModel.findByIdAndUpdate(docId, {
        signature: signature,
        signed_on: new Date(),
    }, { new: true})
    .then(async (success) => {
        const docData = {
            id: success._id,
            name: success.name,
            telephone: success.telephone,
            identity: success.identity,
            generated_on: moment(success.generated_on).format("DD-MM-YYYY"),
            document_lieu: success.document_lieu,
            document_title: success.document_title,
            document_content: success.document_content,
            signature: success.signature
        }

        await customDocumentPromise(docData)
        .then(async (docGenSuccess) => {
            
            let locaFilePath = docGenSuccess.filename.split("\\")[docGenSuccess.filename.split("\\").length - 1];
            locaFilePath = locaFilePath.split("/")[locaFilePath.split("/").length - 1];
            let result = await uploadToCloudinary(locaFilePath);
            if(result.message === 'Success') {
                await CustomDocumentModel.findByIdAndUpdate(docId, {
                    $set: {
                        signed_document_url: result.url,
                        public_id: result.public_id
                    }
                })
                const mailData = {
                    from: 'intermanncrm@gmail.com',  // sender address
                    to: mailList,   // list of receivers
                    subject: `${success.name} signed the Document - ${success.document_title}.`,
                    text: 'That was easy!',
                    html: `Hello, <br/> <b>${success.name}</b> signed the Document - <b>${success.document_title}</b> with <b>Intermann</b> in the CRM. <br/>Please check the Signed Copy in Download Center on CRM.`,
                    attachments: [{
                        filename: success.name + ".pdf",
                        path: result.url,
                    }]
                };
                transporter.sendMail(mailData, (err, info) => {
                    if (err) {
                        console.log(err);
                    } else {
                        return res.status(200).json({
                            status: true,
                            message: "Signature Added Successfully To The Document!"
                        })
                    }
                })
            } else {
                return res.status(400).json({
                    status: false,
                    message: "Document Generate Failed! Please Try Again."
                })
            }
        })
        .catch(err => {
            console.log(err)
            return res.status(400).json({
                status: false,
                message: "Document Generate Failed! Please Try Again."
            })
        })
    })
    .catch(err => {
        console.log(err)
        return res.status(400).json({
            status: false,
            message: "Document Generate Failed! Please Try Again."
        })
    })
}

exports.getAllSignedDocuments = async (req, res, next) => {
    let results = await CustomDocumentModel.find({ signature: {$exists: true, $ne: ""} }).sort({ generated_on: "desc" }).exec();
    if(results.length > 0) {
        return res.status(200).json({
            status: true,
            data: results,
        })
    } else {
        return res.status(400).json({
            status: false,
            data: results,
        })
    }
}

exports.deleteCustomDocument = async (req, res, next) => {
    const { docId } = req.query;
    
        await CustomDocumentModel.findByIdAndRemove(docId).then(removed => {
            cloudinary.uploader.destroy(removed.public_id, (error, result) => {
                if (error) {
                  console.error('Error deleting resource:', error);
                } else {
                  console.log('Resource deleted:', result);
                  return res.status(200).json({
                    status: true,
                    message: "Custom Document Deleted Successfully!"
                })
                }
              });
        }).catch(err => {
            //console.log(err);
            return res.status(400).json({
                status: false,
                message: "Document Not Deleted! Please Try Again."
            })    
    }).catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: "Document Not Deleted! Please Try Again."
        })
    })
}
