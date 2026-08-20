import { Router } from "express";
import { createReport, getReport, getReportFile } from "../controllers/reports.controller.js";

const router = Router();

router.post("/reports", createReport);
router.get("/reports/:id", getReport);
router.get("/reports/:id/file", getReportFile);

export default router;