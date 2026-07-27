const router = require('express').Router();
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.get('/profile', (req, res) => {
    const { id, email, created_at } = req.user;
    res.json({ id, email, created_at });
});

module.exports = router;
