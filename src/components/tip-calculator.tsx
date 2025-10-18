"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { HistoryEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

interface TipCalculatorProps {
  onCalculate: (entry: Omit<HistoryEntry, 'id'>) => void;
}

const formSchema = z.object({
  bill: z.coerce.number().min(0, { message: 'Bill must be positive.' }),
  tipPercent: z.number().min(0).max(100),
  people: z.coerce.number().int().min(1, { message: 'Must be at least 1 person.' }),
});

export function TipCalculator({ onCalculate }: TipCalculatorProps) {
  const [result, setResult] = useState<{ tipAmount: number; total: number; perPerson: number } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { bill: 0, tipPercent: 18, people: 1 },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const tipAmount = values.bill * (values.tipPercent / 100);
    const total = values.bill + tipAmount;
    const perPerson = total / values.people;

    const formattedResult = {
        tipAmount: parseFloat(tipAmount.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        perPerson: parseFloat(perPerson.toFixed(2)),
    };

    setResult(formattedResult);
    onCalculate({
      type: 'financial',
      expression: `Tip for $${values.bill} at ${values.tipPercent}% for ${values.people} people`,
      result: `Total: $${formattedResult.total}`,
    });
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>Tip Calculator</CardTitle>
        <CardDescription>Calculate tips and split the bill with ease.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="bill"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bill Amount ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 50.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tipPercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tip Percentage ({field.value}%)</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                  <div className="flex justify-between mt-2">
                    {[15, 18, 20, 25].map(p => (
                        <Button key={p} type="button" size="sm" variant="outline" onClick={() => field.onChange(p)}>{p}%</Button>
                    ))}
                  </div>
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="people"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Split Between</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col items-start space-y-4">
            <Button type="submit">Calculate</Button>
            {result && (
              <Card className="w-full bg-muted/50 p-4 space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tip Amount</span>
                    <span className="font-semibold">${result.tipAmount.toFixed(2)}</span>
                 </div>
                 <Separator />
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Bill</span>
                    <span className="font-semibold">${result.total.toFixed(2)}</span>
                 </div>
                 {form.getValues('people') > 1 && (
                    <>
                        <Separator />
                        <div className="flex justify-between items-center text-primary">
                            <span className="font-bold">Amount Per Person</span>
                            <span className="font-bold text-lg">${result.perPerson.toFixed(2)}</span>
                        </div>
                    </>
                 )}
              </Card>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
