const router = require("express").Router();
const { auth } = require("../../middleware/auth");
const CandidatContractController = require("../../controllers/contractCandidat");
const ClientContractController = require("../../controllers/contractClient");

router.post("/makeContract", auth, CandidatContractController.makeContract);
router.post("/addContractToCRM", auth, CandidatContractController.addContractToCRM);
router.post("/makeClientContract", auth, ClientContractController.makeClientContract);
router.post("/addClientContractToCRM", auth, ClientContractController.addClientContractToCRM);

module.exports = {
    router: router,
    basePath: '/'
};

