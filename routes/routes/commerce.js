const router = require('express').Router();
const { auth } = require('../../middleware/auth');
const CommerceController = require("../../controllers/commerce");
const multer = require('multer');
var path = require('path');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        ////console.log('file-', file)
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
    }
});

var upload = multer({ storage: storage });

router.post("/addCommercialLead", auth, CommerceController.addCommercialLead);
router.post("/changeCompanyNote", auth, CommerceController.changeCompanyNotes);
router.post("/changeAgencyNote", auth, CommerceController.changeAgencyNotes);
router.post("/changeCompanyName", auth, CommerceController.changeCompanyName);
router.post("/changeEmail" , auth, CommerceController.changeEmail);
router.post("/changePhoneNumber1", auth, CommerceController.changePhoneNumber1);
router.post("/changePhoneNumber2", auth, CommerceController.changePhoneNumber2);
router.post("/changeClientStatus", auth, CommerceController.changeClientStatus);

router.get("/getAllCommercialLeads", CommerceController.getAllLeads);
router.get("/changeOfferStatus" , auth, CommerceController.changeOfferStatus);
router.get("/changeRappelerStatus", auth, CommerceController.changeRappelerStatus);
router.get("/changeInterestedStatus", auth, CommerceController.changeInterestedStatus);
router.get("/deleteCommercialLead", auth, CommerceController.deleteCommercialLead);

router.post("/changeContactedFirstTimeBy", auth, CommerceController.changeContactedFirstTimeBy);
router.post("/changeContactedSecondTimeBy", auth, CommerceController.changeContactedSecondTimeBy);
router.post("/changeContactedAfterOfferSentBy", auth, CommerceController.changeContactedAfterOfferSentBy);
router.post("/changeCompanyResponsable", auth, CommerceController.changeCompanyResponsable);

router.post("/filterCommercialLeads" , CommerceController.filterCommercialLeads);

router.get("/turnAllRappeler" , CommerceController.turnAllRappeler);

router.post('/uploadCoface', auth, upload.single('document'), CommerceController.uploadCoface);

router.post('/deleteCoface', auth, CommerceController.deleteCoface);

router.post("/updateLeadStatus", CommerceController.updateLeadStatus);

module.exports = {
    router: router,
    basePath: '/'
};