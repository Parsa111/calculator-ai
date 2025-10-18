'use server';
/**
 * @fileOverview A Genkit flow for performing calculations from spoken natural language.
 *
 * - calculateFromAudio - An asynchronous function that takes an audio data URI, transcribes it to text, and then performs a calculation based on the transcribed query.
 * - CalculateFromAudioInput - The input type for the calculateFromAudio function, containing the audio data URI.
 * - CalculateFromAudioOutput - The return type for the calculateFromAudio function, containing the original query and the calculated result.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateFromAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A data URI of an audio recording of a calculation query. It must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CalculateFromAudioInput = z.infer<typeof CalculateFromAudioInputSchema>;

const CalculateFromAudioOutputSchema = z.object({
  query: z.string().describe('The transcribed text from the audio query.'),
  result: z.string().describe('The result of the calculation.'),
});
export type CalculateFromAudioOutput = z.infer<typeof CalculateFromAudioOutputSchema>;

export async function calculateFromAudio(input: CalculateFromAudioInput): Promise<CalculateFromAudioOutput> {
  return calculateFromAudioFlow(input);
}

const transcriptionPrompt = ai.definePrompt({
  name: 'transcriptionPrompt',
  input: {schema: CalculateFromAudioInputSchema},
  output: {schema: z.object({ query: z.string() })},
  prompt: `Transcribe the following audio. The audio contains a spoken calculation query.
  
  Audio: {{media url=audioDataUri}}`,
});

const calculationPrompt = ai.definePrompt({
    name: 'calculationPrompt',
    input: {schema: z.object({ query: z.string() })},
    output: {schema: z.object({ result: z.string() })},
    prompt: `You are a calculation expert. You will take a natural language query and return the numerical result.
  
  Query: {{{query}}}
  
  Respond with just the answer, nothing else. No extraneous text.`,
});

const calculateFromAudioFlow = ai.defineFlow(
  {
    name: 'calculateFromAudioFlow',
    inputSchema: CalculateFromAudioInputSchema,
    outputSchema: CalculateFromAudioOutputSchema,
  },
  async input => {
    const { output: transcriptionOutput } = await transcriptionPrompt(input);
    if (!transcriptionOutput?.query) {
      throw new Error('Could not transcribe audio.');
    }
    
    const { output: calculationOutput } = await calculationPrompt(transcriptionOutput);
    if(!calculationOutput?.result) {
        throw new Error('Could not calculate result from query.');
    }

    return {
        query: transcriptionOutput.query,
        result: calculationOutput.result
    };
  }
);
