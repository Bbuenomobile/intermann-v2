const router = require('express').Router();
const sectorsController = require("../../controllers/sectors-jobs");
const { auth } = require("../../middleware/auth");

router.get("/fetchAllSectors", auth, sectorsController.fetchAllSectors);
router.get("/fetchAllJobs", auth, sectorsController.fetchAllJobs);
router.get("/checkSectorExistence", auth, sectorsController.checkSectorExists);
router.get("/checkJobExistence", auth, sectorsController.checkJobExists);
router.post("/updateSector", auth, sectorsController.updateSector);
router.post("/updateJob", auth, sectorsController.updateJob);
router.post("/saveNewSector", auth, sectorsController.saveSector);
router.post("/fetchProfilesForAJob", auth, sectorsController.fetchProfilesForAJob);

module.exports = {
    router: router,
    basePath: '/'
};
