const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const auth = require('../middlewares/auth');

router.get('/', auth(), serviceController.getAll);

module.exports = router;
