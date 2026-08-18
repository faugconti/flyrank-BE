import { inngest } from "./inngest.js";
import { markReportDone } from "../services/reports.service.js";

export const makeReport = inngest.createFunction(
  { id: "make-report", triggers: [{ event: "report/requested" }] },
  async ({ event, step }) => {
    const { id, topic } = event.data;

    await step.sleep("do-the-slow-work", "8s");

    const result = await step.run("build-report", async () => {
      return `Report for ${topic}: done after 8 seconds of hard work!`;
    });

    markReportDone(id, result);
  }
);