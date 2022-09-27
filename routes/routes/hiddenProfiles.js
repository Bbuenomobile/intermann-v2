const router = require("express").Router();
const hiddenProfilesController = require("../../controllers/hiddenProfiles");
const { auth } = require("../../middleware/auth");
var path = require('path');

router.post("/hideCandidat", auth, hiddenProfilesController.hideCandidatProfile);

module.exports = {
    router: router,
    basePath: '/'
};