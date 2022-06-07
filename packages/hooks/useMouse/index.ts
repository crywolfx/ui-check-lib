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
  originEvent: null,
};

export default (target = document): [CursorState, () => void, () => void] => {
  const [state, setState] = useRafState(initState);
  const mouseMove = useCallback(
    (event: MouseEvent) => {
      const { screenX, screenY, x, y, clientX, clientY, pageX, pageY } = event;
      setState({ screenX, screenY, x, y, clientX, clientY, pageX, pageY, originEvent: event });
    },
    [setState],
  );
  const remove = useCallback(() => {
    target.removeEventListener('mousemove', mouseMove);
  }, [mouseMove, target]);

  const add = useCallback(() => {
    target.addEventListener('mousemove', mouseMove);
  }, [mouseMove, target]);

  useEffect(() => {
    return () => {
      remove();
    };
  }, [remove]);

  return [state, add, remove];
};
