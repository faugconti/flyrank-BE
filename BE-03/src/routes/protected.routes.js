const router = require('express').Router();
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.get('/profile', (req, res) => {
    res.json({ message: 'Protected profile data', token: req.token });
});

module.exports = router;
