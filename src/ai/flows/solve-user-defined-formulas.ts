// SolveUserDefinedFormulas story implementation
'use server';
/**
 * @fileOverview A flow to solve user-defined formulas with step-by-step explanations.
 *
 * - solveUserDefinedFormula - A function that solves the user defined formula and provides steps.
 * - SolveUserDefinedFormulaInput - The input type for the solveUserDefinedFormula function.
 * - SolveUserDefinedFormulaOutput - The return type for the solveUserDefinedFormula function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { evaluate } from 'mathjs';

const SolveUserDefinedFormulaInputSchema = z.object({
  formula: z.string().describe('The user-defined formula (e.g., area = pi * r^2).'),
  variables: z.record(z.number()).describe('A JSON object containing the variables and their values (e.g., { "r": 5 }).'),
});
export type SolveUserDefinedFormulaInput = z.infer<typeof SolveUserDefinedFormulaInputSchema>;

const SolveUserDefinedFormulaOutputSchema = z.object({
  steps: z.array(z.string()).describe('The detailed, step-by-step process for solving the equation.'),
  result: z.number().describe('The final numerical result of the calculation.'),
});
export type SolveUserDefinedFormulaOutput = z.infer<typeof SolveUserDefinedFormulaOutputSchema>;

export async function solveUserDefinedFormula(input: SolveUserDefinedFormulaInput): Promise<SolveUserDefinedFormulaOutput> {
  return solveUserDefinedFormulaFlow(input);
}

const stepByStepPrompt = ai.definePrompt({
    name: 'stepByStepPrompt',
    input: { schema: z.object({
        formula: z.string(),
        variables: z.string(),
    })},
    output: { schema: SolveUserDefinedFormulaOutputSchema },
    prompt: `You are a helpful math tutor. Your goal is to solve the given formula and provide a clear, step-by-step explanation of how you arrived at the answer.

Formula: {{{formula}}}
Variables: {{{variables}}}

First, substitute the variables into the formula.
Then, show each step of the calculation process.
Finally, provide the final answer.

Your output must be a JSON object with two keys: "steps" (an array of strings explaining the process) and "result" (the final numerical answer).
`,
});


const solveUserDefinedFormulaFlow = ai.defineFlow(
  {
    name: 'solveUserDefinedFormulaFlow',
    inputSchema: SolveUserDefinedFormulaInputSchema,
    outputSchema: SolveUserDefinedFormulaOutputSchema,
  },
  async input => {
    try {
      const { output } = await stepByStepPrompt({
          ...input,
          variables: JSON.stringify(input.variables),
      });

      if (!output) {
        throw new Error("AI failed to generate a response.");
      }

      // Also evaluate with mathjs to double-check the AI's result.
      // The AI is better for steps, mathjs is better for accuracy.
      const expression = input.formula.includes('=')
        ? input.formula.split('=')[1].trim()
        : input.formula;
      const mathjsResult = evaluate(expression, input.variables);

      // Return AI-generated steps with the more reliable mathjs result.
      return {
        steps: output.steps,
        result: parseFloat(mathjsResult.toPrecision(10)),
      };
      
    } catch (error: any) {
      console.error('Error evaluating formula:', error);
      throw new Error(`Error evaluating formula: ${error.message}`);
    }
  }
);
