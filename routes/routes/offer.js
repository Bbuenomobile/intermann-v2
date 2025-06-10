const router = require('express').Router();
const { auth } = require('../../middleware/auth');
const { extendTimeout } = require("../../middleware/extendTimeout");
const OfferController = require("../../controllers/offer");
const multer = require('multer')
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

router.post("/generate-offer", auth, OfferController.generateOffer);
router.get("/get-offers", auth, OfferController.getOffers);

router.get('/get-offer', extendTimeout, OfferController.getOffer);

router.get('/delete-offer', auth, OfferController.deleteOffer);
router.get('/delete-manual-offer', auth, OfferController.deleteManualOfferDocument);

router.get('/get-associated-offers', auth, OfferController.getAssociatedOffers);
router.post('/add-to-crm', auth, OfferController.addToCRM);
router.post("/link-offer", OfferController.linkOffer);

router.post('/sign-offer',  OfferController.addSignatures);
router.post('/upload-offer',auth, upload.single('offerdocument') , OfferController.uploadOffer);

router.post("/mark-offer-as-signed", auth, OfferController.markAsSigned);

router.post('/filter-offers', auth, OfferController.filterOffers);

router.get('/update-offers-date', auth, OfferController.updateDate);


module.exports = {
    router: router,
    basePath: '/'
};