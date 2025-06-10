const router = require('express').Router();
const AdController = require("../../controllers/ad");
const { auth } = require('../../middleware/auth');


router.get('/allAds', auth, AdController.getAllAds);
router.get("/modifyAdStatus", auth, AdController.changeAdStatus);
router.get("/deleteAd", auth, AdController.deleteAd);
router.get("/getClientAds", auth, AdController.getClientAds);

router.post("/addAd", AdController.addAd);
router.post("/editAd", auth, AdController.editAd);

module.exports = {
    router: router,
    basePath: '/'
};