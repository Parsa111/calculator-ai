"use server";

import { calculateFromDrawnFormula as calculateFromDrawnFormulaFlow, type CalculateFromDrawnFormulaInput } from "@/ai/flows/calculate-from-drawn-formula";
import { solveUserDefinedFormula as solveUserDefinedFormulaFlow, type SolveUserDefinedFormulaInput, type SolveUserDefinedFormulaOutput } from "@/ai/flows/solve-user-defined-formulas";
import { convertUnitsFromNaturalLanguage as convertUnitsFromNaturalLanguageFlow, type ConvertUnitsInput } from "@/ai/flows/unit-conversions-from-natural-language";
import { solveWordProblem as solveWordProblemFlow, type SolveWordProblemInput, type SolveWordProblemOutput } from "@/ai/flows/solve-word-problem";
import { calculateLoanPayment as calculateLoanPaymentFlow, type LoanPaymentInput, type LoanPaymentOutput } from "@/ai/flows/financial-calculations";
import { calculateCompoundInterest as calculateCompoundInterestFlow, type CompoundInterestInput, type CompoundInterestOutput } from "@/ai/flows/financial-calculations";
import { calculateDate as calculateDateFlow, type DateCalculationInput, type DateCalculationOutput } from "@/ai/flows/date-calculations";

export type { CompoundInterestOutput };

export async function convertUnitsFromNaturalLanguage(input: ConvertUnitsInput) {
    return await convertUnitsFromNaturalLanguageFlow(input);
}

export async function solveUserDefinedFormula(input: SolveUserDefinedFormulaInput): Promise<SolveUserDefinedFormulaOutput> {
    return await solveUserDefinedFormulaFlow(input);
}

export async function calculateFromDrawnFormula(input: CalculateFromDrawnFormulaInput) {
    return await calculateFromDrawnFormulaFlow(input);
}

export async function solveWordProblem(input: SolveWordProblemInput): Promise<SolveWordProblemOutput> {
    return await solveWordProblemFlow(input);
}

export async function calculateLoanPayment(input: LoanPaymentInput): Promise<LoanPaymentOutput> {
    return await calculateLoanPaymentFlow(input);
}

export async function calculateCompoundInterest(input: CompoundInterestInput): Promise<CompoundInterestOutput> {
    return await calculateCompoundInterestFlow(input);
}

export async function calculateDate(input: DateCalculationInput): Promise<DateCalculationOutput> {
    return await calculateDateFlow(input);
}
