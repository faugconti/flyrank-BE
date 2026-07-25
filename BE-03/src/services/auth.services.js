const supabase = require('../supabase');
const { ValidationError, UnauthorizedError } = require('../errors');

exports.signup = async ({ email, password } = {}) => {
    if (!email || !password) {
        throw new ValidationError('Bad Request');
    }

    const client = supabase.getClient();
    const { data, error } = await client.auth.signUp({ email, password });

    if (error) {
        throw new ValidationError(error.message);
    }

    return data.user;
};

exports.login = async ({ email, password } = {}) => {
    if (!email || !password) {
        throw new ValidationError('Bad Request');
    }

    const client = supabase.getClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
        throw new UnauthorizedError('Invalid login credentials');
    }

    return {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
    };
};
