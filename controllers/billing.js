const Facture = require("../models/facture");

exports.saveFacture = async (req, res, next) => {
    let {
        factureCurrency,
        factureNumber,
        factureCreateDate,
        factureDueDate,
        factureTo,
        factureVAT,
        details,
    } = req.body;

    let totalAmountPromise = new Promise(async (resolve, reject) => {
        let totalAmount = 0;
        for (let i = 0; i < details.length; i++) {
            totalAmount = totalAmount + details[i].montant;
            if (i == details.length - 1) {
                resolve(totalAmount)
            }
        }
    })
    let totalAmount = await totalAmountPromise
    let invoice = new Facture({
            factureCurrency: factureCurrency,
            factureNumber: factureNumber,
            factureCreateDate: factureCreateDate,
            factureDueDate: factureDueDate,
            factureTo: factureTo,
            factureVAT: factureVAT,
            details: details,
            total_h_t_tva: totalAmount,
        })
        invoice.save().then(success => {
            return res.status(200).json({
                status: true,
                message: 'Invoice Saved Successfully!'
            })
        }).catch(err => {
            //console.log(err);
            return res.status(400).json({
                status: false,
                message: 'Invoice Save Failed! Please Try Again.'
            })
        })
}

exports.getAllFactures = async (req, res, next) => {
    let results = await Facture.find({}).sort({ createdAt: -1 }).exec()
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            total: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            total: results.length,
            data: results
        })
    }
}

exports.deleteInvoices = async (req, res, next) => {
    let { toDeleteArray } = req.body;
    await Facture.deleteMany({
        _id: { $in: toDeleteArray }
    }).then(success => {
        return res.status(200).json({
            status: true,
            message: toDeleteArray.length + " Factures Deleted!"
        })
    }).catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false, 
            message: 'Failed To Delete Entries! Please Try Again.'
        })
    })
}