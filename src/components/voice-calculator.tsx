
"use client";

import { useState, useRef } from 'react';
import type { HistoryEntry } from '@/lib/types';
import { calculateFromAudio } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mic, StopCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceCalculatorProps {
  onCalculate: (entry: Omit<HistoryEntry, 'id'>) => void;
}

const mimeTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
];

export function VoiceCalculator({ onCalculate }: VoiceCalculatorProps) {
  const [result, setResult] = useState<string | null>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recorderMimeType = useRef<string | null>(null);

  const handleStartRecording = async () => {
    setResult(null);
    setQuery(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));
      if (!supportedMimeType) {
        throw new Error("No supported audio format found for recording.");
      }
      recorderMimeType.current = supportedMimeType;
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: supportedMimeType });
      
      mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
        }
      });
      mediaRecorderRef.current.addEventListener("stop", handleStopRecording);
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error("Error accessing microphone:", err);
      toast({
        variant: "destructive",
        title: "Microphone Error",
        description: err.message || "Could not access the microphone. Please grant permission in your browser.",
      });
    }
  };

  const handleStopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Detach the event listener to avoid multiple triggers
      mediaRecorderRef.current.removeEventListener("stop", handleStopRecording);
      const stream = mediaRecorderRef.current.stream;
      stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsLoading(true);

      const audioBlob = new Blob(audioChunksRef.current, { type: recorderMimeType.current || undefined });
      
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        try {
          const response = await calculateFromAudio({ audioDataUri: base64Audio });
          setQuery(response.query);
          setResult(response.result);
          onCalculate({ type: 'voice', expression: response.query, result: response.result });
        } catch (e: any) {
          console.error(e);
          toast({
            variant: 'destructive',
            title: 'Calculation Error',
            description: "The AI couldn't process the audio. Please try speaking more clearly.",
          });
        } finally {
          setIsLoading(false);
        }
      };
      audioChunksRef.current = [];
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center"><Mic className="w-6 h-6 mr-2 text-primary" />Voice Calculator</CardTitle>
        <CardDescription>
          {isRecording 
            ? "Recording... Click the button to stop." 
            : "Click the button and speak your calculation, e.g., 'What is 15% of 250?'"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center items-center h-48">
        {!isRecording ? (
          <Button onClick={handleStartRecording} size="lg" className="h-20 w-20 rounded-full" disabled={isLoading}>
            <Mic className="h-10 w-10" />
          </Button>
        ) : (
          <Button onClick={handleStopRecording} size="lg" variant="destructive" className="h-20 w-20 rounded-full">
            <StopCircle className="h-10 w-10" />
          </Button>
        )}
        {isLoading && <Loader2 className="h-12 w-12 animate-spin text-primary absolute" />}
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4">
        {query && (
            <div className='w-full'>
                <p className="text-sm text-muted-foreground">You said:</p>
                <p className="text-lg font-semibold">"{query}"</p>
            </div>
        )}
        {result && (
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
