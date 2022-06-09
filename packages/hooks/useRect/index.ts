import { useCallback, useEffect, useRef, useState } from 'react';
import useMouse from '@/hooks/useMouse';

export type Rect = {
  x: number;
  y: number;
  pageX: number;
  pageY: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
};

export type Position = {
  x: number;
  y: number;
  pageX: number;
  pageY: number;
  offsetX: number;
  offsetY: number;
};

export type ClickEvent = {
  offsetX: number;
  offsetY: number;
}

const defaultRect: Rect = {
  x: 0,
  y: 0,
  pageX: 0,
  pageY: 0,
  width: 0,
  height: 0,
  offsetX: 0,
  offsetY: 0,
};

export default function useRect(parmas?: {
  autoListener?: boolean;
  target?: HTMLElement | null;
  allowOutBound?: boolean;
  onMouseUp?: (e: MouseEvent, rect: Rect) => void;
  onMouseDown?: (e: MouseEvent) => boolean;
  onClick?: (e: MouseEvent, event: ClickEvent) => void;
}): [Rect, () => void, () => void, () => void] {
  const {
    autoListener = false,
    allowOutBound = true,
    target = document.documentElement,
    onMouseUp,
    onMouseDown,
    onClick,
  } = parmas || {};
  const [rect, setRect] = useState<Rect>(defaultRect);
  const [mouseEvent, addMouseEventListener, removeMouseEventListener] = useMouse();
  const startPosition = useRef<Position>({
    x: 0,
    y: 0,
    pageX: 0,
    pageY: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const rectRef = useRef<Rect>(defaultRect);
  const mouseUpCallback = useRef(onMouseUp);
  const mouseDownCallback = useRef(onMouseDown);
  const clickCallback = useRef(onClick);
  const mouseDownEvent = useRef<MouseEvent>();
  const rectPagePostion = useRef({ pageX: 0, pageY: 0 });

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
    if (!target) return;
    const {
      left: targetLeft,
      top: targetTop,
      right: targetRight,
      bottom: targetBottom,
      width: targetWidth,
      height: targetHeight,
    } = target.getBoundingClientRect();
    const { pageX, pageY, x, y } = mouseEvent;
    const {
      pageX: startPageX,
      pageY: startPageY,
      x: startX,
      y: startY,
      offsetX: startOffsetX,
      offsetY: startOffsetY,
    } = startPosition.current;
    const width = pageX - startPageX;
    const height = pageY - startPageY;

    const targetOffsetX = x - targetLeft;
    const targetOffsetY = y - targetTop;

    const _rect = {
      pageX: startPageX > pageX ? pageX : startPageX,
      pageY: startPageY > pageY ? pageY : startPageY,
      x: startX > x ? x : startX,
      y: startY > y ? y : startY,
      offsetX: startOffsetX > targetOffsetX ? targetOffsetX : startOffsetX,
      offsetY: startOffsetY > targetOffsetY ? targetOffsetY : startOffsetY,
      width: Math.abs(width),
      height: Math.abs(height),
    };

    if (!allowOutBound) {
      _rect.x = _rect.x < targetLeft ? targetLeft : _rect.x > targetRight ? targetRight : _rect.x;
      _rect.y = _rect.y < targetTop ? targetTop : _rect.y > targetBottom ? targetBottom : _rect.y;
      _rect.offsetX =
        _rect.offsetX < 0 ? 0 : _rect.offsetX > targetWidth ? targetWidth : _rect.offsetX;
      _rect.offsetY =
        _rect.offsetY < 0 ? 0 : _rect.offsetY > targetHeight ? targetHeight : _rect.offsetY;
      const toRight = x > _rect.x;
      const toBottom = y > _rect.y;
      const maxWidth = toRight ? targetWidth - _rect.offsetX : startOffsetX;
      const maxHeight = toBottom ? targetHeight - _rect.offsetY : startOffsetY;
      _rect.width = _rect.width > maxWidth ? maxWidth : _rect.width;
      _rect.height = _rect.height > maxHeight ? maxHeight : _rect.height;

      if (_rect.offsetX === 0 && !rectPagePostion.current.pageX) {
        rectPagePostion.current.pageX = _rect.pageX;
        console.log(rectPagePostion.current?.pageX);
      }
      if (_rect.offsetY === 0 && !rectPagePostion.current.pageY) {
        rectPagePostion.current.pageY = _rect.pageY;
      }
      if (rectPagePostion.current?.pageX) {
        _rect.pageX =
          _rect.pageX < rectPagePostion.current?.pageX
            ? rectPagePostion.current?.pageX
            : _rect.pageX;
      }
      if (rectPagePostion.current?.pageY) {
        _rect.pageY =
          _rect.pageY < rectPagePostion.current?.pageY
            ? rectPagePostion.current?.pageY
            : _rect.pageY;
      }
    }

    setRect(_rect);
  }, [mouseEvent, target, allowOutBound]);

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!target) return;
      removeMouseEventListener();
      const { pageX, pageY } = e;
      const { pageX: startPageX, pageY: startPageY } = startPosition.current;
      // 移动距离小于2相当于触发了click
      if (Math.abs(pageX - startPageX) < 2 && Math.abs(pageY - startPageY) < 2) {
        const { left, top } = target.getBoundingClientRect();
        const offsetX = e.x - left;
        const offsetY = e.y - top;
        clickCallback.current?.(e, { offsetX , offsetY });
      } else {
        mouseUpCallback.current?.(mouseDownEvent.current!, rectRef.current);
      }
      document.removeEventListener('mouseup', handleMouseUp, true);
    },
    [removeMouseEventListener, target],
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!target) return;
      mouseDownEvent.current = e;
      if (mouseDownCallback.current && !mouseDownCallback.current(e)) {
        document.removeEventListener('mouseup', handleMouseUp);
        return true;
      }
      const { left, top, right, bottom } = target.getBoundingClientRect();
      if (e.x < left || e.x > right || e.y < top || e.y > bottom) {
        document.removeEventListener('mouseup', handleMouseUp);
        return true;
      }
      const offsetX = e.x - left;
      const offsetY = e.y - top;
      startPosition.current = {
        pageX: e.pageX,
        pageY: e.pageY,
        x: e.x,
        y: e.y,
        offsetX: offsetX,
        offsetY: offsetY,
      };
      setRect({
        ...defaultRect,
        pageX: e.pageX,
        pageY: e.pageY,
        x: e.pageX,
        y: e.pageY,
        offsetX: offsetX,
        offsetY: offsetY,
      });
      document.addEventListener('mouseup', handleMouseUp, true);
      addMouseEventListener();
    },
    [addMouseEventListener, handleMouseUp, target],
  );

  const add = useCallback(() => {
    if (!target) return;
    document.addEventListener('mousedown', handleMouseDown, true);
  }, [handleMouseDown, target]);

  const remove = useCallback(() => {
    if (!target) return;
    document.removeEventListener('mousedown', handleMouseDown, true);
    document.removeEventListener('mouseup', handleMouseUp, true);
    removeMouseEventListener();
  }, [handleMouseDown, handleMouseUp, removeMouseEventListener, target]);

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
