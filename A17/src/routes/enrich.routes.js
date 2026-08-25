const router = require('express').Router();
const controller = require('../controllers/enrich.controller');

router.route('/').post(controller.enrichProduct);

module.exports = router;
