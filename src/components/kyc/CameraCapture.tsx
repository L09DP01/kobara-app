"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface CameraCaptureProps {
  facingMode?: 'user' | 'environment';
  onCapture: (blob: Blob) => void;
  overlay?: React.ReactNode;
  instruction?: string;
  isRecording?: boolean;
}

export function CameraCapture({ facingMode = 'environment', onCapture, overlay, instruction, isRecording }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setHasPermission(true);
    } catch (err) {
      console.error("Camera access denied or unavailable", err);
      setHasPermission(false);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) onCapture(blob);
    }, 'image/webp', 0.9);
  };

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-error-container/10 rounded-2xl border border-error/20 text-center">
        <span className="material-symbols-outlined text-4xl text-error mb-4">videocam_off</span>
        <h3 className="text-lg font-semibold text-text-primary mb-2">Caméra bloquée</h3>
        <p className="text-sm text-text-secondary mb-4">Vous devez autoriser l'accès à la caméra pour procéder à la vérification d'identité.</p>
        <Button onClick={startCamera}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[3/4] sm:aspect-square bg-black rounded-2xl overflow-hidden flex flex-col">
      {instruction && (
        <div className="absolute top-4 left-4 right-4 z-10 bg-black/60 backdrop-blur-md p-3 rounded-xl text-center">
          <p className="text-white text-sm font-medium">{instruction}</p>
        </div>
      )}
      
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {overlay && (
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
          {overlay}
        </div>
      )}
      
      <canvas ref={canvasRef} className="hidden" />

      {!isRecording && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
          <button 
            onClick={handleCapture}
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white flex items-center justify-center hover:bg-white/40 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-white shadow-lg"></div>
          </button>
        </div>
      )}
    </div>
  );
}
