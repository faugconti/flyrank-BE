require('dotenv').config();
const { createApp } = require('./src/app');

(async () => {
    const app = await createApp();
    const port = process.env.PORT || 3000;

    app.listen(port, () => {
        console.log(`CRUD API listening on port ${port}`);
    });
})();
