import { inngest } from "./inngest.js";
import { getReportCounts } from "../services/reports.service.js";

export const heartbeat = inngest.createFunction(
  { id: "heartbeat", triggers: [{ cron: "* * * * *" }] },
  async () => {
    const counts = getReportCounts();
    const summary = `[heartbeat] ${counts.pending} pending, ${counts.done} done, ${counts.failed} failed`;
    console.log(summary);
    return summary;
  }
);