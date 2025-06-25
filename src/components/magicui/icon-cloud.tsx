"use client";

import React, { useEffect, useRef, useState } from "react";

interface IconCloudProps {
  icons?: React.ReactNode[];
}

export function IconCloud({ icons = [] }: IconCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();

  // Generate positions on a sphere
  const positions = icons.map((_, index) => {
    const phi = Math.acos(-1 + (2 * index) / icons.length);
    const theta = Math.sqrt(icons.length * Math.PI) * phi;

    return {
      x: Math.cos(theta) * Math.sin(phi),
      y: Math.sin(theta) * Math.sin(phi),
      z: Math.cos(phi),
    };
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setRotation(prev => ({
      x: prev.x + deltaY * 0.01,
      y: prev.y + deltaX * 0.01,
    }));

    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Auto-rotation animation
  useEffect(() => {
    const animate = () => {
      if (!isDragging) {
        setRotation(prev => ({
          x: prev.x + 0.001,
          y: prev.y + 0.002,
        }));
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="absolute inset-0"
        style={{
          transform: `rotateX(${rotation.x}rad) rotateY(${rotation.y}rad)`,
          transformStyle: 'preserve-3d',
          transition: isDragging ? 'none' : 'transform 0.1s',
        }}
      >
        {icons.map((icon, index) => {
          const { x, y, z } = positions[index];
          const scale = (z + 1) / 2;
          const opacity = scale;

          return (
            <div
              key={index}
              className="absolute w-8 h-8 flex items-center justify-center"
              style={{
                transform: `translate3d(${x * 200}px, ${y * 200}px, ${z * 200}px)`,
                opacity,
                scale: `${scale}`,
              }}
            >
              {icon}
            </div>
          );
        })}
      </div>
    </div>
  );
}

