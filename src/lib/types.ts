export type HistoryEntry = {
  id: number;
  type: "calc" | "unit" | "formula" | "draw" | "graph" | "word-problem" | "financial" | "date" | "stats";
  expression: string;
  result: string;
};
