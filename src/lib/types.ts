export type HistoryEntry = {
  id: number;
  type: "calc" | "unit" | "formula" | "draw" | "voice";
  expression: string;
  result: string;
};
