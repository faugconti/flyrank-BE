import { count, avgPrice, mostExpensive, perRating } from "../repository/books.repository.js";

export function getReportData() {
  return {
    totalBooks: count(),
    avgPrice: avgPrice(),
    top5: mostExpensive(5),
    perRating: perRating(),
  };
}

function stars(rating) {
  return `${"★".repeat(rating)}${"☆".repeat(5 - rating)}`;
}

function gbp(value) {
  return `£${Number(value).toFixed(2)}`;
}

export function buildReportHtml(report, books) {
  const today = new Date().toISOString().slice(0, 10);

  const top5Rows = report.top5
    .map(
      (book) => `
        <tr>
          <td>${book.title}</td>
          <td class="num">${gbp(book.price)}</td>
        </tr>`
    )
    .join("");

  const ratingRows = report.perRating
    .map(
      (row) => `
        <tr>
          <td>${stars(row.rating)}</td>
          <td class="num">${row.n}</td>
        </tr>`
    )
    .join("");

  const allRows = books
    .map(
      (book) => `
        <tr>
          <td>${book.title}</td>
          <td>${stars(book.rating)}</td>
          <td class="num">${gbp(book.price)}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Bookstore Report — ${today}</title>
<style>
  @page { margin: 20mm 15mm; }
  html { font-family: Helvetica, Arial, sans-serif; color: #1a1a1a; }
  h1 { font-size: 20pt; margin: 0 0 2mm; }
  .date { color: #666; font-size: 10pt; margin: 0 0 8mm; }
  h2 { font-size: 13pt; margin: 6mm 0 3mm; border-bottom: 1px solid #ccc; padding-bottom: 1mm; }
  .totals { display: flex; gap: 8mm; }
  .total { background: #f4f1ea; border: 1px solid #ddd; border-radius: 2mm; padding: 3mm 5mm; }
  .total .label { font-size: 9pt; color: #666; }
  .total .value { font-size: 16pt; font-weight: bold; }
  table { width: 100%; border-collapse: collapse; margin-top: 2mm; font-size: 10pt; }
  thead { display: table-header-group; }
  tr { break-inside: avoid; }
  th, td { border: 1px solid #ccc; padding: 1.6mm 2.5mm; text-align: left; }
  th { background: #2b2b2b; color: #fff; font-weight: bold; }
  tbody tr:nth-child(even) { background: #f7f7f7; }
  .num { text-align: right; }
</style>
</head>
<body>
  <h1>Bookstore Report</h1>
  <p class="date">${today}</p>

  <div class="totals">
    <div class="total">
      <div class="label">Total books</div>
      <div class="value">${report.totalBooks}</div>
    </div>
    <div class="total">
      <div class="label">Average price</div>
      <div class="value">${gbp(report.avgPrice)}</div>
    </div>
  </div>

  <h2>Top 5 most expensive books</h2>
  <table>
    <thead>
      <tr><th>Title</th><th class="num">Price</th></tr>
    </thead>
    <tbody>${top5Rows}</tbody>
  </table>

  <h2>Books per star rating</h2>
  <table>
    <thead>
      <tr><th>Rating</th><th class="num">Books</th></tr>
    </thead>
    <tbody>${ratingRows}</tbody>
  </table>

  <h2>All ${books.length} books</h2>
  <table>
    <thead>
      <tr><th>Title</th><th>Rating</th><th class="num">Price</th></tr>
    </thead>
    <tbody>${allRows}</tbody>
  </table>
</body>
</html>`;
}