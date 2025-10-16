"use client";

import { useState } from 'react';
import type { HistoryEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator } from '@/components/calculator';
import { UnitConverter } from '@/components/unit-converter';
import { FormulaSolver } from '@/components/formula-solver';
import { FormulaDrawer } from '@/components/formula-drawer';
import { HistoryPanel } from '@/components/history-panel';
import { Calculator as CalculatorIcon, FlaskConical, Pencil, Ruler } from 'lucide-react';

export function CalcAiApp() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyCounter, setHistoryCounter] = useState(0);

  const addToHistory = (entry: Omit<HistoryEntry, 'id'>) => {
    setHistory(prev => [{ ...entry, id: historyCounter }, ...prev]);
    setHistoryCounter(c => c + 1);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const reuseHistoryEntry = (entry: HistoryEntry) => {
    // This is a placeholder for future functionality to reuse history entries.
    console.log("Reusing history entry:", entry);
  };

  return (
    <div className="flex flex-col space-y-8">
      <header className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary tracking-tight">
          CalcAI
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your intelligent partner for all calculations.
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
              <TabsTrigger value="calculator"><CalculatorIcon className="w-4 h-4 mr-2" />Calculator</TabsTrigger>
              <TabsTrigger value="unit-converter"><Ruler className="w-4 h-4 mr-2" />Units</TabsTrigger>
              <TabsTrigger value="formula-solver"><FlaskConical className="w-4 h-4 mr-2" />Formulas</TabsTrigger>
              <TabsTrigger value="formula-drawer"><Pencil className="w-4 h-4 mr-2" />Draw</TabsTrigger>
            </TabsList>
            <TabsContent value="calculator" className="mt-4">
              <Calculator onCalculate={addToHistory} />
            </TabsContent>
            <TabsContent value="unit-converter" className="mt-4">
              <UnitConverter onConvert={addToHistory} />
            </TabsContent>
            <TabsContent value="formula-solver" className="mt-4">
              <FormulaSolver onSolve={addToHistory} />
            </TabsContent>
            <TabsContent value="formula-drawer" className="mt-4">
              <FormulaDrawer onSolve={addToHistory} />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:col-span-1">
          <HistoryPanel 
            history={history} 
            onClear={clearHistory}
            onReuse={reuseHistoryEntry}
          />
        </div>
      </div>
    </div>
  );
}
