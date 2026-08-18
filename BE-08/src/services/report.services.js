import { count, avgPrice, mostExpensive, perRating } from "../repository/books.repository.js";

export function getReportData() {
  return {
    totalBooks: count(),
    avgPrice: avgPrice(),
    top5: mostExpensive(5),
    perRating: perRating(),
  };
}