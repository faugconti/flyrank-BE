import { inngest } from "./inngest.js";
import { markReportDone, markReportFailed } from "../services/reports.service.js";

export const makeReport = inngest.createFunction(
  {
    id: "make-report",
    triggers: [{ event: "report/requested" }],
    retries: 2,
    onFailure: async ({ event }) => {
      const { id } = event.data.event.data;
      markReportFailed(id);
    },
  },
  async ({ event, step }) => {
    const { id, topic } = event.data;

    await step.sleep("do-the-slow-work", "8s");

    await step.run("build-report", async () => {
      if (topic === "fail") {
        throw new Error("The report oven is broken!");
      }
      const result = `Report for ${topic}: done after 8 seconds of hard work!`;
      markReportDone(id, result);
      return result;
    });
  }
);