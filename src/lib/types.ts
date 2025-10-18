export type HistoryEntry = {
  id: number;
  type: "calc" | "unit" | "formula" | "draw" | "graph" | "word-problem";
  expression: string;
  result: string;
};
