const express = require('express');
const router = express.Router();
const projectHistoryController = require('../controllers/projectHistoryController');
const auth = require('../middlewares/auth');

router.get('/project/:project_id', auth(), projectHistoryController.getByProject);
router.post('/', auth(), projectHistoryController.add);

module.exports = router;
