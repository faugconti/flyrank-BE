import express from "express";
import metaRoutes from "./routes/meta.routes.js";
import reportRoutes from "./routes/reports.routes.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use(metaRoutes);
app.use(reportRoutes);

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});