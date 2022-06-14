import type { ReactNode } from 'react';
import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import type { OnDel } from '@/components/Comment';
import Comment from '@/components/Comment';
import { useScroll, useResize } from '@/hooks';
import Drag from '@/components/Drag';
import { MissionStatus } from '@/constant';
import type { MissionItem } from '@/constant';
import ResizeRect from '@/components/ResizeRect';
import { getAbsolutePosition, hasPositionedParent, hasHiddenedParant } from '@/utils/dom';
import './index.less';

type MissionMarkType = Partial<
  Pick<
    MissionItem,
    | 'missionId'
    | 'location'
    | 'comment'
    | 'content'
    | 'userIcon'
    | 'userName'
    | 'createdTime'
    | 'updatedTime'
    | 'status'
  >
>;

export type LocationRect = {
  width: number;
  height: number;
};

export type LocationInfo = {
  absoluteTop: number;
  absoluteLeft: number;
  relativeTop?: number;
  relativeLeft?: number;
  xPath?: string;
  rect?: LocationRect;
};

type IMark = {
  index: number | ReactNode;
  element?: HTMLElement | null;
  position: LocationInfo;
  isSelected?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  defaultContent?: string;
  defaultImage?: string;
  disabledDrag?: boolean;
  disabledRectChange?: boolean;
  renderRichText?: ({
    onSubmit,
  }: {
    onSubmit: (data: { html: string }) => Promise<any>;
  }) => ReactNode;
  onChangePosition?: (position: {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    width?: number;
    height?: number;
  }) => void;
  onChangeStatus?: (missionId: number, status: MissionStatus) => Promise<any>;
  onSave: (data: { html: string; missionId?: number }) => Promise<any>;
  onClickLabel?: (missionId?: number) => void;
  onChangeNext?: (missionId: number | undefined) => void;
  onChangePrev?: (missionId: number | undefined) => void;
  onDragChange?: (type: boolean) => void;
  onDel?: OnDel;
  onSelectedMounted?: (el: HTMLDivElement | null) => void;
};

type MarkType = IMark & MissionMarkType;

