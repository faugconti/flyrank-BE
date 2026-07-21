const express = require('express');
const swaggerUI = require('swagger-ui-express');
const openAPI = require('../openapi.json');

const taskRoutes = require('./routes/tasks.routes');
const metaRoutes = require('./routes/meta.routes');
const { errorHandler } = require('./middleware/error-handler');

const createApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/', metaRoutes);
    app.use('/tasks', taskRoutes);
    app.use('/docs', swaggerUI.serve, swaggerUI.setup(openAPI));
    app.use(errorHandler);

    return app;
}

module.exports = { createApp }