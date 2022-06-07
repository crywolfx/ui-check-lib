import { toNum } from "./type";

export function getMasterDom(
  dom: HTMLElement,
  checkFn: (dom: HTMLElement | null) => boolean,
): HTMLElement;
export function getMasterDom(dom: null, checkFn: (dom: HTMLElement | null) => boolean): null;
export function getMasterDom(
  dom: undefined,
  checkFn: (dom: HTMLElement | null) => boolean,
): undefined;
export function getMasterDom(
  dom: HTMLElement | null | undefined,
  checkFn: (dom: HTMLElement | null) => boolean,
): HTMLElement | null | undefined;
export function getMasterDom(
  dom: HTMLElement | null | undefined,
  checkFn: (dom: HTMLElement | null) => boolean,
): HTMLElement | null | undefined {
  if (dom === document.documentElement || !dom) return document.documentElement;
  if (checkFn(dom)) return dom;
  return getMasterDom(dom.parentElement, checkFn);
}


export const getAbsolutePosition = (target: HTMLElement) => {
  const rect = target.getBoundingClientRect();
  const scrollTop = document.documentElement.scrollTop;
  const scrollLeft = document.documentElement.scrollLeft;
  const absoluteTop = toNum(scrollTop) + toNum(rect.top);
  const absoluteLeft = toNum(scrollLeft) + toNum(rect.left);
  return { absoluteTop, absoluteLeft };
};

export const hasPositionedParent = (element: HTMLElement, position = ['fixed']) =>
  getMasterDom(element, (el) => {
    if (el && position.includes(getComputedStyle(el).position)) return true;
    return false;
  }) !== document.documentElement;

export const hasHiddenedParant = (element: HTMLElement) =>
  getMasterDom(element, (el) => {
    if (el && getComputedStyle(el).display === 'none') return true;
    return false;
  }) !== document.documentElement;