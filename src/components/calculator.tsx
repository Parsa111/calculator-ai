
"use client";

import { useState } from 'react';
import { evaluate } from 'mathjs';
import type { HistoryEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Delete, Percent, Divide, X, Minus, Plus, SquareRadical, Superscript } from 'lucide-react';

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

  const renderKey = (key: any, index: number, grid: string) => {
    const isObject = typeof key === 'object' && key !== null;
    const label = isObject ? key.label : key;
    const action = isObject ? key.action : () => handlePress(key);
    let className = isObject ? key.className : '';
    
    // Generate a more robust key
    const keyString = isObject ? key.key : key;
    const uniqueKey = `${grid}-${index}-${keyString}`;

    if (grid === 'basic' && keyString === '0') {
        className = `${className} col-span-2`;
    }
     if (grid === 'basic' && keyString === '=') {
        className = `${className} col-span-2`;
    }
    
    return (
      <Button
        key={uniqueKey}
        variant="secondary"
        className={`h-12 sm:h-14 text-xl sm:text-2xl ${className}`}
        onClick={action}
      >
        {label}
      </Button>
    );
  }
  
  const topRowKeys = [
     { label: 'C', action: handleClear, className: 'bg-destructive/80 hover:bg-destructive text-destructive-foreground', key: 'C' },
     { label: <Delete />, action: handleBackspace, key: 'del' },
     { label: '%', action: () => handlePress('%'), key: '%' },
  ];
  
  const operatorKeys = [
    { label: <Divide />, action: () => handlePress('/'), key: '/' },
    { label: <X />, action: () => handlePress('x'), key: 'x' },
    { label: <Minus />, action: () => handlePress('-'), key: '-' },
    { label: <Plus />, action: () => handlePress('+'), key: '+' },
  ];
  
  const equalsKey = { label: '=', action: handleCalculate, className: 'bg-primary hover:bg-primary/90 text-primary-foreground col-span-2', key: '=' };

  const scientificGrid = [
    // Row 1
    {label: 'sin', action: () => handlePress('sin('), key: 'sin'}, 
    {label: 'cos', action: () => handlePress('cos('), key: 'cos'}, 
    {label: 'tan', action: () => handlePress('tan('), key: 'tan'},
    topRowKeys[0], // C
    topRowKeys[1], // DEL
    // Row 2
    {label: 'ln', action: () => handlePress('log('), key: 'ln'}, 
    {label: 'log10', action: () => handlePress('log10('), key: 'log10'},
    {label: '(', action: () => handlePress('('), key: '('}, 
    {label: ')', action: () => handlePress(')'), key: ')'}, 
    topRowKeys[2], // %
    // Row 3
    '7', '8', '9',
    {label: <SquareRadical />, action: () => handlePress('sqrt('), key: 'sqrt'}, 
    operatorKeys[0], // Divide
    // Row 4
    '4', '5', '6', 
    {label: <Superscript />, action: () => handlePress('^'), key: 'pow'}, 
    operatorKeys[1], // Multiply
    // Row 5
    '1', '2', '3',
    {label: '!', action: () => handlePress('!'), key: '!'}, 
    operatorKeys[2], // Subtract
    // Row 6
    '0', '.',
    {label: 'pi', action: () => handlePress('pi'), key: 'pi'}, 
    {label: 'e', action: () => handlePress('e'), key: 'e'}, 
    operatorKeys[3], // Add
  ];

  const basicGrid = [
      ...topRowKeys, operatorKeys[0], // C, DEL, %, /
      '7', '8', '9', operatorKeys[1], // 7, 8, 9, x
      '4', '5', '6', operatorKeys[2], // 4, 5, 6, -
      '1', '2', '3', operatorKeys[3], // 1, 2, 3, +
      '0', '.', { label: '=', action: handleCalculate, className: 'bg-primary hover:bg-primary/90 text-primary-foreground', key: '=' }
  ];

  return (
    <Card className="shadow-lg">
      <CardContent className="p-2 sm:p-4 space-y-2 sm:space-y-4">
        <CalculatorDisplay value={input} />
        
        <Tabs defaultValue="scientific">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scientific">Scientific</TabsTrigger>
            <TabsTrigger value="basic">Basic</TabsTrigger>
          </TabsList>
          <TabsContent value="scientific" className="mt-4">
             <div className="grid grid-cols-5 gap-2">
                {scientificGrid.map((k, i) => renderKey(k, i, 'sci'))}
                {renderKey(equalsKey, 99, 'sci-eq')}
            </div>
          </TabsContent>
          <TabsContent value="basic" className="mt-4">
             <div className="grid grid-cols-4 gap-2">
                {basicGrid.map((k,i) => renderKey(k, i, 'basic'))}
             </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
