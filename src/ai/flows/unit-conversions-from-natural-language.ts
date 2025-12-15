
'use server';

/**
 * @fileOverview Converts units from natural language queries using AI.
 *
 * - convertUnitsFromNaturalLanguage - A function that converts units from a natural language query.
 * - ConvertUnitsInput - The input type for the convertUnitsFromNatural-language function.
 * - ConvertUnitsOutput - The return type for the convertUnitsFromNaturalLanguage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConvertUnitsInputSchema = z.object({
  query: z.string().describe('The natural language query to convert units from.'),
});
export type ConvertUnitsInput = z.infer<typeof ConvertUnitsInputSchema>;

const ConvertUnitsOutputSchema = z.object({
  result: z.string().describe('The result of the unit conversion.'),
});
export type ConvertUnitsOutput = z.infer<typeof ConvertUnitsOutputSchema>;

export async function convertUnitsFromNaturalLanguage(
  input: ConvertUnitsInput
): Promise<ConvertUnitsOutput> {
  return convertUnitsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'convertUnitsPrompt',
  input: {schema: ConvertUnitsInputSchema},
  output: {schema: ConvertUnitsOutputSchema},
  prompt: `You are a unit conversion expert. You will take a natural language query and convert the units to the correct values.

Query: {{{query}}}

Your output MUST be a JSON object with a single key "result" that contains the numerical answer and the unit. For example: { "result": "1.609 kilometers" }.
Respond with only the JSON object, nothing else. No extraneous text.`,
});

const convertUnitsFlow = ai.defineFlow(
  {
    name: 'convertUnitsFlow',
    inputSchema: ConvertUnitsInputSchema,
    outputSchema: ConvertUnitsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate a response for the unit conversion.');
    }
    return output;
  }
);
