const service = require('../services/task.services');

exports.getTasks = (req, res, next) => {
    try {
        const tasks = service.listTasks({ done: req.query.done, search: req.query.search });
        res.json(tasks);
    } catch (err) {
        next(err);
    }
};

exports.getTaskById = (req, res, next) => {
    try {
        res.json(service.getTask(Number(req.params.id)));
    } catch (err) {
        next(err);
    }
}

exports.createTask = (req, res, next) => {
    try {
        const task = service.createTask(req.body ?? {});
        res.status(201).json(task);
    } catch (err) {
        next(err);
    }
}


exports.updateTask = (req, res, next) => {
    try {
        res.json(service.updateTask(Number(req.params.id), req.body ?? {}));
    } catch (err) {
        next(err);
    }
}

exports.deleteTask = (req, res, next) => {
    try {
        service.deleteTask(Number(req.params.id));
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

exports.resetTasks = (req, res, next) => {
    try {
        res.json(service.resetTasks());
    } catch (err) {
        next(err);
    }
}

exports.getStats = (req, res, next) => {
    try {
        res.json(service.getStats());
    } catch (err) {
        next(err);
    }
}