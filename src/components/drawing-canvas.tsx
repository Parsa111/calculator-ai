
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
  const lastPosition = useRef<{ x: number, y: number } | null>(null);

  const getContext = () => {
    return canvasRef.current?.getContext('2d');
  };

  useImperativeHandle(ref, () => ({
    clear: () => {
      const canvas = canvasRef.current;
      const ctx = getContext();
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'hsl(var(--background))';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    },
    getCanvas: () => canvasRef.current,
  }));
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
        
        ctx.fillStyle = 'hsl(var(--background))';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const getCoords = (event: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const touch = event instanceof TouchEvent ? event.touches[0] : null;
      const mouseEvent = event instanceof MouseEvent ? event : null;

      if (touch) {
        return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
      } else if (mouseEvent) {
        return { x: mouseEvent.clientX - rect.left, y: mouseEvent.clientY - rect.top };
      }
      return null;
    }

    const startDrawing = (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      const coords = getCoords(event);
      if(!coords) return;
      
      const ctx = getContext();
      if (ctx) {
        isDrawing.current = true;
        lastPosition.current = coords;
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
      }
    };

    const draw = (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      if (!isDrawing.current) return;
      const coords = getCoords(event);
      if(!coords || !lastPosition.current) return;
      
      const ctx = getContext();
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(lastPosition.current.x, lastPosition.current.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        lastPosition.current = coords;
      }
    };

    const stopDrawing = (event: MouseEvent | TouchEvent) => {
       event.preventDefault();
       if (isDrawing.current) {
         isDrawing.current = false;
         lastPosition.current = null;
         const ctx = getContext();
         if(ctx) ctx.closePath();
       }
    };
    
    canvas.addEventListener('mousedown', startDrawing, { passive: false });
    canvas.addEventListener('mousemove', draw, { passive: false });
    canvas.addEventListener('mouseup', stopDrawing, { passive: false });
    canvas.addEventListener('mouseleave', stopDrawing, { passive: false });
    
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing, { passive: false });
    canvas.addEventListener('touchcancel', stopDrawing, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
      canvas.removeEventListener('touchcancel', stopDrawing);
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
