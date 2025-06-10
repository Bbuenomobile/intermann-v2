const router = require('express').Router();
const { auth } = require('../../middleware/auth');
const customDocumentController = require("../../controllers/customDocument");

router.post("/addDocumentDetails" , auth ,customDocumentController.addCustomDocumentDetails);
router.post("/addDocumentSignatures", customDocumentController.addDocumentSignatures);

router.get("/getDocumentForSignatures", customDocumentController.getCustomDocumentForSignatures);
router.get("/getAllSignedCustomDocuments", customDocumentController.getAllSignedDocuments);
router.get("/deleteCustomDocument", customDocumentController.deleteCustomDocument);

module.exports = {
    router: router,
    basePath: '/'
};