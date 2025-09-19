const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const auth = require('../middlewares/auth');

// Listar leads
router.get('/', auth(), leadController.getAll);
// Ver lead por id
router.get('/:id', auth(), leadController.getById);
const { body, validationResult } = require('express-validator');
// Crear lead con validación: primero validadores, luego auth, luego controlador
router.post('/',
		[
				body('company_id').isInt().withMessage('company_id debe ser entero'),
				body('name').isString().isLength({ min: 2 }).withMessage('Nombre requerido'),
				body('email').optional().isEmail().withMessage('Email inválido'),
				body('phone').optional().isString(),
				body('status').optional().isString(),
				body('type').optional().isString(),
				body('assigned_to').optional().isInt()
		],
		// Pre-auth validation handler: return 400 with errors array if invalid
		(req, res, next) => {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			next();
		},
		auth(['vendedor_comercial','jefa_comercial','admin']),
		leadController.create
);
// Cambiar estado
router.put('/:id/status', auth(['vendedor_comercial','jefa_comercial','admin']), leadController.updateStatus);

module.exports = router;
