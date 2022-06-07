export declare type Rect = {
    x: number;
    y: number;
    pageX: number;
    pageY: number;
    width: number;
    height: number;
};
export default function useRect({ autoListener, onMouseUp, onMouseDown, onClick, }: {
    autoListener: boolean;
    onMouseUp?: (e: MouseEvent, rect: Rect) => void;
    onMouseDown?: (e: MouseEvent) => boolean;
    onClick?: (e: MouseEvent) => void;
}): [Rect, () => void, () => void, () => void];
