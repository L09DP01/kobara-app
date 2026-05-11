"use client";

import { motion } from "framer-motion";

export function FloatingBackground() {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none bg-[#fcf8f9]">
      {/* Hero Glow */}
      <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-hero-glow opacity-60" />
      
      {/* Animating Blobs */}
      <motion.div 
        animate={{ 
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 -left-20 w-[500px] h-[500px] bg-secondary-container/10 rounded-full blur-[120px]" 
      />
      
      <motion.div 
        animate={{ 
          x: [0, -40, 0],
          y: [0, 60, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-tertiary-fixed-dim/10 rounded-full blur-[140px]" 
      />

      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-kobara-orange/5 rounded-full blur-[100px]" />
      
      {/* Grid Pattern overlay (optional for texture) */}
      <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-[0.03]" />
    </div>
  );
}
