"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { HistoryEntry } from '@/lib/types';
import { calculateCompoundInterest, type CompoundInterestOutput } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Separator } from './ui/separator';

interface CompoundInterestCalculatorProps {
  onCalculate: (entry: Omit<HistoryEntry, 'id'>) => void;
}

const formSchema = z.object({
  principal: z.coerce.number().min(1, { message: 'Principal must be greater than 0.' }),
  annualRate: z.coerce.number().min(0, { message: 'Interest rate must be positive.' }),
  years: z.coerce.number().int().min(1, { message: 'Term must be at least 1 year.' }),
  compoundsPerYear: z.coerce.number().int().min(1),
});

export function CompoundInterestCalculator({ onCalculate }: CompoundInterestCalculatorProps) {
  const [result, setResult] = useState<CompoundInterestOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { principal: 10000, annualRate: 7, years: 10, compoundsPerYear: 12 },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await calculateCompoundInterest(values);
      setResult(response);
      onCalculate({
        type: 'financial',
        expression: `Interest for $${values.principal} at ${values.annualRate}% for ${values.years} years`,
        result: `Future Value: $${response.futureValue}`,
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
        <CardTitle>Compound Interest Calculator</CardTitle>
        <CardDescription>Calculate the future value of your investments.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="principal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Principal Amount ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 10000" {...field} />
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
                    <Input type="number" step="0.01" placeholder="e.g., 7" {...field} />
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
                  <FormLabel>Investment Term (Years)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="compoundsPerYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compound Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Annually</SelectItem>
                      <SelectItem value="2">Semi-Annually</SelectItem>
                      <SelectItem value="4">Quarterly</SelectItem>
                      <SelectItem value="12">Monthly</SelectItem>
                      <SelectItem value="365">Daily</SelectItem>
                    </SelectContent>
                  </Select>
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
                        <p className="text-sm text-muted-foreground">Future Value</p>
                        <p className="text-3xl font-bold text-primary">{formatCurrency(result.futureValue)}</p>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Principal</span>
                        <span className="font-medium">{formatCurrency(form.getValues('principal'))}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Total Interest Earned</span>
                        <span className="font-medium">{formatCurrency(result.totalInterest)}</span>
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
