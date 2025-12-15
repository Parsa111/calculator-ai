'use server';
/**
 * @fileOverview A flow to perform date calculations from natural language.
 *
 * - calculateDate - A function that performs date calculations based on a query.
 * - DateCalculationInput - The input type for the calculateDate function.
 * - DateCalculationOutput - The return type for the calculateDate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DateCalculationInputSchema = z.object({
  query: z.string().describe('A natural language query about dates. For example: "What is the date 45 days from today?", "How many days between 1/1/2024 and 3/15/2024?", "today + 3 weeks"'),
  baseDate: z.string().optional().describe("An optional base date in ISO 8601 format to perform calculations from. If not provided, assume 'today'.")
});
export type DateCalculationInput = z.infer<typeof DateCalculationInputSchema>;

const DateCalculationOutputSchema = z.object({
  result: z.string().describe('The result of the date calculation, as a formatted string (e.g., "Monday, June 3, 2024" or "90 days").'),
});
export type DateCalculationOutput = z.infer<typeof DateCalculationOutputSchema>;

export async function calculateDate(input: DateCalculationInput): Promise<DateCalculationOutput> {
  return dateCalculationFlow(input);
}

const dateCalculationPrompt = ai.definePrompt({
    name: 'dateCalculationPrompt',
    input: { schema: z.object({
        currentDate: z.string(),
        query: z.string(),
        baseDate: z.string().optional(),
    }) },
    output: { schema: DateCalculationOutputSchema },
    prompt: `You are an expert date and time calculator. Your task is to interpret the user's query and provide a precise answer.

Current Date: {{{currentDate}}}
Base Date for calculation (if provided): {{{baseDate}}}

Query: {{{query}}}

Follow these instructions:
1.  Parse the query to understand the user's intent (e.g., find a future/past date, calculate duration).
2.  Perform the calculation accurately. For durations, provide the result in days, weeks, and months where appropriate.
3.  For date results, format them clearly (e.g., "Month Day, Year").
4.  Respond only with the calculated result.

Your output must be a JSON object with a single key "result".
`,
});


const dateCalculationFlow = ai.defineFlow(
  {
    name: 'dateCalculationFlow',
    inputSchema: DateCalculationInputSchema,
    outputSchema: DateCalculationOutputSchema,
  },
  async input => {
    try {
      const { output } = await dateCalculationPrompt({
          ...input,
          currentDate: new Date().toDateString(),
      });
      if (!output) {
        throw new Error("AI failed to generate a response.");
      }
      return output;
      
    } catch (error: any) {
      console.error('Error in date calculation flow:', error);
      throw new Error(`Error calculating date: ${error.message}`);
    }
  }
);
