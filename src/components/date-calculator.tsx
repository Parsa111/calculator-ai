"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, differenceInDays, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, addYears, subYears } from 'date-fns';
import type { HistoryEntry } from '@/lib/types';
import { calculateDate } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Textarea } from './ui/textarea';

interface DateCalculatorProps {
  onCalculate: (entry: Omit<HistoryEntry, 'id'>) => void;
}

const durationSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
});

const addSubtractSchema = z.object({
    baseDate: z.date(),
    direction: z.enum(['add', 'subtract']),
    days: z.coerce.number().optional(),
    weeks: z.coerce.number().optional(),
    months: z.coerce.number().optional(),
    years: z.coerce.number().optional(),
});

const naturalLanguageSchema = z.object({
    query: z.string().min(1, "Please enter a query."),
});

export function DateCalculator({ onCalculate }: DateCalculatorProps) {
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const durationForm = useForm<z.infer<typeof durationSchema>>({
    resolver: zodResolver(durationSchema),
    defaultValues: { startDate: new Date(), endDate: addDays(new Date(), 7) },
  });

  const addSubtractForm = useForm<z.infer<typeof addSubtractSchema>>({
    resolver: zodResolver(addSubtractSchema),
    defaultValues: { baseDate: new Date(), direction: 'add', days: 0, weeks: 0, months: 0, years: 0 },
  });

  const naturalLanguageForm = useForm<z.infer<typeof naturalLanguageSchema>>({
    resolver: zodResolver(naturalLanguageSchema),
    defaultValues: { query: "" },
  });

  const handleDurationSubmit = (values: z.infer<typeof durationSchema>) => {
    const days = differenceInDays(values.endDate, values.startDate);
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    const resultString = `${days} days total (${weeks} weeks and ${remainingDays} days)`;
    setResult(resultString);
    onCalculate({
      type: 'date',
      expression: `Duration between ${format(values.startDate, 'PPP')} and ${format(values.endDate, 'PPP')}`,
      result: resultString,
    });
  };
  
  const handleAddSubtractSubmit = (values: z.infer<typeof addSubtractSchema>) => {
    let date = values.baseDate;
    const { direction, days, weeks, months, years } = values;
    const op = direction === 'add' ? 1 : -1;
    
    if (years) date = addYears(date, op * years);
    if (months) date = addMonths(date, op * months);
    if (weeks) date = addWeeks(date, op * weeks);
    if (days) date = addDays(date, op * days);

    const resultString = format(date, 'PPPP');
    setResult(resultString);
    onCalculate({
      type: 'date',
      expression: `${format(values.baseDate, 'PPP')} ${direction === 'add' ? '+' : '-'} ${years || 0}y ${months || 0}m ${weeks || 0}w ${days || 0}d`,
      result: resultString,
    });
  };

  const handleNaturalLanguageSubmit = async (values: z.infer<typeof naturalLanguageSchema>) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await calculateDate({ query: values.query });
      setResult(response.result);
      onCalculate({ type: 'date', expression: values.query, result: response.result });
    } catch (e: any) {
      setError(e.message || 'Failed to calculate date. Please try a different query.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center"><Clock className="w-6 h-6 mr-2 text-primary" />Date &amp; Time Calculator</CardTitle>
        <CardDescription>Calculate durations, add/subtract dates, or use natural language.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="duration">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="duration">Duration</TabsTrigger>
            <TabsTrigger value="add-subtract">Add/Subtract</TabsTrigger>
            <TabsTrigger value="natural-language">AI Query</TabsTrigger>
          </TabsList>

          <TabsContent value="duration" className="mt-4">
            <Form {...durationForm}>
                <form onSubmit={durationForm.handleSubmit(handleDurationSubmit)} className="space-y-4">
                    <FormField control={durationForm.control} name="startDate" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel><Popover><PopoverTrigger asChild>
                        <FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl>
                        </PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>
                    )}/>
                    <FormField control={durationForm.control} name="endDate" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>End Date</FormLabel><Popover><PopoverTrigger asChild>
                        <FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl>
                        </PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>
                    )}/>
                    <Button type="submit">Calculate Duration</Button>
                </form>
            </Form>
          </TabsContent>

          <TabsContent value="add-subtract" className="mt-4">
             <Form {...addSubtractForm}>
                <form onSubmit={addSubtractForm.handleSubmit(handleAddSubtractSubmit)} className="space-y-4">
                    <FormField control={addSubtractForm.control} name="baseDate" render={({ field }) => (
                         <FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel><Popover><PopoverTrigger asChild>
                         <FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                             {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl>
                         </PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                    )}/>
                    <FormField control={addSubtractForm.control} name="direction" render={({ field }) => (
                        <FormItem><FormLabel>Operation</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="add" id="add" /></FormControl><FormLabel htmlFor="add">Add</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="subtract" id="subtract" /></FormControl><FormLabel htmlFor="subtract">Subtract</FormLabel></FormItem>
                        </RadioGroup></FormControl></FormItem>
                    )}/>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormField control={addSubtractForm.control} name="years" render={({ field }) => (<FormItem><FormLabel>Years</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                        <FormField control={addSubtractForm.control} name="months" render={({ field }) => (<FormItem><FormLabel>Months</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                        <FormField control={addSubtractForm.control} name="weeks" render={({ field }) => (<FormItem><FormLabel>Weeks</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                        <FormField control={addSubtractForm.control} name="days" render={({ field }) => (<FormItem><FormLabel>Days</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                    </div>
                    <Button type="submit">Calculate Date</Button>
                </form>
             </Form>
          </TabsContent>
          
          <TabsContent value="natural-language" className="mt-4">
            <Form {...naturalLanguageForm}>
                <form onSubmit={naturalLanguageForm.handleSubmit(handleNaturalLanguageSubmit)} className="space-y-4">
                    <FormField control={naturalLanguageForm.control} name="query" render={({ field }) => (
                        <FormItem><FormLabel>AI Query</FormLabel><FormControl>
                            <Textarea placeholder="e.g., How many days until Christmas?" {...field} />
                        </FormControl><FormMessage /></FormItem>
                    )}/>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Ask AI
                    </Button>
                </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex-col items-start space-y-4">
        {(result || error) && (
            <Card className="w-full bg-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle>Result</CardTitle>
                {result && <CardDescription className="text-2xl font-semibold text-primary">{result}</CardDescription>}
                {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              </CardHeader>
            </Card>
        )}
      </CardFooter>
    </Card>
  );
}
