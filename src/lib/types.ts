export type HistoryEntry = {
  id: number;
  type: "calc" | "unit" | "formula" | "draw";
  expression: string;
  result: string;
};
