import { randomUUID } from "node:crypto";
import { inngest } from "../jobs/inngest.js";

const reports = new Map();

export function createReport(topic) {
  const report = { id: randomUUID(), topic, status: "pending" };
  reports.set(report.id, report);

  inngest.send({
    name: "report/requested",
    data: { id: report.id, topic },
  });

  return report;
}

export function getReport(id) {
  return reports.get(id);
}

export function markReportDone(id, result) {
  const report = reports.get(id);
  if (report) {
    report.status = "done";
    report.result = result;
  }
  return report;
}

export function markReportFailed(id) {
  const report = reports.get(id);
  if (report) {
    report.status = "failed";
  }
  return report;
}