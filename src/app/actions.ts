"use server";

import { calculateFromDrawnFormula as calculateFromDrawnFormulaFlow, type CalculateFromDrawnFormulaInput } from "@/ai/flows/calculate-from-drawn-formula";
import { solveUserDefinedFormula as solveUserDefinedFormulaFlow, type SolveUserDefinedFormulaInput, type SolveUserDefinedFormulaOutput } from "@/ai/flows/solve-user-defined-formulas";
import { convertUnitsFromNaturalLanguage as convertUnitsFromNaturalLanguageFlow, type ConvertUnitsInput } from "@/ai/flows/unit-conversions-from-natural-language";

export async function convertUnitsFromNaturalLanguage(input: ConvertUnitsInput) {
    return await convertUnitsFromNaturalLanguageFlow(input);
}

export async function solveUserDefinedFormula(input: SolveUserDefinedFormulaInput): Promise<SolveUserDefinedFormulaOutput> {
    return await solveUserDefinedFormulaFlow(input);
}

export async function calculateFromDrawnFormula(input: CalculateFromDrawnFormulaInput) {
    return await calculateFromDrawnFormulaFlow(input);
}
