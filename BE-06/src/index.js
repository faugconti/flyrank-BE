import express from "express";
import healthRoutes from "./routes/health.routes.js";
import inngestRoutes from "./routes/inngest.routes.js";
import reportsRoutes from "./routes/reports.routes.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use(healthRoutes);
app.use(inngestRoutes);
app.use(reportsRoutes);

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});