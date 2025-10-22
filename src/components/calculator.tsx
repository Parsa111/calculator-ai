"use client";

import { useState } from 'react';
import { evaluate } from 'mathjs';
import type { HistoryEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CornerDownLeft, Delete, Percent, Divide, X, Minus, Plus, SquareRadical, Superscript } from 'lucide-react';

interface CalculatorProps {
  onCalculate: (entry: Omit<HistoryEntry, 'id'>) => void;
}

const CalculatorDisplay = ({ value }: { value: string }) => (
  <div className="bg-background/80 rounded-lg p-4 text-right break-all">
    <span className="text-3xl sm:text-4xl font-mono text-foreground">{value || '0'}</span>
  </div>
);

export function Calculator({ onCalculate }: CalculatorProps) {
  const [input, setInput] = useState('');

  const handlePress = (value: string) => {
    setInput(prev => prev + value);
  };

  const handleClear = () => {
    setInput('');
  };

  const handleBackspace = () => {
    setInput(prev => prev.slice(0, -1));
  };

  const handleCalculate = () => {
    if (!input) return;
    try {
      // Replace x with * for evaluation
      const expression = input.replace(/x/g, '*').replace(/%/g, '/100');
      let result = evaluate(expression);
      result = parseFloat(result.toPrecision(10)); // To handle floating point inaccuracies
      onCalculate({ type: 'calc', expression: input, result: String(result) });
      setInput(String(result));
    } catch (error) {
      setInput('Error');
    }
  };

  const basicKeys = [
    { label: 'C', action: handleClear, className: 'bg-destructive/80 hover:bg-destructive text-destructive-foreground' },
    { label: <Delete />, action: handleBackspace },
    { label: '%', action: () => handlePress('%') },
    { label: <Divide />, action: () => handlePress('/') },
    '7', '8', '9', { label: <X />, action: () => handlePress('x') },
    '4', '5', '6', { label: <Minus />, action: () => handlePress('-') },
    '1', '2', '3', { label: <Plus />, action: () => handlePress('+') },
    '0', '.', { label: '=', action: handleCalculate, className: 'col-span-2 bg-primary hover:bg-primary/90 text-primary-foreground' },
  ];
  
  const advancedKeys = [
    { label: 'sin', action: () => handlePress('sin(') },
    { label: 'cos', action: () => handlePress('cos(') },
    { label: 'tan', action: () => handlePress('tan(') },
    { label: 'log', action: () => handlePress('log10(') },
    { label: 'ln', action: () => handlePress('log(') },
    { label: <SquareRadical />, action: () => handlePress('sqrt(') },
    { label: <Superscript />, action: () => handlePress('^') },
    { label: 'π', action: () => handlePress('pi') },
    { label: '(', action: () => handlePress('(') },
    { label: ')', action: () => handlePress(')') },
  ];

  const renderKey = (key: any, index: number) => {
    const isObject = typeof key === 'object' && key !== null;
    const label = isObject ? key.label : key;
    const action = isObject ? key.action : () => handlePress(key);
    const className = isObject ? key.className : '';

    return (
      <Button
        key={index}
        variant="secondary"
        className={`h-14 sm:h-16 text-xl sm:text-2xl ${className}`}
        onClick={action}
      >
        {label}
      </Button>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="p-2 sm:p-4 space-y-2 sm:space-y-4">
        <CalculatorDisplay value={input} />
        <div className="grid grid-cols-4 gap-2">
            {basicKeys.map(renderKey)}
        </div>
        <div className="grid grid-cols-5 gap-2">
            {advancedKeys.map(renderKey)}
        </div>
      </CardContent>
    </Card>
  );
}
