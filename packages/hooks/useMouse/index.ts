import { useRafState } from 'ahooks';
import { useCallback, useEffect } from 'react';

export type CursorState = {
  screenX: number;
  screenY: number;
  clientX: number;
  clientY: number;
  x: number;
  y: number;
  pageX: number;
  pageY: number;
  offsetX: number;
  offsetY: number;
  originEvent: MouseEvent | null;
};

const initState: CursorState = {
  screenX: NaN,
  screenY: NaN,
  clientX: NaN,
  clientY: NaN,
  pageX: NaN,
  pageY: NaN,
  x: NaN,
  y: NaN,
  offsetX: NaN,
  offsetY: NaN,
  originEvent: null,
};

export default (params?: {
  autoListener?: boolean;
  target?: HTMLElement | null;
}): [CursorState, () => void, () => void] => {
  const { target = document.documentElement, autoListener = false } = params || {};
  const [state, setState] = useRafState(initState);
  const mouseMove = useCallback(
    (event: MouseEvent) => {
      const { screenX, screenY, x, y, clientX, clientY, pageX, pageY, offsetX, offsetY } = event;
      setState({
        screenX,
        screenY,
        x,
        y,
        clientX,
        clientY,
        pageX,
        pageY,
        offsetX,
        offsetY,
        originEvent: event,
      });
    },
    [setState],
  );
  const remove = useCallback(() => {
    if (!target) return;
    target.removeEventListener('mousemove', mouseMove);
  }, [mouseMove, target]);

  const add = useCallback(() => {
    if (!target) return;
    target.addEventListener('mousemove', mouseMove);
  }, [mouseMove, target]);

  useEffect(() => {
    autoListener && add();
    return () => {
      remove();
    };
  }, [autoListener, add, remove]);

  return [state, add, remove];
};

