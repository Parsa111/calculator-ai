"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { HistoryEntry } from '@/lib/types';
import { solveUserDefinedFormula, type SolveUserDefinedFormulaOutput } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FlaskConical, CheckCircle2 } from 'lucide-react';
import { Separator } from './ui/separator';

interface FormulaSolverProps {
  onSolve: (entry: Omit<HistoryEntry, 'id'>) => void;
}

const formSchema = z.object({
  formula: z.string().includes('=', { message: "Formula must include an '=' sign." }),
  variables: z.string().min(1, { message: 'Please provide at least one variable.' }),
});

export function FormulaSolver({ onSolve }: FormulaSolverProps) {
  const [solution, setSolution] = useState<SolveUserDefinedFormulaOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { formula: '', variables: '' },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setSolution(null);
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
      setSolution(response);
      const expression = `${values.formula} with ${JSON.stringify(variablesObj)}`;
      onSolve({ type: 'formula', expression, result: String(response.result) });
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
          Enter a formula and its variables to see the step-by-step solution.
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
            {solution && (
              <Card className="w-full bg-muted/50 border-border">
                <CardHeader>
                  <CardTitle>Solution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Steps:</h4>
                    <ul className="space-y-2">
                      {solution.steps.map((step, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 mr-2 mt-1 shrink-0 text-green-500" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Final Result:</h4>
                    <p className="text-2xl font-bold text-primary">{solution.result}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
