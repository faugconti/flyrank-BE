import path from "node:path";
import { insert, updatePath, findById } from "../repository/reports.repository.js";
import { generateReportPdf, REPORTS_DIR } from "../services/report.services.js";

export async function createReport(req, res) {
  try {
    const id = insert();
    const storedPath = await generateReportPdf(id);
    updatePath(id, storedPath);
    res.status(201).json({ id, file: `/reports/${id}/file` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "report generation failed" });
  }
}

export function getReport(req, res) {
  const report = findById(req.params.id);
  if (!report) return res.status(404).json({ error: "report not found" });
  res.status(200).json({
    id: report.id,
    created_at: report.created_at,
    file: `/reports/${report.id}/file`,
  });
}

export function getReportFile(req, res) {
  const report = findById(req.params.id);
  if (!report) return res.status(404).json({ error: "report not found" });
  res.sendFile(path.join(REPORTS_DIR, `${report.id}.pdf`));
}