
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TipCalculator } from '@/components/tip-calculator';
import { LoanCalculator } from '@/components/loan-calculator';
import { CompoundInterestCalculator } from '@/components/compound-interest-calculator';
import { HandCoins, Landmark, PiggyBank, Receipt } from 'lucide-react';
import { HistoryEntry } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface FinancialCalculatorsProps {
  onCalculate: (entry: Omit<HistoryEntry, 'id'>) => void;
}

export function FinancialCalculators({ onCalculate }: FinancialCalculatorsProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center"><Landmark className="w-6 h-6 mr-2 text-primary" />Financial Calculators</CardTitle>
        <CardDescription>
          Tools for everyday financial planning and calculations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tip" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tip"><Receipt className="w-4 h-4 mr-2" />Tip</TabsTrigger>
                <TabsTrigger value="loan"><HandCoins className="w-4 h-4 mr-2" />Loan</TabsTrigger>
                <TabsTrigger value="interest"><PiggyBank className="w-4 h-4 mr-2" />Interest</TabsTrigger>
            </TabsList>
            <TabsContent value="tip" className="mt-4">
                <TipCalculator onCalculate={onCalculate} />
            </TabsContent>
            <TabsContent value="loan" className="mt-4">
                <LoanCalculator onCalculate={onCalculate} />
            </TabsContent>
            <TabsContent value="interest" className="mt-4">
                <CompoundInterestCalculator onCalculate={onCalculate} />
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
