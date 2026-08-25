const repository = require('../src/repository/task.repository');
const { listTasks, getTask, createTask, updateTask, deleteTask, getStats, resetTasks } = require('../src/services/task.services');
const { NotFoundError, ValidationError } = require('../src/errors');

beforeEach(() => {
    vi.restoreAllMocks();
});

describe('listTasks', () => {
    it('Returns all tasks when no filters', async () => {
        const tasks = [{ id: 1, title: 'Test' }];
        vi.spyOn(repository, 'findAll').mockResolvedValue(tasks);

        const result = await listTasks();

        expect(repository.findAll).toHaveBeenCalledWith({});
        expect(result).toEqual(tasks);
    });

    it('Passes done: true filter to repo', async () => {
        vi.spyOn(repository, 'findAll').mockResolvedValue([]);

        await listTasks({ done: 'true' });

        expect(repository.findAll).toHaveBeenCalledWith({ done: true });
    });

    it('Passes done: false filter to repo', async () => {
        vi.spyOn(repository, 'findAll').mockResolvedValue([]);

        await listTasks({ done: 'false' });

        expect(repository.findAll).toHaveBeenCalledWith({ done: false });
    });

    it('Passes search filter to repo', async () => {
        vi.spyOn(repository, 'findAll').mockResolvedValue([]);

        await listTasks({ search: 'test' });

        expect(repository.findAll).toHaveBeenCalledWith({ search: 'test' });
    });

    it('Throws ValidationError for invalid done values', async () => {
        await expect(listTasks({ done: 'yes' })).rejects.toThrow(ValidationError);
    });

    it('Throws ValidationError when search is empty/whitespace', async () => {
        await expect(listTasks({ search: '   ' })).rejects.toThrow(ValidationError);
    });

    it('Trims whitespace from search term', async () => {
        vi.spyOn(repository, 'findAll').mockResolvedValue([]);

        await listTasks({ search: '  test  ' });

        expect(repository.findAll).toHaveBeenCalledWith({ search: 'test' });
    });
});

describe('getTask', () => {
    it('Returns task when found', async () => {
        const task = { id: 1, title: 'Test' };
        vi.spyOn(repository, 'findById').mockResolvedValue(task);

        const result = await getTask(1);

        expect(repository.findById).toHaveBeenCalledWith(1);
        expect(result).toEqual(task);
    });

    it('Throws NotFoundError when repo returns null', async () => {
        vi.spyOn(repository, 'findById').mockResolvedValue(null);

        await expect(getTask(999)).rejects.toThrow(NotFoundError);
    });
});

describe('createTask', () => {
    it('Creates task with trimmed title, returns result', async () => {
        const created = { id: 1, title: 'Test', done: false };
        vi.spyOn(repository, 'create').mockResolvedValue(created);

        const result = await createTask({ title: '  Test  ' });

        expect(repository.create).toHaveBeenCalledWith({ title: 'Test', done: false });
        expect(result).toEqual(created);
    });

    it('Throws ValidationError when title is missing', async () => {
        await expect(createTask({})).rejects.toThrow(ValidationError);
    });

    it('Throws ValidationError when title is null', async () => {
        await expect(createTask({ title: null })).rejects.toThrow(ValidationError);
    });

    it('Throws ValidationError when title is empty/whitespace', async () => {
        await expect(createTask({ title: '   ' })).rejects.toThrow(ValidationError);
    });
});

describe('updateTask', () => {
    it('Updates with title only', async () => {
        const updated = { id: 1, title: 'New', done: false };
        vi.spyOn(repository, 'update').mockResolvedValue(updated);

        const result = await updateTask(1, { title: 'New' });

        expect(repository.update).toHaveBeenCalledWith(1, { title: 'New' });
        expect(result).toEqual(updated);
    });

    it('Updates with done only', async () => {
        const updated = { id: 1, title: 'Test', done: true };
        vi.spyOn(repository, 'update').mockResolvedValue(updated);

        const result = await updateTask(1, { done: true });

        expect(repository.update).toHaveBeenCalledWith(1, { done: true });
        expect(result).toEqual(updated);
    });

    it('Updates with both title and done', async () => {
        const updated = { id: 1, title: 'New', done: true };
        vi.spyOn(repository, 'update').mockResolvedValue(updated);

        const result = await updateTask(1, { title: 'New', done: true });

        expect(repository.update).toHaveBeenCalledWith(1, { title: 'New', done: true });
        expect(result).toEqual(updated);
    });

    it('Throws ValidationError when no fields provided', async () => {
        await expect(updateTask(1, {})).rejects.toThrow(ValidationError);
    });

    it('Throws ValidationError for empty title', async () => {
        await expect(updateTask(1, { title: '   ' })).rejects.toThrow(ValidationError);
    });

    it('Throws ValidationError when done is not boolean', async () => {
        await expect(updateTask(1, { done: 'yes' })).rejects.toThrow(ValidationError);
    });

    it('Throws NotFoundError when task does not exist', async () => {
        vi.spyOn(repository, 'update').mockResolvedValue(null);

        await expect(updateTask(999, { title: 'New' })).rejects.toThrow(NotFoundError);
    });
});

describe('deleteTask', () => {
    it('Deletes successfully', async () => {
        vi.spyOn(repository, 'remove').mockResolvedValue(true);

        await expect(deleteTask(1)).resolves.toBeUndefined();
        expect(repository.remove).toHaveBeenCalledWith(1);
    });

    it('Throws NotFoundError when task does not exist', async () => {
        vi.spyOn(repository, 'remove').mockResolvedValue(null);

        await expect(deleteTask(999)).rejects.toThrow(NotFoundError);
    });
});

describe('getStats', () => {
    it('Returns total, done, open computed correctly', async () => {
        vi.spyOn(repository, 'getStats').mockResolvedValue({ total: 5, done: 2 });

        const result = await getStats();

        expect(result).toEqual({ total: 5, done: 2, open: 3 });
    });
});

describe('resetTasks', () => {
    it('Delegates to repository.reset() and returns result', async () => {
        vi.spyOn(repository, 'reset').mockResolvedValue({ reset: true });

        const result = await resetTasks();

        expect(repository.reset).toHaveBeenCalled();
        expect(result).toEqual({ reset: true });
    });
});
