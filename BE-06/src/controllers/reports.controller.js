import { createReport, getReport } from "../services/reports.service.js";

export function create(req, res) {
  const { topic } = req.body;
  const report = createReport(topic);
  res.status(202).json({ id: report.id, status: report.status });
}

export function getById(req, res) {
  const report = getReport(req.params.id);
  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.status(200).json(report);
}