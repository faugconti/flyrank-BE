import { Router } from "express";
import { create, getById } from "../controllers/reports.controller.js";

const router = Router();

router.post("/reports", create);
router.get("/reports/:id", getById);

export default router;