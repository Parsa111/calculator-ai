"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { HistoryEntry } from '@/lib/types';
import { calculateLoanPayment, type LoanPaymentOutput } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Separator } from './ui/separator';

interface LoanCalculatorProps {
  onCalculate: (entry: Omit<HistoryEntry, 'id'>) => void;
}

const formSchema = z.object({
  principal: z.coerce.number().min(1, { message: 'Loan amount must be greater than 0.' }),
  annualRate: z.coerce.number().min(0, { message: 'Interest rate must be positive.' }),
  years: z.coerce.number().int().min(1, { message: 'Loan term must be at least 1 year.' }),
});

export function LoanCalculator({ onCalculate }: LoanCalculatorProps) {
  const [result, setResult] = useState<LoanPaymentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { principal: 250000, annualRate: 5, years: 30 },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await calculateLoanPayment(values);
      setResult(response);
      onCalculate({
        type: 'financial',
        expression: `Loan of $${values.principal} at ${values.annualRate}% for ${values.years} years`,
        result: `Monthly: $${response.monthlyPayment}`,
      });
    } catch (e: any) {
      setError(e.message || 'Failed to calculate. Please check your inputs.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>Loan & Mortgage Calculator</CardTitle>
        <CardDescription>Estimate your monthly payments for loans or mortgages.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="principal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Amount ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 250000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="annualRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Interest Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., 5.25" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="years"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Term (Years)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col items-start space-y-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Calculate
            </Button>
            {result && (
                <Card className="w-full bg-muted/50 p-4 space-y-3">
                    <div className="text-center mb-4">
                        <p className="text-sm text-muted-foreground">Monthly Payment</p>
                        <p className="text-3xl font-bold text-primary">{formatCurrency(result.monthlyPayment)}</p>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Total Principal Paid</span>
                        <span className="font-medium">{formatCurrency(form.getValues('principal'))}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Total Interest Paid</span>
                        <span className="font-medium">{formatCurrency(result.totalInterest)}</span>
                    </div>
                    <Separator />
                     <div className="flex justify-between items-center font-semibold">
                        <span>Total Paid</span>
                        <span>{formatCurrency(result.totalPayment)}</span>
                    </div>
                </Card>
            )}
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
