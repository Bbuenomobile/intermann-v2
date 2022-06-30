const router = require("express").Router();
const clientController = require("../../controllers/client");
const { auth } = require("../../middleware/auth");
const multer = require('multer')


var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        console.log('file-', file)
        cb(null, file.fieldname + '-' + Date.now() + ".jpg")
    }
});

var upload = multer({ storage: storage });

router.post("/addClient", auth, clientController.addClient);
router.post("/editToDoClient", auth, upload.single("image"), clientController.editToDoClient);
router.post("/editInProgressClient", auth, upload.single("image"), clientController.editInProgressClient);
router.post("/moveClientToInProgress", auth, clientController.moveClientInProgress);
router.post("/moveClientToArchived", auth, clientController.moveClientToArchived);
router.post("/moveClientToSigned", auth, clientController.moveClientToSigned);

router.get("/getClients", auth, clientController.getClients);
router.get("/getClientByName", auth, clientController.getClientByName);
router.get("/getClientByNameAndJob", auth, clientController.clientNameAndJobCheck);
router.get("/clientRecommendations", auth, clientController.fetchClientsRecommendations);


router.get("/allToDoClients", auth, clientController.viewAllToDoClients);
router.get("/allInProgressClients", auth, clientController.viewAllInProgressClients);
router.get("/allSignedClients", auth, clientController.viewAllSignedClients);
router.get("/allArchivedClients", auth, clientController.viewAllArchivedClients);


router.get("/getLeadsCount", auth, clientController.getClientsCounts);
router.get("/sendCounts", clientController.sendCountsToEmail);


router.get("/filterToDoClientByLanguages", auth, clientController.filterToDoClientByLanguages);
router.get("/filterToDoClientBySector", auth, clientController.filterToDoClientBySector);
router.get("/filterToDoClientSL", auth, clientController.filterToDoClientSectorLanguage)
router.get("/filterToDoClientSJ", auth, clientController.filterToDoClientSectorJob)
router.get("/filterToDoClientSJL", auth, clientController.filterToDoClientSectorJobLanguage)

// Filter Progress Routes
router.get("/filterInProgressClientByLanguages", auth, clientController.filterInProgressClientByLanguages);
router.get("/filterInProgressClientBySector", auth, clientController.filterInProgressClientBySector);
router.get("/filterInProgressClientSL", auth, clientController.filterInProgressClientSectorLanguage)
router.get("/filterInProgressClientSJ", auth, clientController.filterInProgressClientSectorJob)
router.get("/filterInProgressClientSJL", auth, clientController.filterInProgressClientSectorJobLanguage)

// Filter Signed Routes
router.get("/filterSignedClientByLanguages", auth, clientController.filterSignedClientByLanguages);
router.get("/filterSignedClientBySector", auth, clientController.filterSignedClientBySector);
router.get("/filterSignedClientSL", auth, clientController.filterSignedClientSectorLanguage)
router.get("/filterSignedClientSJ", auth, clientController.filterSignedClientSectorJob)
router.get("/filterSignedClientSJL", auth, clientController.filterSignedClientSectorJobLanguage)

// Filter Archived Routes
router.get("/filterArchivedClientByLanguages", auth, clientController.filterArchivedClientByLanguages);
router.get("/filterArchivedClientBySector", auth, clientController.filterArchivedClientBySector);
router.get("/filterArchivedClientSL", auth, clientController.filterArchivedClientSectorLanguage)
router.get("/filterArchivedClientSJ", auth, clientController.filterArchivedClientSectorJob)
router.get("/filterArchivedClientSJL", auth, clientController.filterArchivedClientSectorJobLanguage)



module.exports = {
    router: router,
    basePath: '/'
};
