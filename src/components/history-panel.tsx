"use client";

import type { HistoryEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Trash2, History } from 'lucide-react';
import { Badge } from './ui/badge';

interface HistoryPanelProps {
  history: HistoryEntry[];
  onClear: () => void;
  onReuse: (entry: HistoryEntry) => void;
}

const typeBadgeVariant = {
  calc: 'secondary',
  unit: 'default',
  formula: 'outline',
  draw: 'destructive',
  graph: 'default',
  'word-problem': 'default',
  financial: 'default',
  date: 'default',
} as const;

export function HistoryPanel({ history, onClear, onReuse }: HistoryPanelProps) {
  return (
    <Card className="h-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="w-6 h-6 mr-2 text-primary" />
          History
        </CardTitle>
        <CardDescription>Your recent calculations.</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] lg:h-[450px]">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <p className="text-sm text-muted-foreground">No calculations yet.</p>
              <p className="text-xs text-muted-foreground/80 mt-1">Perform a calculation to see it here.</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {history.map((entry) => (
                <div key={entry.id} className="p-3 rounded-md border bg-card hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onReuse(entry)}>
                  <div className="flex justify-between items-start">
                    <p className="text-xs text-muted-foreground break-all font-mono pr-2">{entry.expression}</p>
                    <Badge variant={typeBadgeVariant[entry.type] || 'secondary'} className="capitalize text-xs whitespace-nowrap">{entry.type.replace('-', ' ')}</Badge>
                  </div>
                  <p className="text-lg font-semibold text-primary break-all font-mono mt-1">= {entry.result}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      {history.length > 0 && (
        <>
          <Separator />
          <CardFooter className="p-4">
            <Button variant="outline" size="sm" className="w-full" onClick={onClear}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear History
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
