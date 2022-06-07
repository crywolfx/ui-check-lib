import { useCallback, useEffect, useRef, useState } from 'react';
import useMouse from '@/hooks/useMouse';

export type Rect = {
  x: number;
  y: number;
  pageX: number;
  pageY: number;
  width: number;
  height: number;
};

type Position = {
  x: number;
  y: number;
  pageX: number;
  pageY: number;
};

const defaultRect = { x: 0, y: 0, pageX: 0, pageY: 0, width: 0, height: 0 };

export default function useRect({
  autoListener = false,
  onMouseUp,
  onMouseDown,
  onClick,
}: {
  autoListener: boolean;
  onMouseUp?: (e: MouseEvent, rect: Rect) => void;
  onMouseDown?: (e: MouseEvent) => boolean;
  onClick?: (e: MouseEvent) => void;
}): [Rect, () => void, () => void, () => void] {
  const [rect, setRect] = useState<Rect>(defaultRect);
  const [mouseEvent, addMouseEventListener, removeMouseEventListener] = useMouse();
  const startPosition = useRef<Position>({ x: 0, y: 0, pageX: 0, pageY: 0 });
  const rectRef = useRef<Rect>(defaultRect);
  const mouseUpCallback = useRef(onMouseUp);
  const mouseDownCallback = useRef(onMouseDown);
  const clickCallback = useRef(onClick);
  const mouseDownEvent = useRef<MouseEvent>();

  useEffect(() => {
    mouseUpCallback.current = onMouseUp;
  }, [onMouseUp]);

  useEffect(() => {
    mouseDownCallback.current = onMouseDown;
  }, [onMouseDown]);

  useEffect(() => {
    clickCallback.current = onClick;
  }, [onClick]);

  useEffect(() => {
    rectRef.current = rect;
  }, [rect]);

  useEffect(() => {
    const { pageX, pageY, x, y } = mouseEvent;
    const { pageX: startPageX, pageY: startPageY, x: startX, y: startY } = startPosition.current;
    const width = pageX - startPageX;
    const height = pageY - startPageY;
    setRect({
      pageX: startPageX > pageX ? pageX : startPageX,
      pageY: startPageY > pageY ? pageY : startPageY,
      x: startX > x ? x : startX,
      y: startY > y ? y : startY,
      width: Math.abs(width),
      height: Math.abs(height),
    });
  }, [mouseEvent]);

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      removeMouseEventListener();
      const { pageX, pageY } = e;
      const { pageX: startPageX, pageY: startPageY } = startPosition.current;
      // 移动距离小于2相当于触发了click
      if (Math.abs(pageX - startPageX) < 2 && Math.abs(pageY - startPageY) < 2) {
        clickCallback.current?.(e);
      } else {
        mouseUpCallback.current?.(mouseDownEvent.current!, rectRef.current);
      }
      document.removeEventListener('mouseup', handleMouseUp, true);
    },
    [removeMouseEventListener],
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      mouseDownEvent.current = e;
      if (mouseDownCallback.current && !mouseDownCallback.current(e)) {
        document.removeEventListener('mouseup', handleMouseUp);
        return true;
      }
      // mouseDownCallback return false 不往下执行
      startPosition.current = {
        pageX: e.pageX,
        pageY: e.pageY,
        x: e.x,
        y: e.y,
      };
      setRect({
        ...defaultRect,
        pageX: e.pageX,
        pageY: e.pageY,
        x: e.pageX,
        y: e.pageY,
      });
      document.addEventListener('mouseup', handleMouseUp, true);
      addMouseEventListener();
    },
    [addMouseEventListener, handleMouseUp],
  );

  const add = useCallback(() => {
    document.addEventListener('mousedown', handleMouseDown, true);
  }, [handleMouseDown]);

  const remove = useCallback(() => {
    document.removeEventListener('mousedown', handleMouseDown, true);
    document.removeEventListener('mouseup', handleMouseUp, true);
    removeMouseEventListener();
  }, [handleMouseDown, handleMouseUp, removeMouseEventListener]);

  const reset = useCallback(() => {
    setRect(defaultRect);
  }, []);

  useEffect(() => {
    autoListener && add();
    return () => {
      remove();
    };
  }, [autoListener, add, remove]);

  return [rect, reset, add, remove];
}
