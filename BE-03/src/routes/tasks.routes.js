const router = require('express').Router();
const controller = require('../controllers/task.controller');

router
    .route('/stats')
    .get(controller.getStats)

router
    .route('/reset')
    .post(controller.resetTasks)

router
    .route('/:id')
    .get(controller.getTaskById)
    .put(controller.updateTask)
    .delete(controller.deleteTask);

router
    .route('/')
    .get(controller.getTasks)
    .post(controller.createTask)


module.exports = router;