const router = require("express").Router();
const { auth } = require("../../middleware/auth");
const CandidatContractController = require("../../controllers/contractCandidat");
const ClientContractController = require("../../controllers/contractClient");

router.post("/makeContract", auth, CandidatContractController.makeContract);
router.post("/addContractToCRM", auth, CandidatContractController.addContractToCRM);
router.post("/makeClientContract", auth, ClientContractController.makeClientContract);
router.post("/addClientContractToCRM", auth, ClientContractController.addClientContractToCRM);
router.post("/addClientSignatures", auth, ClientContractController.addSignatures);
router.post("/addCandidatSignatures", CandidatContractController.addSignatures);
router.get("/getContract", CandidatContractController.getContract);
router.get("/getClientContract", ClientContractController.getContract);
router.get("/getCandidatSignedContracts", CandidatContractController.getSignedContracts);
router.get("/getClientSignedContracts", auth, ClientContractController.getSignedContracts);
router.get("/deleteCandidatContract", auth, CandidatContractController.deleteContract);
router.get("/deleteClientContract", auth, ClientContractController.deleteContract);

router.get('/getSignedCandidatContract' , CandidatContractController.getSignedContract);
router.get("/getSignedClientContract", ClientContractController.getSignedContract);

router.get("/migrateClientContracts", ClientContractController.migrateClientContracts);

module.exports = {
    router: router,
    basePath: '/'
};

