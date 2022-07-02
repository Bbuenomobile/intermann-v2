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
        console.log('file-', file)
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
    }
});

var upload = multer({ storage: storage });

// Setters
router.post("/addCandidat", auth, candidatController.addCandidat);

router.get("/checkCandidatName", auth, candidatController.candidatNameCheck);
router.get("/getCandidats", auth, candidatController.getCandidat);
router.get("/getCandidatById", auth, candidatController.getCandidatById);
router.get("/renameDocument", auth, candidatController.renameCandidatDocument);
router.get("/deleteDocument", auth, candidatController.deleteCandidatDocument);
// Uploaders
router.post("/uploadCandidatDocuments", auth, upload.single("document"), candidatController.uploadCandidatDocuments);

// Getters
router.get("/getCounts", auth, candidatController.getCounts);
router.get("/viewCandidat", auth, candidatController.viewCandidat);
router.get("/allToDoCandidats", auth, candidatController.viewAllToDoCadidats);
router.get("/allInProgressCandidats", auth, candidatController.viewAllInProgressCadidats);
router.get("/allArchivedCandidats", auth, candidatController.viewAllArchivedCadidats);

// Status Setters
router.post("/moveToInProgress", auth, candidatController.moveToInProgress);
router.post("/moveToPreSelected", auth, candidatController.moveToPreSelected);
router.post("/moveToArchived", auth, candidatController.moveToArchived);

// Editors
router.post("/uploadCandidatImage", auth, upload.single("image"), candidatController.uploadCandidatImage);
router.post("/editToDoCandidat", auth, upload.single("image"), candidatController.editToDoCandidat);
router.post("/editInProgressCandidat", auth, upload.single("image"), candidatController.editInProgressCandidat);
router.post("/editArchivedCandidat", auth, upload.single("image"), candidatController.editArchivedCandidat);

// Filters
router.get("/filterToDoCandidatByLanguages", auth, candidatController.filterToDoCandidatByLanguages);
router.get("/filterToDoCandidatBySector", auth, candidatController.filterToDoBySector);
router.get("/filterToDoSL", auth, candidatController.filterToDoSectorLanguage)
router.get("/filterToDoSJ", auth, candidatController.filterToDoSectorJob)
router.get("/filterToDoSJL", auth, candidatController.filterToDoSectorJobLanguage)

router.get("/filterInProgressCandidatByLanguages", auth, candidatController.filterInProgressCandidatByLanguages);
router.get("/filterInProgressCandidatBySector", auth, candidatController.filterInProgressBySector);
router.get("/filterInProgressSL", auth, candidatController.filterInProgressSectorLanguage)
router.get("/filterInProgressSJ", auth, candidatController.filterInProgressSectorJob)
router.get("/filterInProgressSJL", auth, candidatController.filterInProgressSectorJobLanguage)

router.get("/filterArchivedCandidatByLanguages", auth, candidatController.filterArchivedCandidatByLanguages);
router.get("/filterArchivedCandidatBySector", auth, candidatController.filterArchivedBySector);
router.get("/filterArchivedSL", auth, candidatController.filterArchivedSectorLanguage)
router.get("/filterArchivedSJ", auth, candidatController.filterArchivedSectorJob)
router.get("/filterArchivedSJL", auth, candidatController.filterArchivedSectorJobLanguage)

module.exports = {
    router: router,
    basePath: '/'
};
