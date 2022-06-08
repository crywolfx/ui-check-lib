import { Resizable } from 're-resizable';
import type { ReactNode } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';
import './index.less';

type Size = { left: number; top: number; width: number; height: number };
export default function ResizeRect({
  className = '',
  left,
  top,
  width,
  height,
  visible = true,
  disbaled = false,
  loading = false,
  children,
  onResizeStart: onResizeStartCallback,
  onResize: onResizeCallback,
  onResizeStop: onResizeStopCallback,
}: {
  children?: ReactNode;
  className?: string;
  left: number;
  top: number;
  width: number;
  height: number;
  visible?: boolean;
  disbaled?: boolean;
  loading?: boolean;
  onResizeStart?: (size: Size) => void;
  onResize?: (size: Size) => void;
  onResizeStop?: (size: Size) => void;
}) {
  const [size, setSize] = useState<Size>({ left, top, width, height });
  const sizeRef = useRef(size);
  const startSizeRef = useRef(size);

  useEffect(() => {
    setSize({ left, top, width, height });
  }, [left, top, width, height]);

  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  const onResize = useCallback(
    (e, direction, ref, d) => {
      let newSize = { ...startSizeRef.current };
      if (direction.match(/left/gi) || direction.match(/top/gi)) {
        // 修改左边 || 上边
        newSize = {
          left: (startSizeRef.current?.left || 0) - d.width,
          top: (startSizeRef.current?.top || 0) - d.height,
          width: d.width + (startSizeRef.current?.width || 0),
          height: d.height + (startSizeRef.current?.height || 0),
        };
      } else {
        newSize = {
          ...startSizeRef.current,
          width: d.width + (startSizeRef.current?.width || 0),
          height: d.height + (startSizeRef.current?.height || 0),
        };
      }
      setSize(newSize);
      onResizeCallback?.(newSize);
    },
    [onResizeCallback],
  );

  const onResizeStart = useCallback(() => {
    startSizeRef.current = sizeRef.current;
    onResizeStartCallback?.(sizeRef.current);
  }, [onResizeStartCallback]);

  const onResizeStop = useCallback(() => {
    onResizeStopCallback?.(sizeRef.current);
  }, [onResizeStopCallback]);

  return width || height ? (
    <Resizable
      className={`resize-rect-container ${className}`}
      size={{ width: size.width, height: size.height }}
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
      enable={{
        top: !disbaled,
        right: !disbaled,
        bottom: !disbaled,
        left: !disbaled,
        topRight: !disbaled,
        bottomRight: !disbaled,
        bottomLeft: !disbaled,
        topLeft: !disbaled,
      }}
      style={{
        position: 'absolute',
        top: size.top,
        left: size.left,
        visibility: visible ? 'visible' : 'hidden',
      }}
    >
      {children ? (
        children
      ) : (
        <div className={`resize-rect`}>
          <Spin className="resize-rect__loading" spinning={loading} />
        </div>
      )}
    </Resizable>
  ) : null;
}
