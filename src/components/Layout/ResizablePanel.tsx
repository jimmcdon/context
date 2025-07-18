import React, { useState, useRef, useCallback } from 'react';

interface ResizablePanelProps {
  children: React.ReactNode;
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
  position: 'left' | 'right';
  isVisible: boolean;
  onResize?: (width: number) => void;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  defaultWidth,
  minWidth,
  maxWidth,
  position,
  isVisible,
  onResize
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = position === 'left' 
      ? e.clientX - startXRef.current 
      : startXRef.current - e.clientX;
    
    const newWidth = Math.min(
      Math.max(startWidthRef.current + deltaX, minWidth),
      maxWidth
    );
    
    setWidth(newWidth);
    onResize?.(newWidth);
  }, [isResizing, position, minWidth, maxWidth, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [width, handleMouseMove, handleMouseUp]);

  if (!isVisible) return null;

  return (
    <div
      ref={panelRef}
      className={`relative bg-cursor-sidebar border-cursor-border flex-shrink-0 ${
        position === 'left' ? 'border-r' : 'border-l'
      }`}
      style={{ width: `${width}px` }}
    >
      {children}
      
      {/* Resize handle */}
      <div
        className={`absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-cursor-accent/30 transition-colors ${
          position === 'left' ? '-right-0.5' : '-left-0.5'
        } ${isResizing ? 'bg-cursor-accent/50' : ''}`}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};