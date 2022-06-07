export declare type CursorState = {
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
declare const _default: (target?: Document) => [CursorState, () => void, () => void];
export default _default;
