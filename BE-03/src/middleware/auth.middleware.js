const supabase = require('../supabase');
const { UnauthorizedError } = require('../errors');

exports.requireAuth = async (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        throw new UnauthorizedError('Access token required');
    }

    const token = header.slice(7).trim();
    if (!token) {
        throw new UnauthorizedError('Access token required');
    }

    const client = supabase.getClient();
    const { data, error } = await client.auth.getUser(token);

    if (error || !data.user) {
        throw new UnauthorizedError('Invalid or expired token');
    }

    req.token = token;
    req.user = data.user;
    next();
};
