const router = require('express').Router();
const { auth } = require('../../middleware/auth');
const representenceController = require("../../controllers/representence");

router.get("/getRepresentence", representenceController.getRepresentence);
router.get("/getSignedRepresentences", auth, representenceController.getSignedRepresentences);
router.get("/getSignedRepresentence",  representenceController.getSignedRepresentence);
router.get("/getCandidatRepresentence", auth, representenceController.getRepresentenceForCandidat);
router.get("/deleteRepresentence", auth, representenceController.deleteRepresentence);

router.post("/generateRepresentence", auth, representenceController.makeRepresentence);
router.post("/saveRepresentence", auth, representenceController.saveRepresentence);
router.post("/addRepresentenceSignatures", representenceController.addSignatures);

module.exports = {
    router: router,
    basePath: '/'
};