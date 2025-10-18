"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { evaluate, parse } from 'mathjs';
import type { HistoryEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LineChart as RechartsLineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer } from 'recharts';
import { LineChart } from 'lucide-react';

interface GraphingCalculatorProps {
  onCalculate: (entry: Omit<HistoryEntry, 'id'>) => void;
}

const formSchema = z.object({
  equation: z.string().min(1, { message: "Please enter an equation." }),
});

type ChartData = {
  x: number;
  y: number;
}[];

export function GraphingCalculator({ onCalculate }: GraphingCalculatorProps) {
  const [data, setData] = useState<ChartData>([]);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { equation: '' },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setError(null);
    setData([]);
    try {
      const equation = values.equation.includes('=') ? values.equation.split('=')[1].trim() : values.equation;
      const node = parse(equation);
      const compiled = node.compile();
      
      const newChartData: ChartData = [];
      for (let i = -10; i <= 10; i += 0.5) {
        const y = compiled.evaluate({ x: i });
        if (typeof y === 'number' && isFinite(y)) {
          newChartData.push({ x: i, y });
        }
      }

      if (newChartData.length === 0) {
        throw new Error("Could not generate any data points. Check your equation.");
      }

      setData(newChartData);
      onCalculate({
        type: 'calc',
        expression: `Graph: ${values.equation}`,
        result: 'Plotted'
      });

    } catch (e: any) {
      setError(`Failed to plot equation. ${e.message}`);
      console.error(e);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center"><LineChart className="w-6 h-6 mr-2 text-primary" />Graphing Calculator</CardTitle>
        <CardDescription>
          Enter an equation in terms of x to plot it. For example, `y = x^2` or simply `x^2`.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="equation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equation</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., x^3 - 2*x" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {data.length > 0 && (
              <div className="w-full h-80 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="x" type="number" domain={['dataMin', 'dataMax']} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="y" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-start space-y-4">
            <Button type="submit">
              Plot Graph
            </Button>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}