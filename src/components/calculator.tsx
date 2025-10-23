
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
    { label: '=', action: handleCalculate, className: 'row-span-2 bg-primary hover:bg-primary/90 text-primary-foreground h-full' },
  ];

  const basicKeys = [
    '7', '8', '9', 
    '4', '5', '6', 
    '1', '2', '3', 
    '0', '.',
  ];

  const advancedKeys = [
    'sin', 'cos', 'tan', '(', ')',
    'ln', 'log10', <SquareRadical />, '^', '!',
    'π', 'e', 
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
              {/* Row 1 */}
              {renderKey({ label: advancedKeys[0], action: () => handlePress('sin(') }, 'adv-sin')}
              {renderKey({ label: advancedKeys[1], action: () => handlePress('cos(') }, 'adv-cos')}
              {renderKey({ label: advancedKeys[2], action: () => handlePress('tan(') }, 'adv-tan')}
              {renderKey({ label: advancedKeys[3], action: () => handlePress('(') }, 'adv-paren-open')}
              {renderKey({ label: advancedKeys[4], action: () => handlePress(')') }, 'adv-paren-close')}

              {/* Row 2 */}
              {renderKey({ label: advancedKeys[5], action: () => handlePress('log(') }, 'adv-ln')}
              {renderKey({ label: advancedKeys[6], action: () => handlePress('log10(') }, 'adv-log10')}
              {topRowKeys.map((k, i) => renderKey(k, i, 'top-sci'))}
              {renderKey(operatorKeys[0], 0, 'op-sci')}
              
              {/* Row 3 */}
              {renderKey({ label: advancedKeys[7], action: () => handlePress('sqrt(') }, 'adv-sqrt')}
              {basicKeys.slice(0, 3).map((k, i) => renderKey(k, i, 'basic-sci-1'))}
              {renderKey(operatorKeys[1], 1, 'op-sci')}

              {/* Row 4 */}
              {renderKey({ label: advancedKeys[8], action: () => handlePress('^') }, 'adv-pow')}
              {basicKeys.slice(3, 6).map((k, i) => renderKey(k, i, 'basic-sci-2'))}
              {renderKey(operatorKeys[2], 2, 'op-sci')}

              {/* Row 5 */}
              {renderKey({ label: advancedKeys[9], action: () => handlePress('!') }, 'adv-fact')}
              {basicKeys.slice(6, 9).map((k, i) => renderKey(k, i, 'basic-sci-3'))}
              {renderKey(operatorKeys[3], 3, 'op-sci')}

              {/* Row 6 */}
              {renderKey({ label: advancedKeys[10], action: () => handlePress('pi') }, 'adv-pi')}
              {renderKey({ label: advancedKeys[11], action: () => handlePress('e') }, 'adv-e')}
              {renderKey(basicKeys[9], 9, 'basic-sci-4')}
              {renderKey(basicKeys[10], 10, 'basic-sci-5')}
              {renderKey(operatorKeys[4], 4, 'op-sci-eq')}
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
              
              {renderKey(basicKeys[9], 9, 'basic-basic-4', {className: "col-span-2"})}
              {renderKey(basicKeys[10], 10, 'basic-basic-5')}
              {renderKey(operatorKeys[4], 4, 'op-basic-eq')}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
