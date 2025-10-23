
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
    '7', '8', '9', 
    '4', '5', '6', 
    '1', '2', '3', 
    '0', '.', { label: <Plus />, action: () => handlePress('+') },
  ];
  
  const operatorKeys = [
    { label: <Divide />, action: () => handlePress('/') },
    { label: <X />, action: () => handlePress('x') },
    { label: <Minus />, action: () => handlePress('-') },
     { label: '=', action: handleCalculate, className: 'row-span-2 bg-primary hover:bg-primary/90 text-primary-foreground h-full' },
  ]

  const advancedKeys = [
    { label: 'sin', action: () => handlePress('sin(') },
    { label: 'cos', action: () => handlePress('cos(') },
    { label: 'tan', action: () => handlePress('tan(') },
    { label: <SquareRadical />, action: () => handlePress('sqrt(') },
    { label: <Superscript />, action: () => handlePress('^') },
    { label: 'log', action: () => handlePress('log10(') },
    { label: 'ln', action: () => handlePress('log(') },
    { label: 'π', action: () => handlePress('pi') },
    { label: 'e', action: () => handlePress('e') },
    { label: '(', action: () => handlePress('(') },
    { label: ')', action: () => handlePress(')') },
    { label: '!', action: () => handlePress('!') },
  ];
  
  const topRowKeys = [
     { label: 'C', action: handleClear, className: 'bg-destructive/80 hover:bg-destructive text-destructive-foreground' },
     { label: <Delete />, action: handleBackspace },
     { label: '%', action: () => handlePress('%') },
  ]

  const renderKey = (key: any, index: number, grid?: string) => {
    const isObject = typeof key === 'object' && key !== null;
    const label = isObject ? key.label : key;
    const action = isObject ? key.action : () => handlePress(key);
    const className = isObject ? key.className : '';

    return (
      <Button
        key={`${grid}-${index}`}
        variant="secondary"
        className={`h-12 sm:h-14 text-xl sm:text-2xl ${className}`}
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
        
        <Tabs defaultValue="scientific">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scientific">Scientific</TabsTrigger>
            <TabsTrigger value="basic">Basic</TabsTrigger>
          </TabsList>
          <TabsContent value="scientific" className="mt-4">
            <div className="grid grid-cols-5 gap-2">
              {topRowKeys.map((k, i) => renderKey(k, i, 'top-sci'))}
              {renderKey(operatorKeys[0], 0, 'op-sci')}
              
              {advancedKeys.slice(0, 4).map((k, i) => renderKey(k, i, 'adv-1'))}
              {renderKey(advancedKeys[4], 4, 'adv-1')}
              
              {advancedKeys.slice(5, 9).map((k, i) => renderKey(k, i + 5, 'adv-2'))}
              {renderKey(operatorKeys[1], 1, 'op-sci')}

              {advancedKeys.slice(9, 12).map((k, i) => renderKey(k, i + 9, 'adv-3'))}
              {renderKey(basicKeys[0], 0, 'basic-sci')}
              {renderKey(operatorKeys[2], 2, 'op-sci')}

              {renderKey(basicKeys[1], 1, 'basic-sci')}
              {renderKey(basicKeys[2], 2, 'basic-sci')}
              {renderKey(basicKeys[3], 3, 'basic-sci')}
              {renderKey(basicKeys[4], 4, 'basic-sci')}
              
              <div className="row-span-2">
                {renderKey(operatorKeys[3], 3, 'op-sci')}
              </div>
              
              {renderKey(basicKeys[5], 5, 'basic-sci')}
              {renderKey(basicKeys[6], 6, 'basic-sci')}
              {renderKey(basicKeys[7], 7, 'basic-sci')}
              {renderKey(basicKeys[8], 8, 'basic-sci')}

              <div className="col-span-2">
                {renderKey(basicKeys[9], 9, 'basic-sci')}
              </div>
              {renderKey(basicKeys[10], 10, 'basic-sci')}
              {renderKey(basicKeys[11], 11, 'basic-sci')}
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

              <div className="row-span-2">
                {renderKey(operatorKeys[3], 3, 'op-basic-eq')}
              </div>
              
              <div className="grid grid-cols-3 col-span-3 gap-2">
                <div className="col-span-2">
                    {renderKey(basicKeys[9], 9, 'basic-basic-4')}
                </div>
                <div className="grid grid-cols-2 col-span-2 gap-2">
                    {basicKeys.slice(10).map((k, i) => renderKey(k, i + 10, 'basic-basic-5'))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
