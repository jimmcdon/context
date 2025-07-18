import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number, isVisible: boolean) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  getItemKey?: (item: T, index: number) => string | number;
}

interface VirtualRange {
  startIndex: number;
  endIndex: number;
  visibleStartIndex: number;
  visibleEndIndex: number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  getItemKey
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate total height
  const totalHeight = items.length * itemHeight;

  // Calculate visible range
  const range = useMemo((): VirtualRange => {
    const visibleStartIndex = Math.floor(scrollTop / itemHeight);
    const visibleEndIndex = Math.min(
      visibleStartIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    const startIndex = Math.max(0, visibleStartIndex - overscan);
    const endIndex = Math.min(items.length - 1, visibleEndIndex + overscan);

    return {
      startIndex,
      endIndex,
      visibleStartIndex,
      visibleEndIndex
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const result = [];
    for (let i = range.startIndex; i <= range.endIndex; i++) {
      if (items[i]) {
        result.push({
          item: items[i],
          index: i,
          isVisible: i >= range.visibleStartIndex && i <= range.visibleEndIndex
        });
      }
    }
    return result;
  }, [items, range]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    onScroll?.(scrollTop);
  }, [onScroll]);

  // Scroll to item
  const scrollToItem = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
    if (!scrollElementRef.current) return;

    let scrollTop;
    switch (align) {
      case 'start':
        scrollTop = index * itemHeight;
        break;
      case 'center':
        scrollTop = index * itemHeight - containerHeight / 2 + itemHeight / 2;
        break;
      case 'end':
        scrollTop = index * itemHeight - containerHeight + itemHeight;
        break;
    }

    scrollTop = Math.max(0, Math.min(scrollTop, totalHeight - containerHeight));
    scrollElementRef.current.scrollTop = scrollTop;
  }, [itemHeight, containerHeight, totalHeight]);

  // Expose scroll methods via a separate ref if needed

  // Calculate offset for absolute positioning
  const offsetY = range.startIndex * itemHeight;

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Total height container */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map(({ item, index, isVisible }) => (
            <div
              key={getItemKey ? getItemKey(item, index) : index}
              style={{
                height: itemHeight,
                overflow: 'hidden'
              }}
            >
              {renderItem(item, index, isVisible)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook for managing virtual list state
export function useVirtualList<T>(items: T[], itemHeight: number = 50) {
  const [containerHeight, setContainerHeight] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure container height
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerHeight(rect.height);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Calculate visible metrics
  const metrics = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const totalHeight = items.length * itemHeight;
    const canScroll = totalHeight > containerHeight;

    return {
      visibleCount,
      totalHeight,
      canScroll,
      itemHeight,
      containerHeight
    };
  }, [items.length, itemHeight, containerHeight]);

  return {
    containerRef,
    containerHeight,
    metrics,
    setContainerHeight
  };
}