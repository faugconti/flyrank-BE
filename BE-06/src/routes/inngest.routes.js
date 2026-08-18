import { Router } from "express";
import { serve } from "inngest/express";
import { inngest } from "../jobs/inngest.js";
import { sayHello } from "../jobs/say-hello.job.js";
import { makeReport } from "../jobs/make-report.job.js";
import { heartbeat } from "../jobs/heartbeat.job.js";

const router = Router();

router.use(
  "/api/inngest",
  serve({ client: inngest, functions: [sayHello, makeReport, heartbeat] })
);

export default router;