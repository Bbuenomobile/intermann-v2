const Ad = require("../models/ad");
const nodemailer = require("nodemailer");

const mailList = [ "nikhilsunil90s@gmail.com" , " contact@textone.fr", "contact@intermann.ro", "office@fogart.ro", "oanasindieintermann@gmail.com", "daianaintermann@gmail.com", "daiana@intermann.ro"]

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


exports.getAllAds = async (req,res,next) => {
    const {market} = req.query;
    let results = await Ad.find({ adCountryMarket: market })
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
        })
    }
}

exports.addAd = async (req,res,next) => {
    let {
        adCountryMarket,
        adNameFrench,
        adNameRomanian,
        adImportance,
        adDescription,
        clients //array of client ids
    } = req.body;

    let result = await Ad.findOne({ adNameFrench: adNameFrench, adNameRomanian: adNameRomanian });
    if (result) {
        //console.log(result);
        return res.status(400).json({
            status: false,
            message: 'Job Ad Already Exists!'
        })
    } else {
        // there should be a check for adCountryMarket, 
        // if no adCountryMarket, then dont add the ad.
        const newAd = new Ad({
            adCountryMarket: adCountryMarket,
            adNameFrench: adNameFrench,
            adNameRomanian: adNameRomanian,
            adImportance: adImportance,
            adDescription: adDescription,
            adStatus: 'Active',
            clients: clients
        })

        newAd.save()
             .then(success => {
                //console.log(success);
                return res.status(200).json({
                    status: true,
                    message: "Ad Registered Successfully!"
                })
             })
             .catch(err => {
                //console.log(err);
                return res.status(400).json({
                    status: false,
                    message: "Job Ad Not Registered Successfully. Please Try Again!"
                })
             })
    }
}

exports.changeAdStatus = async (req, res, next) => {
    const { adId, currentStatus } = req.query;
    let adStatus = '';
    let sendMail = false;
    if (currentStatus == 'Active') {
        adStatus = 'Inactive'
        sendMail = true
    } else {
        adStatus = 'Active'
        sendMail = false;
    }
    await Ad.findByIdAndUpdate(adId, {
        $set: {
            adStatus: adStatus,
        }
    }).then(success => {
        if (sendMail) {
            const mailData = {
                from: 'intermanncrm@gmail.com',  // sender address
                to: mailList,   // list of receivers
                subject: `La Publicité Intermann ${success.adNameFrench} a été désactivé`,
                text: 'That was easy!',
                html: `Bonjour l’équipe de Intermann, ceci est une notification automatique pour avertir que la publicité ${success.adNameFrench} , ${success.adNameRomanian} a été <b> désactivé </b> <br> et donc les publicités doivent être <b> coupées </b> par Benjamin.<br>
                Pour voir les pubs actives ou inactives : <a href="https://intermann.herokuapp.com/JobAdsCenter">Veuillez cliquer ici!</a><br>
                Merci!
                `
            };
            transporter.sendMail(mailData, (err, info) => {
                if (err) {
                    ////console.log(err)
                } else {
                    ////console.log(info)
                }
            })
        }
        return res.status(200).json({
            status: true,
            message: 'Ad '+ success.adNameFrench + "/" + success.adNameRomanian +' Status Changed from ' + currentStatus + ' To ' + adStatus,
        })
    }).catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: 'Ad Status Change Failed! Please Try Again.'
        })
    })
}

exports.deleteAd = async (req, res, next) => {
    const { adId } = req.query;
    await Ad.findByIdAndRemove(adId).then(success => {
        return res.status(200).json({
            status: true,
            message: 'Ad '+ success.adNameFrench + "/" + success.adNameRomanian + ' Deleted Successfully!'
        })
    }).catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: 'Ad Delete Failed! Please Try Again.'
        })
    })
}

exports.editAd = async (req, res, next) => {
    let {
        adId,
        adCountryMarket,
        adNameFrench,
        adNameRomanian,
        adImportance,
        adDescription,
        clients //array of client ids
    } = req.body;

    await Ad.findByIdAndUpdate(adId, {
        $set: {
            adCountryMarket: adCountryMarket,
            adNameFrench: adNameFrench,
            adNameRomanian: adNameRomanian,
            adImportance: adImportance,
            adDescription: adDescription,
            clients: clients
        }
    }).then(success => {
        return res.status(200).json({
            status: true,
            message: 'Ad Updated Successfully!'
        })
    }).catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: 'Ad Edit Failed! Please Try Again.'
        })
    })
}

exports.getClientAds = async (req, res, next) => {
    const {clientId} = req.query;
    await Ad.find({ clients: {$in: [clientId]} }).then(success => {
        //console.log(success);
        return res.status(200).json({
            status: true,
            total: success.length,
            data: success
        })
    }).catch(err => {
        //console.log(err);
        return res.status(200).json({
            status: false,
            total: 0,
            data: []
        })
    })
}