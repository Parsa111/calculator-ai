
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

  const renderKey = (key: any, index?: number, grid?: string) => {
    const isObject = typeof key === 'object' && key !== null;
    const label = isObject ? key.label : key;
    const action = isObject ? key.action : () => handlePress(key);
    let className = isObject ? key.className : '';

    // Special handling for basic layout's double-width '0'
    if(grid === 'basic-basic-4' && label === '0') {
      className = `${className} col-span-2`;
    }
    
    return (
      <Button
        key={`${grid}-${index}-${label}`}
        variant="secondary"
        className={`h-12 sm:h-14 text-xl sm:text-2xl ${className}`}
        onClick={action}
      >
        {label}
      </Button>
    );
  }
  
  const topRowKeys = [
     { label: 'C', action: handleClear, className: 'bg-destructive/80 hover:bg-destructive text-destructive-foreground' },
     { label: <Delete />, action: handleBackspace },
     { label: '%', action: () => handlePress('%') },
  ];
  
  const operatorKeys = [
    { label: <Divide />, action: () => handlePress('/') },
    { label: <X />, action: () => handlePress('x') },
    { label: <Minus />, action: () => handlePress('-') },
    { label: <Plus />, action: () => handlePress('+') },
  ];
  
  const equalsKey = { label: '=', action: handleCalculate, className: 'row-span-2 bg-primary hover:bg-primary/90 text-primary-foreground h-full' };

  const basicKeys = [
    '7', '8', '9', 
    '4', '5', '6', 
    '1', '2', '3', 
    '0', '.',
  ];

  const advancedKeys = [
    'sin', 'cos', 'tan',
    'ln', 'log10',
    'sqrt', '^', '!',
    'pi', 'e', '(', ')',
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
                {/* Advanced Functions */}
                {renderKey({ label: 'sin', action: () => handlePress('sin(') })}
                {renderKey({ label: 'cos', action: () => handlePress('cos(') })}
                {renderKey({ label: 'tan', action: () => handlePress('tan(') })}
                {renderKey({ label: 'ln', action: () => handlePress('log(') })}
                {renderKey({ label: 'log10', action: () => handlePress('log10(') })}

                {/* Top Row */}
                {renderKey({ label: '(', action: () => handlePress('(') })}
                {renderKey({ label: ')', action: () => handlePress(')') })}
                {topRowKeys.map((k,i) => renderKey(k,i,'sci-top'))}
                
                {/* Numbers & Operators */}
                {renderKey({ label: <SquareRadical />, action: () => handlePress('sqrt(') })}
                {renderKey('7')}
                {renderKey('8')}
                {renderKey('9')}
                {renderKey({ label: <Divide />, action: () => handlePress('/') })}

                {renderKey({ label: <Superscript />, action: () => handlePress('^') })}
                {renderKey('4')}
                {renderKey('5')}
                {renderKey('6')}
                {renderKey({ label: <X />, action: () => handlePress('x') })}
                
                {renderKey({ label: '!', action: () => handlePress('!') })}
                {renderKey('1')}
                {renderKey('2')}
                {renderKey('3')}
                {renderKey({ label: <Minus />, action: () => handlePress('-') })}

                {renderKey('pi')}
                {renderKey('e')}
                {renderKey('0')}
                {renderKey('.')}
                {renderKey({ label: <Plus />, action: () => handlePress('+') })}
            </div>
          </TabsContent>
          <TabsContent value="basic" className="mt-4">
             <div className="grid grid-cols-4 gap-2">
              {topRowKeys.map((k, i) => renderKey(k, i, 'top-basic'))}
              {renderKey(operatorKeys[0], 0, 'op-basic')}

              {basicKeys.slice(0, 3).map((k, i) => renderKey(k, i, 'basic-basic-1'))}
              {renderKey(operatorKeys[1], 1, 'op-basic')}

              {basicKeys.slice(3, 6).map((k, i) => renderKey(k, i + 3, 'basic-basic-2'))}
              {renderKey(operatorKeys[2], 2, 'op-basic')}
              
              {basicKeys.slice(6, 9).map((k, i) => renderKey(k, i + 6, 'basic-basic-3'))}
              {renderKey(operatorKeys[3], 3, 'op-basic')}
              
              {renderKey(basicKeys[9], 9, 'basic-basic-4')}
              {renderKey(basicKeys[10], 10, 'basic-basic-5')}
              {renderKey({ label: '=', action: handleCalculate, className: 'bg-primary hover:bg-primary/90 text-primary-foreground'}, 4, 'op-basic-eq')}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
