import type { CSSProperties, ReactChild } from 'react';
import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import useMouse from '@/hooks/useMouse';
import { getMasterDom } from '@/utils/dom';
import { toNum } from '@/utils/type';
import './index.less';

export default function Drag(props: {
  className?: string;
  style?: CSSProperties;
  children: ReactChild;
  dragMoveHandler: string;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  allowOutBound?: boolean;
  disbaled?: boolean;
  position?: 'fixed' | 'absolute';
  useTransform?: boolean;
  // 当allowOutBound为false时，可通过该参数确定容器盒子用哪个节点计算尺寸
  dragPositionHandler?: string;
  onMounted?: (el: HTMLDivElement | null) => void;
  onChange?: (position: { top?: number; left?: number; right?: number; bottom?: number }) => void;
  onDragStart?: (e: MouseEvent, position?: { left?: number; top?: number }) => void;
  onDragEnd?: (e: MouseEvent, position?: { left?: number; top?: number }) => void;
  // 区分是点击还是drag
  onClick?: (e: MouseEvent) => void;
}) {
  const {
    dragMoveHandler,
    className,
    children,
    top,
    left,
    right,
    bottom,
    disbaled = false,
    allowOutBound = false,
    position = 'fixed',
    useTransform = false,
    style,
    dragPositionHandler,
    onMounted,
    onChange,
    onDragStart,
    onDragEnd,
    onClick,
  } = props;
  const [positionVal, setPositionVal] = useState({ top, left, right, bottom });
  const [mouseEvent, addMouseListener, removeMouseListener] = useMouse();
  const dragBoxRef = useRef<HTMLDivElement | null>(null);
  const handlerRef = useRef<NodeListOf<Element> | null>(null);
  const parentRef = useRef<HTMLElement | null | undefined>(null);
  const positionDValueRef = useRef({ top: 0, left: 0 }); // 鼠标相对当前点击节点的距离
  const positionTypeRef = useRef(position);
  const onDragStartRef = useRef(onDragStart);
  const onDragEndRef = useRef(onDragEnd);
  const onMountedRef = useRef(onMounted);
  const onClickRef = useRef(onClick);
  const positionValRef = useRef(positionVal);
  const dragStartPosition = useRef<{ left?: number; top?: number } | undefined>(positionVal);

  useEffect(() => {
    onDragStartRef.current = onDragStart;
  }, [onDragStart]);

  useEffect(() => {
    onDragEndRef.current = onDragEnd;
  }, [onDragEnd]);

  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    onMountedRef.current = onMounted;
  }, [onMounted]);

  useEffect(() => {
    positionTypeRef.current = position;
  }, [position]);

  useEffect(() => {
    onMountedRef.current?.(dragBoxRef.current);
  }, []);

  useEffect(() => {
    positionValRef.current = positionVal;
  }, [positionVal]);

  useEffect(() => {
    setPositionVal({
      top: props.top,
      left: props.left,
      right: props.right,
      bottom: props.bottom,
    });
  }, [props.top, props.left, props.bottom, props.right]);

  const getPosition = useCallback((currentPosition?: { top: number; left: number }) => {
    let { left: rectLeft = 0, top: rectTop = 0 } = currentPosition || {};
    if (currentPosition && positionTypeRef.current === 'absolute') {
      const scrollTop = parentRef.current?.scrollTop || 0;
      const scrollLeft = parentRef.current?.scrollLeft || 0;
      rectTop = rectTop + scrollTop;
      rectLeft = rectLeft + scrollLeft;
    }
    return { left: rectLeft, top: rectTop };
  }, []);

  useEffect(() => {
    if (disbaled) return;
    const $dragBox = dragBoxRef.current;
    handlerRef.current = $dragBox?.querySelectorAll(dragMoveHandler) || null;
    const $refs = handlerRef.current;
    if ($dragBox && positionTypeRef.current === 'absolute') {
      parentRef.current = getMasterDom($dragBox.parentElement, ($el) => {
        if (!$el) return false;
        const _position = getComputedStyle($el).position;
        return _position !== 'static';
      });
    }

    function handleListener(
      refs: NodeListOf<Element>,
      type: 'add' | 'remove' = 'add',
      key: string,
      listener: any,
    ): void {
      refs.forEach((ref) => {
        if (type === 'add') {
          ref.addEventListener(key, listener);
        } else {
          ref.removeEventListener(key, listener);
        }
      });
    }

    const handleMouseUp = (e: MouseEvent) => {
      removeMouseListener();
      const rect = $dragBox?.getBoundingClientRect();
      const { left: endLeft = 0, top: endTop = 0 } = getPosition(rect);
      onDragEndRef.current?.(e, { left: endLeft, top: endTop });
      const { left: startLeft = 0, top: startTop = 0 } = dragStartPosition.current || {};
      // 移动距离小于2px，等效于点击
      if (Math.abs(endLeft - startLeft) <= 2 && Math.abs(endTop - startTop) <= 2) {
        onClickRef.current?.(e);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const rect = $dragBox?.getBoundingClientRect();
      positionDValueRef.current = {
        top: toNum(e.clientY) - toNum(rect?.top),
        left: toNum(e.clientX) - toNum(rect?.left),
      };
      const currentPosition = getPosition(rect);
      dragStartPosition.current = currentPosition;
      onDragStartRef.current?.(e, currentPosition);

      addMouseListener();
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mouseleave', handleMouseUp);
    };

    $refs && handleListener($refs, 'add', 'mousedown', handleMouseDown);
    return () => {
      $refs && handleListener($refs, 'remove', 'mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
      removeMouseListener();
    };
  }, [getPosition, addMouseListener, removeMouseListener, dragMoveHandler, disbaled]);

  useEffect(() => {
    const $ref = handlerRef.current;
    const $dragBox = dragPositionHandler && dragBoxRef.current?.querySelector<HTMLElement>(dragPositionHandler) || dragBoxRef.current;
    const positionDValue = positionDValueRef.current;
    if ($ref && $ref.length && !isNaN(mouseEvent.clientY) && !isNaN(mouseEvent.clientX)) {
      const isAbsolute = positionTypeRef.current === 'absolute';
      const parentEl = parentRef.current;
      let _top = mouseEvent.clientY - positionDValue.top;
      let _left = mouseEvent.clientX - positionDValue.left;

      if (isAbsolute) {
        const { top: parentTop = 0, left: parentLeft = 0 } = parentEl?.getBoundingClientRect() || {}
        const scrollTop = parentEl?.scrollTop || 0;
        const scrollLeft = parentEl?.scrollLeft || 0;
        _top = _top + scrollTop - parentTop;
        _left = _left + scrollLeft - parentLeft;
      }

      if (!allowOutBound) {
        const clientHeight = isAbsolute && parentEl?.offsetHeight || document.documentElement.clientHeight;
        const clientWidth = isAbsolute && parentEl?.offsetWidth || document.documentElement.clientWidth;
        const minTop = 0;
        let maxTop = clientHeight - toNum($dragBox?.offsetHeight);
        maxTop = maxTop < 0 ? 0 : maxTop;
        const minLeft = 0;
        let maxLeft = clientWidth - toNum($dragBox?.offsetWidth);
        maxLeft = maxLeft < 0 ? 0 : maxLeft;
        
        _top = _top < minTop ? minTop : _top > maxTop ? maxTop : _top;
        _left = _left < minLeft ? minLeft : _left > maxLeft ? maxLeft : _left;
      }
      
      const newPosition = {
        top: _top,
        left: _left,
        right: undefined,
        bottom: undefined,
      };

      setPositionVal(newPosition);
      onChange?.(newPosition);
    }
  }, [allowOutBound, mouseEvent, dragPositionHandler, onChange]);

  useEffect(() => {
    if (disbaled) {
      removeMouseListener();
    }
  }, [disbaled, removeMouseListener]);

  const positionStyle = useMemo(() => {
    if (useTransform) {
      // TODO 处理right,bottom
      return {
        top: 0,
        left: 0,
        transform: `translate3d(${positionVal.left}px, ${positionVal.top}px, 0)`,
      };
    } else {
      return {
        ...positionVal,
      };
    }
  }, [useTransform, positionVal]);

  return (
    <div
      className={`drag-handler ${className || ''}`}
      ref={dragBoxRef}
      style={{
        position: position,
        ...positionStyle,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
