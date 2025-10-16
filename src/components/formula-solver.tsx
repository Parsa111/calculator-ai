"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { HistoryEntry } from '@/lib/types';
import { solveUserDefinedFormula } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FlaskConical } from 'lucide-react';

interface FormulaSolverProps {
  onSolve: (entry: Omit<HistoryEntry, 'id'>) => void;
}

const formSchema = z.object({
  formula: z.string().includes('=', { message: "Formula must include an '=' sign." }),
  variables: z.string().min(1, { message: 'Please provide at least one variable.' }),
});

export function FormulaSolver({ onSolve }: FormulaSolverProps) {
  const [result, setResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { formula: '', variables: '' },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const variablesObj: Record<string, number> = {};
      values.variables.split('\n').forEach(line => {
        const [key, value] = line.split('=').map(s => s.trim());
        if (key && value && !isNaN(Number(value))) {
          variablesObj[key] = Number(value);
        }
      });
      
      if (Object.keys(variablesObj).length === 0) {
        throw new Error("Invalid variable format. Use 'key=value' on each line.");
      }

      const response = await solveUserDefinedFormula({ formula: values.formula, variables: variablesObj });
      const solveResult = response.result;
      setResult(solveResult);
      const expression = `${values.formula} with ${JSON.stringify(variablesObj)}`;
      onSolve({ type: 'formula', expression, result: String(solveResult) });
    } catch (e: any) {
      setError(e.message || 'Failed to solve formula. Please check your input.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center"><FlaskConical className="w-6 h-6 mr-2 text-primary" />Formula Solver</CardTitle>
        <CardDescription>
          Enter a formula and its variables to find the solution.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="formula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Formula</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., area = pi * r^2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="variables"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variables (one per line)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="pi=3.14159&#10;r=5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-start space-y-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Solve
            </Button>
            {result !== null && (
              <Card className="w-full bg-primary/10 border-primary/20">
                <CardHeader>
                  <CardTitle>Result</CardTitle>
                  <CardDescription className="text-2xl font-semibold text-primary">{result}</CardDescription>
                </CardHeader>
              </Card>
            )}
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
