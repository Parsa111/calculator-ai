import { config } from 'dotenv';
config();

import '@/ai/flows/unit-conversions-from-natural-language.ts';
import '@/ai/flows/calculate-from-drawn-formula.ts';
import '@/ai/flows/solve-user-defined-formulas.ts';
import '@/ai/flows/solve-word-problem.ts';
import '@/ai/flows/financial-calculations.ts';
