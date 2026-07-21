const SEED_TASKS = [
  { id: 1, title: 'Buy groceries', done: false },
  { id: 2, title: 'Walk the dog', done: true },
  { id: 3, title: 'Read a book', done: false },
];

let tasks = SEED_TASKS.map((task) => ({ ...task }));

function findAll() {
  return tasks.map((task) => ({ ...task }));
}

function findById(id) {
  const task = tasks.find((t) => t.id === id);
  return task ? { ...task } : null;
}

function create({ title, done }) {
  const id = tasks.length === 0 ? 1 : Math.max(...tasks.map((t) => t.id)) + 1;
  const task = { id, title, done };
  tasks.push(task);
  return { ...task };
}

function update(id, changes) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;
  Object.assign(task, changes);
  return { ...task };
}

function remove(id) {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}

function reset() {
  tasks = SEED_TASKS.map((task) => ({ ...task }));
  return findAll();
}

module.exports = { findAll, findById, create, update, remove, reset };