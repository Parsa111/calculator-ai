
"use client";

import { useState } from 'react';
import type { HistoryEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Calculator } from '@/components/calculator';
import { UnitConverter } from '@/components/unit-converter';
import { FormulaSolver } from '@/components/formula-solver';
import { FormulaDrawer } from '@/components/formula-drawer';
import { GraphingCalculator } from '@/components/graphing-calculator';
import { WordProblemSolver } from '@/components/word-problem-solver';
import { FinancialCalculators } from '@/components/financial-calculators';
import { DateCalculator } from '@/components/date-calculator';
import { HistoryPanel } from '@/components/history-panel';
import { Calculator as CalculatorIcon, FlaskConical, Pencil, Ruler, LineChart, BookText, Landmark, Menu, Clock } from 'lucide-react';

const navItems = [
  { value: 'calculator', label: 'Calculator', icon: CalculatorIcon },
  { value: 'date', label: 'Date', icon: Clock },
  { value: 'unit-converter', label: 'Units', icon: Ruler },
  { value: 'formula-solver', label: 'Formulas', icon: FlaskConical },
  { value: 'formula-drawer', label: 'Draw', icon: Pencil },
  { value: 'graphing-calculator', label: 'Graph', icon: LineChart },
  { value: 'word-problem', label: 'Word Problem', icon: BookText },
  { value: 'financial', label: 'Financial', icon: Landmark },
];

export function CalcAiApp() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyCounter, setHistoryCounter] = useState(0);
  const [activeTab, setActiveTab] = useState('calculator');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  
  const currentTabLabel = navItems.find(item => item.value === activeTab)?.label || 'Calculator';

  return (
    <div className="flex flex-col space-y-4 sm:space-y-6">
      <header className="text-center pt-4">
        <h1 className="text-3xl sm:text-5xl font-bold text-primary tracking-tight">
          CalcAI
        </h1>
        <p className="mt-2 text-md sm:text-lg text-muted-foreground">
          Your intelligent partner for all calculations.
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="md:hidden flex justify-between items-center mb-4 px-1">
                <span className="font-semibold text-lg">{currentTabLabel}</span>
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Open Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[280px]">
                        <SheetHeader>
                            <SheetTitle className="text-2xl text-primary">CalcAI Modes</SheetTitle>
                        </SheetHeader>
                        <nav className="mt-8 flex flex-col space-y-2">
                            {navItems.map(item => (
                                <Button
                                    key={item.value}
                                    variant={activeTab === item.value ? 'default' : 'ghost'}
                                    className="justify-start text-md p-4 h-auto"
                                    onClick={() => {
                                        setActiveTab(item.value);
                                        setMobileMenuOpen(false);
                                    }}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.label}
                                </Button>
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
            
            <div className="hidden md:block">
              <div className="flex flex-wrap justify-start -m-1">
                  {navItems.map(item => (
                      <Button
                          key={item.value}
                          variant={activeTab === item.value ? 'default' : 'secondary'}
                          onClick={() => setActiveTab(item.value)}
                          className="m-1"
                      >
                          <item.icon className="w-4 h-4 mr-2" />
                          {item.label}
                      </Button>
                  ))}
              </div>
            </div>

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
            <TabsContent value="graphing-calculator" className="mt-4">
              <GraphingCalculator onCalculate={addToHistory} />
            </TabsContent>
            <TabsContent value="word-problem" className="mt-4">
                <WordProblemSolver onSolve={addToHistory} />
            </TabsContent>
            <TabsContent value="financial" className="mt-4">
                <FinancialCalculators onCalculate={addToHistory} />
            </TabsContent>
            <TabsContent value="date" className="mt-4">
                <DateCalculator onCalculate={addToHistory} />
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
