
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
import { Loader2, Ruler, ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UnitConverterProps {
  onConvert: (entry: Omit<HistoryEntry, 'id'>) => void;
}

const unitTypes = {
  Length: ['meters', 'kilometers', 'miles', 'feet', 'inches', 'centimeters'],
  Mass: ['kilograms', 'grams', 'pounds', 'ounces'],
  Volume: ['liters', 'milliliters', 'gallons', 'pints'],
  Temperature: ['celsius', 'fahrenheit', 'kelvin'],
  Time: ['seconds', 'minutes', 'hours', 'days'],
};

const formSchema = z.object({
  value: z.coerce.number({ invalid_type_error: 'Please enter a valid number.' }),
  fromUnit: z.string(),
  toUnit: z.string(),
  unitType: z.string(),
});

export function UnitConverter({ onConvert }: UnitConverterProps) {
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnitType, setSelectedUnitType] = useState('Length');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { value: 1, unitType: 'Length', fromUnit: 'meters', toUnit: 'feet' },
  });

  const availableUnits = unitTypes[selectedUnitType as keyof typeof unitTypes] || [];

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const query = `${values.value} ${values.fromUnit} to ${values.toUnit}`;
      const response = await convertUnitsFromNaturalLanguage({ query });
      const conversionResult = response.result;
      setResult(conversionResult);
      onConvert({ type: 'unit', expression: query, result: conversionResult });
    } catch (e: any) {
      setError('Failed to perform conversion. Please try a different query.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUnitTypeChange = (type: string) => {
    setSelectedUnitType(type);
    const newUnits = unitTypes[type as keyof typeof unitTypes];
    if (newUnits && newUnits.length > 1) {
        form.setValue('fromUnit', newUnits[0]);
        form.setValue('toUnit', newUnits[1]);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center"><Ruler className="w-6 h-6 mr-2 text-primary" />Unit Converter</CardTitle>
        <CardDescription>
          Select a unit type, then enter a value to convert between units.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="unitType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Type</FormLabel>
                  <Select onValueChange={(value) => { field.onChange(value); handleUnitTypeChange(value); }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a unit type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.keys(unitTypes).map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fromUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="From" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableUnits.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="toUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="To" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableUnits.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

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

    