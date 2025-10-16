// src/ai/flows/calculate-from-drawn-formula.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for calculating the result of a user-drawn formula by parsing the formula with AI, extracting variables, and performing the calculation.
 *
 * calculateFromDrawnFormula - An asynchronous function that takes a data URI of a drawn formula and a JSON object of variable values, then returns the calculated result.
 * CalculateFromDrawnFormulaInput - The input type for the calculateFromDrawnFormula function.
 * CalculateFromDrawnFormulaOutput - The return type for the calculateFromDrawnFormula function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateFromDrawnFormulaInputSchema = z.object({
  formulaDataUri: z
    .string()
    .describe(
      "A data URI of a drawn formula image. It must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  variableValues: z
    .record(z.number())
    .describe('A JSON object where keys are variable names and values are the numerical values for those variables.'),
});

export type CalculateFromDrawnFormulaInput = z.infer<typeof CalculateFromDrawnFormulaInputSchema>;

const CalculateFromDrawnFormulaOutputSchema = z.object({
  result: z.number().describe('The calculated result of the formula.'),
});

export type CalculateFromDrawnFormulaOutput = z.infer<typeof CalculateFromDrawnFormulaOutputSchema>;

export async function calculateFromDrawnFormula(
  input: CalculateFromDrawnFormulaInput
): Promise<CalculateFromDrawnFormulaOutput> {
  return calculateFromDrawnFormulaFlow(input);
}

const formulaParsingPrompt = ai.definePrompt({
  name: 'formulaParsingPrompt',
  input: {schema: CalculateFromDrawnFormulaInputSchema},
  output: {schema: z.object({formula: z.string().describe('A parsable mathematical formula.')})},
  prompt: `You are an AI equation parser.
  Your job is to take a drawn image of an equation and turn it into a parsable equation.

  Here is the drawn formula: {{media url=formulaDataUri}}
  Return a parsable mathematical formula that matches the image.`,
});

const calculateFromDrawnFormulaFlow = ai.defineFlow(
  {
    name: 'calculateFromDrawnFormulaFlow',
    inputSchema: CalculateFromDrawnFormulaInputSchema,
    outputSchema: CalculateFromDrawnFormulaOutputSchema,
  },
  async input => {
    const parsedFormula = await formulaParsingPrompt(input);
    const formula = parsedFormula.output?.formula;

    if (!formula) {
      throw new Error('Could not parse formula from image.');
    }

    try {
      // TODO: Implement formula evaluation with variable substitution
      // This placeholder directly returns 0 and needs to be replaced
      // with actual formula parsing and calculation logic using the
      // variableValues provided in the input.
      // For security reasons, dynamically evaluating JavaScript code
      // is highly discouraged.  Consider using a math expression parser
      // library for safe evaluation.
      console.log('Parsed formula:', formula);
      console.log('Variable values:', input.variableValues);

      // Replace variables in formula with their values
      let evaluatedFormula = formula;
      for (const variable in input.variableValues) {
        evaluatedFormula = evaluatedFormula.replace(variable, input.variableValues[variable].toString());
      }

      // TODO: Add a math parser library to properly evaluate this formula.
      // For now, throw error rather than eval.
      throw new Error('Add a math parser library to evaluate the formula safely.');

      // const result = eval(evaluatedFormula); // Potentially unsafe: do not use eval()
      // return { result: Number(result) };

      return { result: 0 }; // Placeholder

    } catch (error: any) {
      console.error('Error during formula evaluation:', error);
      throw new Error(`Error evaluating formula: ${error.message}`);
    }
  }
);
