const router = require('express').Router();
const userController = require('../../controllers/user');
const { auth } = require('../../middleware/auth');

router.get('/allusers', auth, userController.getUsers);
router.post("/updateUser", auth, userController.updateUser);
router.post("/deleteuser", auth, userController.deleteUser);
router.get("/getUserStats",auth, userController.getUserStats);
router.get("/getStatsForAllUsers", userController.getStatsForAllUsers);

module.exports = {
    router: router,
    basePath: '/'
};