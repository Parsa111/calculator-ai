// src/components/word-problem-solver.tsx
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { HistoryEntry } from '@/lib/types';
import { solveWordProblem, type SolveWordProblemOutput } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, BookText, CheckCircle2, FlaskConical } from 'lucide-react';
import { Separator } from './ui/separator';

interface WordProblemSolverProps {
  onSolve: (entry: Omit<HistoryEntry, 'id'>) => void;
}

const formSchema = z.object({
  problem: z.string().min(10, { message: 'Please enter a word problem.' }),
});

export function WordProblemSolver({ onSolve }: WordProblemSolverProps) {
  const [solution, setSolution] = useState<SolveWordProblemOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { problem: '' },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setSolution(null);
    setError(null);
    try {
      const response = await solveWordProblem({ problem: values.problem });
      setSolution(response);
      onSolve({ type: 'word-problem', expression: values.problem, result: String(response.result) });
    } catch (e: any) {
      setError(e.message || 'Failed to solve the word problem. Please try rephrasing it.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center"><BookText className="w-6 h-6 mr-2 text-primary" />AI Word Problem Solver</CardTitle>
        <CardDescription>
          Type in a math word problem, and the AI will identify the formula, show the steps, and find the solution.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="problem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Word Problem</FormLabel>
                  <FormControl>
                    <Textarea 
                        placeholder="e.g., A car travels at 60 mph for 3 hours. How far does it travel?" 
                        {...field}
                        rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-start space-y-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Solve Problem
            </Button>
            {solution && (
              <Card className="w-full bg-muted/50 border-border">
                <CardHeader>
                  <CardTitle>Solution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center"><FlaskConical className="w-4 h-4 mr-2" />Formula:</h4>
                    <p className="font-mono text-sm p-3 bg-background rounded-md">{solution.formula}</p>
                  </div>
                  <Separator />
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
                    <h4 className="font-semibold mb-2">Final Answer:</h4>
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
