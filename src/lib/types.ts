export type HistoryEntry = {
  id: number;
  type: "calc" | "unit" | "formula" | "draw" | "graph" | "word-problem" | "financial";
  expression: string;
  result: string;
};
