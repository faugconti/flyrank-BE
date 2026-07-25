const express = require('express');
const swaggerUI = require('swagger-ui-express');
const openAPI = require('../openapi.json');
const { initDb } = require('./db');

const taskRoutes = require('./routes/tasks.routes');
const metaRoutes = require('./routes/meta.routes');
const authRoutes = require('./routes/auth.routes');
const publicRoutes = require('./routes/public.routes');
const protectedRoutes = require('./routes/protected.routes');
const { errorHandler } = require('./middleware/error-handler');

const createApp = async () => {
    await initDb();

    const app = express();
    app.use(express.json());
    
    app.use('/', metaRoutes);
    app.use('/auth', authRoutes);
    app.use('/public', publicRoutes);
    app.use('/protected', protectedRoutes);
    app.use('/tasks', taskRoutes);
    app.use('/docs', swaggerUI.serve, swaggerUI.setup(openAPI));
    app.use(errorHandler);

    return app;
}

module.exports = { createApp }
