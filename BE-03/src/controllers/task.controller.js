const service = require('../services/task.services');

exports.getTasks = async (req, res) => {
    const tasks = await service.listTasks({ done: req.query.done, search: req.query.search });
    res.json(tasks);
};

exports.getTaskById = async (req, res) => {
    res.json(await service.getTask(Number(req.params.id)));
}

exports.createTask = async (req, res) => {
    const task = await service.createTask(req.body ?? {});
    res.status(201).json(task);
}

exports.updateTask = async (req, res) => {
    res.json(await service.updateTask(Number(req.params.id), req.body ?? {}));
}

exports.deleteTask = async (req, res) => {
    await service.deleteTask(Number(req.params.id));
    res.status(204).send();
}

exports.resetTasks = async (req, res) => {
    res.json(await service.resetTasks());
}

exports.getStats = async (req, res) => {
    res.json(await service.getStats());
}
