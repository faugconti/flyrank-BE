const repository = require('../repository/task.repository');
const { NotFoundError, ValidationError } = require('../errors');

exports.listTasks = ({ done, search } = {}) => {
    let result = repository.findAll();

    if (done !== undefined) {
        if (done !== 'true' && done !== 'false') {
            throw new ValidationError;
        }
        const wantDone = done === 'true';
        result = result.filter((t) => t.done === wantDone);
    }

    // Extra: search titles
    if (search !== undefined) {
        const word = String(search).trim();
        if (word === '') {
            throw new ValidationError('search must not be empty');
        }
        const lower = word.toLowerCase();
        result = result.filter((t) => t.title.toLowerCase().includes(lower));
    }

    return result;
};

exports.getTask = (id) => {
    const task = repository.findById(id);
    if (!task) {
        throw new NotFoundError(`Task ${id} not found`);
    }
    return task;
}

exports.createTask = (body = {}) => {
    const { title } = body;
    if (title === undefined || title === null || String(title).trim() === '') {
        throw new ValidationError('title is required and cannot be empty');
    }
    return repository.create({ title: String(title).trim(), done: false });
}

exports.updateTask = (id, body = {}) => {
    const hasTitle = Object.prototype.hasOwnProperty.call(body, 'title');
    const hasDone = Object.prototype.hasOwnProperty.call(body, 'done');

    if (!hasTitle && !hasDone) {
        throw new ValidationError('request body must include title and/or done');
    }

    const changes = {};

    if (hasTitle) {
        if (body.title === null || String(body.title).trim() === '') {
            throw new ValidationError('title cannot be empty');
        }
        changes.title = String(body.title).trim();
    }

    if (hasDone) {
        if (typeof body.done !== 'boolean') {
            throw new ValidationError('done must be a boolean');
        }
        changes.done = body.done;
    }

    const updated = repository.update(id, changes);
    if (!updated) {
        throw new NotFoundError(`Task ${id} not found`);
    }
    return updated;
}

exports.deleteTask = (id) => {
    const removed = repository.remove(id);
    if (!removed) {
        throw new NotFoundError(`Task ${id} not found`);
    }
}

exports.getStats = () => {
    const all = repository.findAll();
    const done = all.filter((t) => t.done).length;
    return { total: all.length, done, open: all.length - done };
}

exports.resetTasks = () => {
    return repository.reset();
}
