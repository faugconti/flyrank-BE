import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { getReportData, buildReportHtml } from "../src/services/report.services.js";
import { renderPdf, closeBrowser } from "../src/services/pdf.services.js";
import { listAll } from "../src/repository/books.repository.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reportsDir = path.join(__dirname, "..", "reports");

mkdirSync(reportsDir, { recursive: true });

const report = getReportData();
const books = listAll();
const html = buildReportHtml(report, books);
const outPath = path.join(reportsDir, "test.pdf");

await renderPdf(html, outPath);
await closeBrowser();
console.log(`Rendered reports/test.pdf (${report.totalBooks} books)`);