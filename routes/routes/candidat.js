const router = require("express").Router();
const candidatController = require("../../controllers/candidat");
const { auth } = require("../../middleware/auth");
var path = require('path');

const multer = require('multer')

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

// Setters
router.post("/addCandidat", auth, candidatController.addCandidat);
router.post("/changeEmployeeSalary", auth, candidatController.changeEmployeeSalary);

// Uploaders
router.post("/uploadCandidatDocuments", auth, upload.single("document"), candidatController.uploadCandidatDocuments);
router.post("/addCandidatLink", auth, candidatController.addCandidatLink);
router.post("/removeCandidatLink", auth, candidatController.removeCandidatLink);
router.post("/renameCandidatLink", auth, candidatController.renameCandidatLink);
// Getters
router.get("/getAllCandidatLinks", candidatController.allCandidatLinks);
router.get("/checkCandidatExists", candidatController.checkCandidatExists);
router.get("/getProfiles", auth, candidatController.getProfiles);
router.get("/checkCandidatName", auth, candidatController.candidatNameCheck);
router.get("/getCandidats", candidatController.getCandidats);
router.get("/getCandidatById", auth, candidatController.getCandidatById);
router.get("/getCandidatDetailsById", candidatController.getCandidatDetailsById);
router.get("/renameDocument", auth, candidatController.renameCandidatDocument);
router.get("/deleteDocument", auth, candidatController.deleteCandidatDocument);
router.get("/getClientsForFilter", auth, candidatController.getClientsForFilter);
router.get("/getCandidatsByClient", auth, candidatController.getCandidatsByClient);
router.get("/getCounts", auth, candidatController.getCounts);
router.get("/getCandidatsByPhoneNumber", auth, candidatController.getCandidatsByPhoneNumber);
router.get("/viewCandidat", auth, candidatController.viewCandidat);
router.get("/allToDoCandidats", auth, candidatController.viewAllToDoCandidats);
router.get("/toDoCandidats", auth, candidatController.viewToDoCandidats);
router.get("/allPreSelectedCandidats", auth, candidatController.viewAllPreSelectedCandidats);
router.get("/preSelectedCandidats", auth, candidatController.viewPreSelectedCandidats);
router.get("/allInProgressCandidats", auth, candidatController.viewAllInProgressCandidats);
router.get("/inProgressCandidats", auth, candidatController.viewInProgressCandidats);
router.get("/allArchivedCandidats", auth, candidatController.viewAllArchivedCandidats);
router.get("/archivedCandidats", auth, candidatController.viewArchivedCandidats);
router.get("/candidatRecommendations", auth, candidatController.fetchCandidatRecommendations);

// Status Setters
router.post("/changeStatus", auth, candidatController.changeStatus);
router.post("/moveToInProgress", auth, candidatController.moveToInProgress);
router.post("/moveToPreSelected", auth, candidatController.moveToPreSelected);
router.post("/moveToArchived", auth, candidatController.moveToArchived);
router.post("/moveToToDo", auth, candidatController.moveToToDo);

// Editors
router.post("/editCandidat", auth, candidatController.editCandidat);
router.post("/uploadCandidatImage", auth, upload.single("image"), candidatController.uploadCandidatImage);
router.post("/editToDoCandidat", auth, upload.single("image"), candidatController.editToDoCandidat);
router.post("/editPreSelectedCandidat", auth, upload.single("image"), candidatController.editPreSelectedCandidat);
router.post("/editInProgressCandidat", auth, upload.single("image"), candidatController.editInProgressCandidat);
router.post("/editArchivedCandidat", auth, upload.single("image"), candidatController.editArchivedCandidat);

// Filters
router.get("/filterPreSelectedCandidatByLanguages", auth, candidatController.filterPreSelectedCandidatByLanguages);

router.get("/filterToDoCandidatByLanguages", auth, candidatController.filterToDoCandidatByLanguages);
router.get("/filterToDoCandidatBySector", auth, candidatController.filterToDoBySector);
router.get("/filterToDoSL", auth, candidatController.filterToDoSectorLanguage)
router.get("/filterToDoSJ", auth, candidatController.filterToDoSectorJob)
router.get("/filterToDoSJL", auth, candidatController.filterToDoSectorJobLanguage)
router.get("/filterToDoSJM", auth, candidatController.filterToDoSectorJobMotivation)
router.get("/filterToDoSJLicence", auth, candidatController.filterToDoSectorJobLicence)


router.get("/filterInProgressCandidatByLanguages", auth, candidatController.filterInProgressCandidatByLanguages);
router.get("/filterInProgressCandidatBySector", auth, candidatController.filterInProgressBySector);
router.get("/filterInProgressSL", auth, candidatController.filterInProgressSectorLanguage);
router.get("/filterInProgressSJ", auth, candidatController.filterInProgressSectorJob);
router.get("/filterInProgressSJL", auth, candidatController.filterInProgressSectorJobLanguage);
router.get("/filterInProgressSJM", auth, candidatController.filterInProgressSectorJobMotivation);
router.get("/filterInProgressSJLicence", auth, candidatController.filterInProgressSectorJobLicence);

router.get("/filterArchivedCandidatByLanguages", auth, candidatController.filterArchivedCandidatByLanguages);
router.get("/filterArchivedCandidatBySector", auth, candidatController.filterArchivedBySector);
router.get("/filterArchivedSL", auth, candidatController.filterArchivedSectorLanguage);
router.get("/filterArchivedSJ", auth, candidatController.filterArchivedSectorJob);
router.get("/filterArchivedSJL", auth, candidatController.filterArchivedSectorJobLanguage);
router.get("/filterArchivedSJM", auth, candidatController.filterArchivedSectorJobMotivation);
router.get("/filterArchivedSJLicence", auth, candidatController.filterArchivedSectorJobLicence);

router.get("/filterPreSelectedSJM", auth, candidatController.filterPreSelectedSectorJobMotivation);
router.get("/filterPreSelectedSJLicence", auth, candidatController.filterPreSelectedSectorJobLicence);
router.get("/filterPreSelectedSJL", auth, candidatController.filterPreSelectedSectorJobLanguage);

// RIS Routes
router.get('/getRISCandidates', auth, candidatController.getRISCandidates);
router.post('/transferToRIS', auth, candidatController.transferCandidateToRIS);
router.post('/removeFromRIS', auth, candidatController.deleteRISCandidate);

module.exports = {
    router: router,
    basePath: '/'
};
