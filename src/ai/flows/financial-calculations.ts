'use server';
/**
 * @fileOverview A set of flows for common financial calculations.
 *
 * - calculateLoanPayment - Calculates monthly loan payments.
 * - calculateCompoundInterest - Calculates the future value of an investment with compound interest.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Schemas are defined inside the file but not exported.
const LoanPaymentInputSchema = z.object({
  principal: z.number().describe('The total loan amount.'),
  annualRate: z.number().describe('The annual interest rate (as a percentage, e.g., 5 for 5%).'),
  years: z.number().describe('The loan term in years.'),
});
const LoanPaymentOutputSchema = z.object({
  monthlyPayment: z.number().describe('The calculated monthly payment amount.'),
  totalPayment: z.number().describe('The total amount paid over the life of the loan.'),
  totalInterest: z.number().describe('The total interest paid over the life of the loan.'),
});

const CompoundInterestInputSchema = z.object({
  principal: z.number().describe('The initial principal amount.'),
  annualRate: z.number().describe('The annual interest rate (as a percentage, e.g., 5 for 5%).'),
  years: z.number().describe('The number of years the money is invested or borrowed for.'),
  compoundsPerYear: z.number().describe('The number of times that interest is compounded per year.'),
});
const CompoundInterestOutputSchema = z.object({
  futureValue: z.number().describe('The future value of the investment/loan, including interest.'),
  totalInterest: z.number().describe('The total interest earned.'),
});

// Types are derived from schemas and can be exported.
export type LoanPaymentInput = z.infer<typeof LoanPaymentInputSchema>;
export type LoanPaymentOutput = z.infer<typeof LoanPaymentOutputSchema>;
export type CompoundInterestInput = z.infer<typeof CompoundInterestInputSchema>;
export type CompoundInterestOutput = z.infer<typeof CompoundInterestOutputSchema>;

// The main flow function for loan payment calculation.
const calculateLoanPaymentFlow = ai.defineFlow(
  {
    name: 'calculateLoanPaymentFlow',
    inputSchema: LoanPaymentInputSchema,
    outputSchema: LoanPaymentOutputSchema,
  },
  async ({ principal, annualRate, years }) => {
    try {
      const monthlyRate = annualRate / 100 / 12;
      const numberOfPayments = years * 12;

      if (monthlyRate === 0) {
        const monthlyPayment = principal / numberOfPayments;
        return {
          monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
          totalPayment: principal,
          totalInterest: 0,
        };
      }

      const monthlyPayment =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      
      const totalPayment = monthlyPayment * numberOfPayments;
      const totalInterest = totalPayment - principal;

      return {
        monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
        totalPayment: parseFloat(totalPayment.toFixed(2)),
        totalInterest: parseFloat(totalInterest.toFixed(2)),
      };
    } catch (error: any) {
      console.error('Error calculating loan payment:', error);
      throw new Error(`Error calculating loan payment: ${error.message}`);
    }
  }
);

// The main flow function for compound interest calculation.
const calculateCompoundInterestFlow = ai.defineFlow(
    {
      name: 'calculateCompoundInterestFlow',
      inputSchema: CompoundInterestInputSchema,
      outputSchema: CompoundInterestOutputSchema,
    },
    async ({ principal, annualRate, years, compoundsPerYear }) => {
      try {
          const rate = annualRate / 100;
          const futureValue = principal * Math.pow(1 + rate / compoundsPerYear, compoundsPerYear * years);
          const totalInterest = futureValue - principal;
          
          if (!isFinite(futureValue)) {
            throw new Error('The resulting value is too large to be calculated. Please use smaller inputs.');
          }

          return {
              futureValue: parseFloat(futureValue.toFixed(2)),
              totalInterest: parseFloat(totalInterest.toFixed(2)),
          };
      } catch (error: any)      {
          console.error('Error calculating compound interest:', error);
          throw new Error(`Error calculating compound interest: ${error.message}`);
      }
    }
);

// Exported async wrapper functions that are safe for "use server".
export async function calculateLoanPayment(input: LoanPaymentInput): Promise<LoanPaymentOutput> {
  return calculateLoanPaymentFlow(input);
}

export async function calculateCompoundInterest(input: CompoundInterestInput): Promise<CompoundInterestOutput> {
  return calculateCompoundInterestFlow(input);
}
