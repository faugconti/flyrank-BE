const service = require('../services/auth.services');

exports.signup = async (req, res) => {
    const user = await service.signup(req.body ?? {});
    res.status(201).json(user);
};

exports.login = async (req, res) => {
    const tokens = await service.login(req.body ?? {});
    res.json(tokens);
};

exports.logout = async (req, res) => {
    await service.logout();
    res.status(204).send();
};
