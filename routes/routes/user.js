const router = require('express').Router();
const userController = require('../../controllers/user');
const { auth } = require('../../middleware/auth');

router.get('/allusers', auth, userController.getUsers);
router.post("/deleteuser", auth, userController.deleteUser);

module.exports = {
    router: router,
    basePath: '/'
};