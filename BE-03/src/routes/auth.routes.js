const router = require('express').Router();
const controller = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/signup', controller.signup);
router.post('/login', controller.login);
router.post('/logout', requireAuth, controller.logout);

module.exports = router;
