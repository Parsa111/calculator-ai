'use server';
/**
 * @fileOverview A flow to perform statistical calculations on a list of numbers.
 *
 * - calculateStatistics - A function that calculates mean, median, mode, and standard deviation.
 * - StatisticsInput - The input type for the calculateStatistics function.
 * - StatisticsOutput - The return type for the calculateStatistics function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { mean, median, mode, std, round } from 'mathjs';

const StatisticsInputSchema = z.object({
  numbers: z.array(z.number()).describe('An array of numbers for statistical calculation.'),
});
export type StatisticsInput = z.infer<typeof StatisticsInputSchema>;

const StatisticsOutputSchema = z.object({
  mean: z.number().describe('The average of the numbers.'),
  median: z.number().describe('The median of the numbers.'),
  mode: z.union([z.number(), z.array(z.number())]).describe('The mode(s) of the numbers.'),
  standardDeviation: z.number().describe('The standard deviation of the numbers.'),
});
export type StatisticsOutput = z.infer<typeof StatisticsOutputSchema>;

export async function calculateStatistics(input: StatisticsInput): Promise<StatisticsOutput> {
  return statisticsCalculationFlow(input);
}

const statisticsCalculationFlow = ai.defineFlow(
  {
    name: 'statisticsCalculationFlow',
    inputSchema: StatisticsInputSchema,
    outputSchema: StatisticsOutputSchema,
  },
  async ({ numbers }) => {
    try {
      if (numbers.length === 0) {
        throw new Error('Input array cannot be empty.');
      }
      
      const calculatedMean = mean(numbers);
      const calculatedMedian = median(numbers);
      const calculatedMode = mode(numbers);
      const calculatedStdDev = std(numbers);

      return {
        mean: round(calculatedMean, 4),
        median: round(calculatedMedian, 4),
        mode: Array.isArray(calculatedMode) ? calculatedMode.map(n => round(n, 4)) : round(calculatedMode as number, 4),
        standardDeviation: round(calculatedStdDev as number, 4),
      };
    } catch (error: any) {
      console.error('Error in statistics calculation flow:', error);
      throw new Error(`Error calculating statistics: ${error.message}`);
    }
  }
);
