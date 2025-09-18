const express = require('express');
const router = express.Router();
const subcategoryController = require('../controllers/subcategoryController');
const auth = require('../middlewares/auth');

router.get('/category/:category_id', auth(), subcategoryController.getAllByCategory);
router.post('/', auth(['jefa_comercial']), subcategoryController.create);
router.put('/:id', auth(['jefa_comercial']), subcategoryController.update);
router.delete('/:id', auth(['jefa_comercial']), subcategoryController.delete);

module.exports = router;
