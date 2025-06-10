const router = require('express').Router();
const { auth } = require('../../middleware/auth');
const BillingController = require("../../controllers/billing");

router.post("/saveInvoice" , auth, BillingController.saveFacture);

router.get("/getAllInvoices", auth, BillingController.getAllFactures);

router.post("/deleteInvoices" , auth, BillingController.deleteInvoices);

module.exports = {
    router: router,
    basePath: '/'
};