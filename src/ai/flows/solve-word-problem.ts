// src/ai/flows/solve-word-problem.ts
'use server';
/**
 * @fileOverview A flow to solve math word problems with step-by-step explanations.
 *
 * - solveWordProblem - A function that solves the word problem and provides steps.
 * - SolveWordProblemInput - The input type for the solveWordProblem function.
 * - SolveWordProblemOutput - The return type for the solveWordProblem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SolveWordProblemInputSchema = z.object({
  problem: z.string().describe('The math word problem to solve.'),
});
export type SolveWordProblemInput = z.infer<typeof SolveWordProblemInputSchema>;

const SolveWordProblemOutputSchema = z.object({
  formula: z.string().describe('The mathematical formula identified to solve the problem.'),
  steps: z.array(z.string()).describe('The detailed, step-by-step process for solving the problem.'),
  result: z.string().describe('The final answer to the problem, including units if applicable.'),
});
export type SolveWordProblemOutput = z.infer<typeof SolveWordProblemOutputSchema>;

export async function solveWordProblem(input: SolveWordProblemInput): Promise<SolveWordProblemOutput> {
  return solveWordProblemFlow(input);
}

const wordProblemPrompt = ai.definePrompt({
    name: 'wordProblemPrompt',
    input: { schema: SolveWordProblemInputSchema },
    output: { schema: SolveWordProblemOutputSchema },
    prompt: `You are an expert math tutor. Your task is to solve the following word problem and provide a clear, step-by-step explanation.

Word Problem: {{{problem}}}

Follow these instructions:
1.  **Identify the Formula**: First, determine the correct mathematical formula or equation needed to solve the problem.
2.  **Extract Variables**: Identify all the necessary variables from the text and list them.
3.  **Step-by-Step Solution**: Show the process of substituting the variables into the formula and solving the equation. Explain each step clearly.
4.  **Final Answer**: State the final answer clearly, including any relevant units.

Your output must be a JSON object with three keys: "formula" (the equation used), "steps" (an array of strings explaining the process), and "result" (the final answer).
`,
});


const solveWordProblemFlow = ai.defineFlow(
  {
    name: 'solveWordProblemFlow',
    inputSchema: SolveWordProblemInputSchema,
    outputSchema: SolveWordProblemOutputSchema,
  },
  async input => {
    try {
      const { output } = await wordProblemPrompt(input);

      if (!output) {
        throw new Error("AI failed to generate a response.");
      }

      return output;
      
    } catch (error: any) {
      console.error('Error solving word problem:', error);
      throw new Error(`Error solving word problem: ${error.message}`);
    }
  }
);
