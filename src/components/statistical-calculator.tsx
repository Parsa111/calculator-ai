"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { HistoryEntry } from '@/lib/types';
import { calculateStatistics, type StatisticsOutput } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, BarChart } from 'lucide-react';
import { Separator } from './ui/separator';

interface StatisticalCalculatorProps {
  onCalculate: (entry: Omit<HistoryEntry, 'id'>) => void;
}

const formSchema = z.object({
  numbers: z.string().min(1, { message: 'Please enter a list of numbers.' }),
});

export function StatisticalCalculator({ onCalculate }: StatisticalCalculatorProps) {
  const [result, setResult] = useState<StatisticsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { numbers: '' },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const numbers = values.numbers
        .split(/[\s,]+/)
        .filter(n => n.trim() !== '')
        .map(Number)
        .filter(n => !isNaN(n));

      if (numbers.length === 0) {
        throw new Error("No valid numbers were found. Please enter comma or space-separated numbers.");
      }

      const response = await calculateStatistics({ numbers });
      setResult(response);
      onCalculate({
        type: 'stats',
        expression: `Stats for ${numbers.length} numbers`,
        result: `Mean: ${response.mean}`,
      });
    } catch (e: any) {
      setError(e.message || 'Failed to calculate statistics.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatMode = (mode: number | number[]) => {
      if (Array.isArray(mode)) {
          return mode.join(', ');
      }
      return mode;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center"><BarChart className="w-6 h-6 mr-2 text-primary" />Statistical Calculator</CardTitle>
        <CardDescription>
          Enter a list of numbers (separated by commas or spaces) to calculate statistical measures.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="numbers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numbers</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., 1, 2, 3, 4, 5, 5, 6" 
                      rows={4}
                      {...field} 
                    />
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
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Mean</span>
                            <span className="font-semibold text-primary text-lg">{result.mean}</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Median</span>
                            <span className="font-semibold text-primary text-lg">{result.median}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Mode</span>
                            <span className="font-semibold text-primary text-lg">{formatMode(result.mode)}</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Standard Deviation</span>
                            <span className="font-semibold text-primary text-lg">{result.standardDeviation}</span>
                        </div>
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