export default function Mark(props: MarkType) {
  const {
    missionId,
    index,
    comment = [],
    status,
    position,
    element,
    content,
    defaultContent,
    defaultImage,
    userIcon,
    userName,
    createdTime,
    updatedTime,
    isFirst = false,
    isLast = false,
    isSelected = false,
    disabledDrag = false,
    disabledRectChange = false,
    renderRichText,
    onChangeStatus,
    onChangePosition,
    onSave,
    onClickLabel,
    onChangeNext,
    onChangePrev,
    onDragChange,
    onDel,
    onSelectedMounted,
  } = props;
  const [scrollEvent, addScrollListener, removeScrollListener] = useScroll(document, true);
  const [resizeEvent, addResizeListener, removeResizeListener] = useResize();

  useEffect(() => {
    if (element) {
      addScrollListener();
      addResizeListener();
    } else {
      removeScrollListener();
      removeResizeListener();
    }
    return () => {
      removeScrollListener();
      removeResizeListener();
    };
  }, [element, addScrollListener, removeScrollListener, addResizeListener, removeResizeListener]);

  const {
    defPosition,
    fixed: isFixed,
    contentStyle,
  } = useMemo(() => {
    // 定位原理：获取element相对文档边缘的位置以及保存时节点距离element的位置计算应该渲染的位置
    // 如果没有element则降级为初始position的位置
    const { absoluteLeft, absoluteTop, relativeLeft, relativeTop } = position || {};
    const backupPosition = {
      top: absoluteTop,
      left: absoluteLeft,
      bottom: undefined,
      right: undefined,
    };
    let fixed = false;

    const hasHiddenedParent = element ? hasHiddenedParant(element) : false;

    if (element && !hasHiddenedParent) {
      fixed = hasPositionedParent(element);
      const elementRect: any = !fixed
        ? getAbsolutePosition(element)
        : element.getBoundingClientRect();
      const elTop = elementRect?.absoluteTop || elementRect.top || 0;
      const elLeft = elementRect?.absoluteLeft || elementRect.left || 0;
      const top = elTop + (relativeTop || 0);
      const left = elLeft + (relativeLeft || 0);
      backupPosition.top = top;
      backupPosition.left = left;
    }

    const top = (position.rect?.height || 0) - 30;
    const left = (position.rect?.width || 0) + 7;
    const _contentStyle = (
      top > 0 ? { position: 'absolute', top: `${top}px`, left: `${left}px` } : {}
    ) as any;
    return { defPosition: backupPosition, fixed, contentStyle: _contentStyle };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollEvent, resizeEvent, element, position]);

  const onChangePositionRef = useRef(onChangePosition);
  useEffect(() => {
    onChangePositionRef.current = onChangePosition;
  }, [onChangePosition]);

  const onResize = useCallback(({ left, top, width, height }) => {
    onChangePositionRef.current?.({
      top,
      left,
      width,
      height,
      bottom: undefined,
      right: undefined,
    });
  }, []);

  const dragBoxRef = useRef<HTMLDivElement | null>(null);
  const onMounted = useCallback((el) => {
    dragBoxRef.current = el;
  }, []);

  useEffect(() => {
    if (isSelected && dragBoxRef) {
      onSelectedMounted?.(dragBoxRef.current);
    }
  }, [isSelected, dragBoxRef, onSelectedMounted]);

  return (
    <Drag
      className={`mark ${isSelected ? 'mark-box__selected' : 'mark-box'} mark-box-status__${
        MissionStatus[status!] || 'create'
      }`}
      dragMoveHandler={`.mark-point__drag`}
      {...defPosition}
      onChange={onChangePositionRef.current}
      allowOutBound={false}
      position={!isFixed ? 'absolute' : 'fixed'}
      useTransform={false}
      dragPositionHandler={'.mark-point__drag'}
      disbaled={disabledDrag}
      onDragStart={() => onDragChange?.(true)}
      onDragEnd={() => onDragChange?.(false)}
      onMounted={onMounted}
    >
      <div className="flex f-fd-r">
        <ResizeRect
          className="mark-rect f-fs-0"
          // 此处需要和外面position保持一致，防止resize计算错误
          left={defPosition.left || 0}
          top={defPosition.top || 0}
          width={position.rect?.width || 0}
          height={position.rect?.height || 0}
          onResize={onResize}
          onResizeStart={() => onDragChange?.(true)}
          onResizeStop={() => onDragChange?.(false)}
          disbaled={disabledRectChange}
        />
        <div
          className={`mark-point ${disabledDrag ? 'mark-point-not-drag' : ''} flex f-fs-0 f-fd-r ${
            isSelected ? 'mark-point__selected' : ''
          }`}
          style={contentStyle}
        >
          <div
            className="mark-point__drag mark-point__icon flex f-fd-r f-jc-c f-ai-c f-fs-0"
            onClickCapture={() => {
              onClickLabel?.(missionId);
            }}
          >
            {index}
          </div>
          {(isSelected && (
            <div className="mark-point__comment">
              <Comment
                disabledPrev={isFirst}
                disabledNext={isLast}
                missionId={missionId}
                content={content}
                defaultContent={defaultContent}
                status={status}
                comment={comment}
                userIcon={userIcon}
                userName={userName}
                createdTime={createdTime}
                updatedTime={updatedTime}
                onSubmit={onSave}
                defaultImage={defaultImage}
                onChangeNext={onChangeNext}
                onChangePrev={onChangePrev}
                onChangeStatus={onChangeStatus}
                onDel={onDel}
                renderRichText={renderRichText}
              ></Comment>
            </div>
          )) ||
            null}
        </div>
      </div>
    </Drag>
  );
}
