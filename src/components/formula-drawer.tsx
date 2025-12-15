
"use client";

import { useState, useRef } from 'react';
import type { HistoryEntry } from '@/lib/types';
import { calculateFromDrawnFormula } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DrawingCanvas, { type DrawingCanvasHandles } from './drawing-canvas';
import { evaluate } from 'mathjs';

interface FormulaDrawerProps {
  onSolve: (entry: Omit<HistoryEntry, 'id'>) => void;
}

export function FormulaDrawer({ onSolve }: FormulaDrawerProps) {
  const [result, setResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [variables, setVariables] = useState('');
  const [textFormula, setTextFormula] = useState('');
  const { toast } = useToast();
  const canvasRef = useRef<DrawingCanvasHandles>(null);

  const handleClear = () => {
    canvasRef.current?.clear();
    setResult(null);
    setTextFormula('');
    setVariables('');
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setResult(null);

    if (textFormula) {
      try {
        const calculatedResult = evaluate(textFormula);
        setResult(calculatedResult);
        onSolve({ type: 'calc', expression: textFormula, result: String(calculatedResult) });
      } catch (e: any) {
        toast({
          variant: 'destructive',
          title: 'Calculation Error',
          description: `Could not evaluate "${textFormula}". Please check the syntax.`,
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const canvas = canvasRef.current?.getCanvas();
    if (!canvas) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Canvas not found.',
      });
      setIsLoading(false);
      return;
    }
    
    // Check if canvas is empty
    const context = canvas.getContext('2d');
    if (context) {
        const pixelBuffer = new Uint32Array(
            context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
        );
        const isCanvasEmpty = !pixelBuffer.some(color => color !== 0);
        if(isCanvasEmpty) {
             toast({
                variant: 'destructive',
                title: 'No Formula',
                description: 'Please draw a formula or type one in the text field.',
            });
            setIsLoading(false);
            return;
        }
    }


    const formulaDataUri = canvas.toDataURL('image/png');
    
    const variablesObj: Record<string, number> = {};
    variables.split('\n').forEach(line => {
      const [key, value] = line.split('=').map(s => s.trim());
      if (key && value && !isNaN(Number(value))) {
        variablesObj[key] = Number(value);
      }
    });

    try {
      const response = await calculateFromDrawnFormula({ formulaDataUri, variableValues: variablesObj });
      const solveResult = response.result;
      setResult(solveResult);
      const expression = `[Drawn Formula] with ${JSON.stringify(variablesObj)}`;
      onSolve({ type: 'draw', expression, result: String(solveResult) });
    } catch (e: any) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Calculation Error',
        description: "The AI couldn't process the drawn formula. Please try drawing more clearly.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center"><Pencil className="w-6 h-6 mr-2 text-primary" />Draw or Type Formula</CardTitle>
        <CardDescription>
          Draw a formula and provide variables, or type a simple expression directly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
            <label className="text-sm font-medium mb-2 block">Formula Input</label>
            <Input 
                placeholder="Or type a formula here, e.g., 2+2" 
                value={textFormula}
                onChange={(e) => setTextFormula(e.target.value)}
            />
        </div>
        <div className="text-center text-sm text-muted-foreground">OR</div>
        <div>
          <label className="text-sm font-medium mb-2 block">Formula Drawing Area</label>
          <DrawingCanvas ref={canvasRef} />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Variables (for drawn formula)</label>
          <Textarea 
            placeholder="x=10&#10;y=5" 
            value={variables}
            onChange={(e) => setVariables(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4">
        <div className="flex space-x-2">
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Calculate
          </Button>
          <Button variant="outline" onClick={handleClear}><Trash2 className="mr-2 h-4 w-4"/>Clear</Button>
        </div>
        {result !== null && (
            <Card className="w-full bg-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle>Result</CardTitle>
                <CardDescription className="text-2xl font-semibold text-primary">{result}</CardDescription>
              </CardHeader>
            </Card>
        )}
      </CardFooter>
    </Card>
  );
}
