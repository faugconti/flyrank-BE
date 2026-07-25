const { UnauthorizedError } = require('../errors');

exports.requireAuth = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        throw new UnauthorizedError('Access token required');
    }

    const token = header.slice(7).trim();
    if (!token) {
        throw new UnauthorizedError('Access token required');
    }

    req.token = token;
    next();
};
