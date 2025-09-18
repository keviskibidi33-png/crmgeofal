const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middlewares/auth');

router.get('/', auth(), categoryController.getAll);
router.post('/', auth(['jefa_comercial']), categoryController.create);
router.put('/:id', auth(['jefa_comercial']), categoryController.update);
router.delete('/:id', auth(['jefa_comercial']), categoryController.delete);

module.exports = router;
