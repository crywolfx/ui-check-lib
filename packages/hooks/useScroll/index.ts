import { useCallback, useEffect } from 'react';
import { useRafState } from 'ahooks';

export default function useScroll(
  target: HTMLElement | Document = document,
  options?: boolean | EventListenerOptions | undefined,
): [Event | null, () => void, () => void] {
  const [state, setState] = useRafState<Event | null>(null);
  const onScroll = useCallback(
    (e: Event) => {
      setState(e);
    },
    [setState],
  );
  const remove = useCallback(() => {
    target.removeEventListener('scroll', onScroll, options);
  }, [onScroll, options, target]);

  const add = useCallback(() => {
    target.addEventListener('scroll', onScroll, options);
  }, [onScroll, options, target]);

  useEffect(() => {
    return () => {
      remove();
    };
  }, [remove]);

  return [state, add, remove];
}
