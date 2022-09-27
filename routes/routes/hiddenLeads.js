const router = require("express").Router();
const hiddenLeadsController = require("../../controllers/hiddenLeads");
const { auth } = require("../../middleware/auth");
var path = require('path');

router.post("/hideClient", auth, hiddenLeadsController.hideClientProfile)

module.exports = {
    router: router,
    basePath: '/'
};