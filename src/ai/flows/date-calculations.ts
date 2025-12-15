'use server';
/**
 * @fileOverview A flow to perform date and time calculations from natural language.
 *
 * - calculateDate - A function that performs date calculations based on a query.
 * - DateCalculationInput - The input type for the calculateDate function.
 * - DateCalculationOutput - The return type for the calculateDate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DateCalculationInputSchema = z.object({
  query: z.string().describe('The natural language query for the date calculation.'),
  baseDate: z.string().optional().describe('An optional base date in ISO 8601 format to perform calculations from.'),
});
export type DateCalculationInput = z.infer<typeof DateCalculationInputSchema>;

const DateCalculationOutputSchema = z.object({
  result: z.string().describe('The result of the date calculation, formatted as a human-readable string.'),
});
export type DateCalculationOutput = z.infer<typeof DateCalculationOutputSchema>;


export async function calculateDate(input: DateCalculationInput): Promise<DateCalculationOutput> {
  return dateCalculationFlow(input);
}


const dateCalculationPrompt = ai.definePrompt({
    name: 'dateCalculationPrompt',
    input: { schema: z.object({
        query: z.string(),
        currentDate: z.string(),
        baseDate: z.string().optional(),
    })},
    output: { schema: DateCalculationOutputSchema },
    prompt: `You are a date and time calculation expert. Your goal is to accurately answer the user's query about dates and times.

Current Date: {{{currentDate}}}
User Query: {{{query}}}
{{#if baseDate}}Base Date for calculation: {{{baseDate}}}{{/if}}

Use the Base Date for calculations if it's provided. Otherwise, use the Current Date for calculations involving "today", "now", etc.
Calculate the resulting date, time, or duration based on the query.
Format the final answer as a clear, human-readable string. For example: "Thursday, January 15, 2026, 3:00 PM" or "15 days".

Your output MUST be a JSON object with a single key "result" that contains the formatted string answer.
Respond with only the JSON object, nothing else. No extraneous text.
`,
});


const dateCalculationFlow = ai.defineFlow(
  {
    name: 'dateCalculationFlow',
    inputSchema: DateCalculationInputSchema,
    outputSchema: DateCalculationOutputSchema,
  },
  async (input) => {
    const { output } = await dateCalculationPrompt({
        query: input.query,
        baseDate: input.baseDate,
        currentDate: new Date().toISOString(),
    });
    
    if (!output) {
        throw new Error("AI failed to generate a response for the date calculation.");
    }
    
    return output;
  }
);
