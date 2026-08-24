const service = require('../services/enrich.services');

exports.enrichProduct = async (req, res, next) => {
    try {
        res.json(await service.enrichProduct(req.body ?? {}));
    } catch (err) {
        next(err);
    }
};
