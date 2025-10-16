// SolveUserDefinedFormulas story implementation
'use server';
/**
 * @fileOverview A flow to solve user-defined formulas.
 *
 * - solveUserDefinedFormula - A function that solves the user defined formula.
 * - SolveUserDefinedFormulaInput - The input type for the solveUserDefinedFormula function.
 * - SolveUserDefinedFormulaOutput - The return type for the solveUserDefinedFormula function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { evaluate } from 'mathjs';

const SolveUserDefinedFormulaInputSchema = z.object({
  formula: z.string().describe('The user-defined formula (e.g., area = pi * r^2).'),
  variables: z.record(z.number()).describe('A JSON object containing the variables and their values (e.g., { \"r\": 5 }).'),
});
export type SolveUserDefinedFormulaInput = z.infer<typeof SolveUserDefinedFormulaInputSchema>;

const SolveUserDefinedFormulaOutputSchema = z.object({
  result: z.number().describe('The result of the formula calculation.'),
});
export type SolveUserDefinedFormulaOutput = z.infer<typeof SolveUserDefinedFormulaOutputSchema>;

export async function solveUserDefinedFormula(input: SolveUserDefinedFormulaInput): Promise<SolveUserDefinedFormulaOutput> {
  return solveUserDefinedFormulaFlow(input);
}

const solveUserDefinedFormulaFlow = ai.defineFlow(
  {
    name: 'solveUserDefinedFormulaFlow',
    inputSchema: SolveUserDefinedFormulaInputSchema,
    outputSchema: SolveUserDefinedFormulaOutputSchema,
  },
  async input => {
    try {
      // Extract the variable name from the formula.
      const [resultVar, expression] = input.formula.split('=').map(s => s.trim());

      // Evaluate the expression using mathjs, with the provided variables.
      const result = evaluate(expression, input.variables);

      return { result: result };
    } catch (error: any) {
      console.error('Error evaluating formula:', error);
      throw new Error(`Error evaluating formula: ${error.message}`);
    }
  }
);
