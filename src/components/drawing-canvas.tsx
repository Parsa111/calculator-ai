"use client";

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export interface DrawingCanvasHandles {
  clear: () => void;
  getCanvas: () => HTMLCanvasElement | null;
}

const DrawingCanvas = forwardRef<DrawingCanvasHandles, {}>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const isMobile = useIsMobile();
  const lineWidth = isMobile ? 3 : 4;
  const strokeStyle = 'hsl(var(--foreground))';

  const getContext = () => {
    return canvasRef.current?.getContext('2d');
  };

  useImperativeHandle(ref, () => ({
    clear: () => {
      const canvas = canvasRef.current;
      const ctx = getContext();
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Set background to a non-transparent color
        ctx.fillStyle = 'hsl(var(--background))';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    },
    getCanvas: () => canvasRef.current,
  }));
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set high-DPI canvas
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        
        // Initial background fill
        ctx.fillStyle = 'hsl(var(--background))';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const getCoords = (event: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (event instanceof MouseEvent) {
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
      }
      if (event.touches[0]) {
        return { x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top };
      }
      return null;
    }

    const startDrawing = (event: MouseEvent | TouchEvent) => {
      const coords = getCoords(event);
      if(!coords) return;
      
      const ctx = getContext();
      if (ctx) {
        isDrawing.current = true;
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
      }
      event.preventDefault();
    };

    const draw = (event: MouseEvent | TouchEvent) => {
      if (!isDrawing.current) return;
      const coords = getCoords(event);
      if(!coords) return;
      
      const ctx = getContext();
      if (ctx) {
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      }
       event.preventDefault();
    };

    const stopDrawing = () => {
      isDrawing.current = false;
      const ctx = getContext();
      if(ctx) ctx.closePath();
    };
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [lineWidth, strokeStyle]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-48 rounded-lg border-2 border-dashed bg-background touch-none cursor-crosshair"
    />
  );
});

DrawingCanvas.displayName = "DrawingCanvas";
export default DrawingCanvas;
