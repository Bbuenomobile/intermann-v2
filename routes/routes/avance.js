const router = require('express').Router();
const { auth } = require('../../middleware/auth');
const avanceController = require("../../controllers/avance");

router.get("/getAvance", avanceController.getAvance);
router.get("/getSignedAvances", auth, avanceController.getSignedAvances);
router.get("/getSignedAvance", avanceController.getSignedAvance);
router.get("/getCandidatAvance", auth, avanceController.getAvanceForCandidat);
router.get("/deleteAvance", auth, avanceController.deleteAvance);

router.post("/generateAvance", auth, avanceController.makeAvance);
router.post("/saveAvance", auth, avanceController.saveAvance);
router.post("/addAvanceSignatures", avanceController.addSignatures);

module.exports = {
    router: router,
    basePath: '/'
};