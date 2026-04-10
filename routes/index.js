var express = require('express');
const indexController = require('../controllers/indexControllers');
const uploadFile = require('../middlewares/uploadFile');
const router = express.Router();

router.get('/', indexController.home);

router.get('/register', indexController.showRegister);

router.post('/',uploadFile("users"),indexController.register);

module.exports = router;
