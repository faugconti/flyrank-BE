import { Router } from "express";
import { serve } from "inngest/express";
import { inngest } from "../jobs/inngest.js";
import { sayHello } from "../jobs/say-hello.job.js";

const router = Router();

router.use(
  "/api/inngest",
  serve({ client: inngest, functions: [sayHello] })
);

export default router;