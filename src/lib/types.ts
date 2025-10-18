export type HistoryEntry = {
  id: number;
  type: "calc" | "unit" | "formula" | "draw" | "graph";
  expression: string;
  result: string;
};
