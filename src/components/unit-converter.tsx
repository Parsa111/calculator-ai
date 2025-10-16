"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { HistoryEntry } from '@/lib/types';
import { convertUnitsFromNaturalLanguage } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Ruler } from 'lucide-react';

interface UnitConverterProps {
  onConvert: (entry: Omit<HistoryEntry, 'id'>) => void;
}

const formSchema = z.object({
  query: z.string().min(3, { message: 'Query must be at least 3 characters.' }),
});

export function UnitConverter({ onConvert }: UnitConverterProps) {
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { query: '' },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await convertUnitsFromNaturalLanguage({ query: values.query });
      const conversionResult = response.result;
      setResult(conversionResult);
      onConvert({ type: 'unit', expression: values.query, result: conversionResult });
    } catch (e: any) {
      setError('Failed to perform conversion. Please try a different query.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center"><Ruler className="w-6 h-6 mr-2 text-primary" />Unit Converter</CardTitle>
        <CardDescription>
          Convert units using natural language. Try "100km to miles" or "5ft 10in in cm".
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your query</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2.5 gallons to liters" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-start space-y-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Convert
            </Button>
            {result && (
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
