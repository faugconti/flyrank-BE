import express from "express";
import healthRoutes from "./routes/health.routes.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use(healthRoutes);

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});