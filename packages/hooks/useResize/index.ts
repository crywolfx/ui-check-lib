import { useRafState } from 'ahooks';
import { useCallback, useEffect } from 'react';

export default function useResize(
  target: HTMLElement | Window = window,
  autoAddOnMounted = false,
  options?: boolean | EventListenerOptions | undefined,
): [UIEvent | null, () => void, () => void] {
  const [resizeEvent, setResizeEvent] = useRafState<UIEvent | null>(null);
  const onResize = useCallback(
    (e) => {
      setResizeEvent(e);
    },
    [setResizeEvent],
  );
  const add = useCallback(() => {
    target.addEventListener('resize', onResize, options);
  }, [target, onResize, options]);

  const remove = useCallback(() => {
    target.removeEventListener('resize', onResize, options);
  }, [target, onResize, options]);

  useEffect(() => {
    if (autoAddOnMounted) {
      add();
    }
    return () => {
      remove();
    };
  }, [autoAddOnMounted, add, remove]);

  return [resizeEvent, add, remove];
}
