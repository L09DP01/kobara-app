"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function IsometricVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const translateY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [5, -5]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center lg:justify-end">
      {/* Background Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute w-[80%] h-[80%] bg-gradient-radial from-kobara-orange/20 to-transparent blur-[100px]" 
      />

      {/* Main Video Visual */}
      <motion.div 
        style={{ y: translateY, rotateX }}
        className="relative z-10 w-full max-w-[700px] aspect-video rounded-3xl overflow-hidden shadow-[0_32px_64px_rgba(11,19,36,0.12)] border border-white/40 glass-panel"
      >
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover scale-105"
        >
          <source src="/videos/isometric-animation.mp4" type="video/mp4" />
        </video>

        {/* Data Lines (Code Simulation) */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: -100, opacity: 0 }}
              animate={{ 
                x: [null, 200, 600],
                opacity: [0, 1, 1, 0],
                y: [null, i * 80 + 100, i * 80 + 50]
              }}
              transition={{ 
                duration: 3 + i, 
                repeat: Infinity, 
                delay: i * 0.8,
                ease: "linear"
              }}
              className="absolute h-[1px] w-32 bg-gradient-to-r from-transparent via-kobara-orange to-transparent"
            />
          ))}
        </div>
      </motion.div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -30, 0],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{ 
              duration: 4 + Math.random() * 2, 
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className={`absolute w-1.5 h-1.5 rounded-full ${i % 2 === 0 ? 'bg-kobara-orange' : 'bg-kobara-red'}`}
            style={{ 
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%` 
            }}
          />
        ))}
      </div>
    </div>
  );
}
