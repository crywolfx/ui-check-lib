import React, { ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import { Button, Spin, Dropdown, Menu, Popconfirm } from 'antd';
import { EllipsisOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { MissionItem } from '@/constant';
import MissionStatus from '@/components/MissionStatus/src';
import RichTextPreview from '@/components/RichTextPreview';
import User from '@/components/User';
import { IMissionStatus as MissionStatusEnum } from '@/constant';
import { isFunction } from '@/utils/type';
import { useSafeState } from 'ahooks';
import './index.less'

export type ICommentItem = {
  text: string;
  timestamp: number;
};
type MissionComment = Partial<
  Pick<
    MissionItem,
    | 'missionId'
    | 'content'
    | 'createdTime'
    | 'updatedTime'
    | 'userName'
    | 'userIcon'
    | 'initiator'
    | 'comment'
    | 'status'
  >
>;

export type OnDel = (type: 'mission' | 'comment', id?: number) => Promise<any>;

type CommentType = MissionComment & {
  defaultContent?: string;
  defaultImage?: string;
  disabledPrev?: boolean;
  disabledNext?: boolean;
  loading?: boolean;
  renderRichText?: ({
    onSubmit,
  }: {
    onSubmit: (data: { html: string; mentions: string[] }) => Promise<any>;
  }) => ReactNode;
  onChangeStatus?: (missionId: number, status: MissionStatusEnum) => Promise<any>;
  onSubmit: (data: { html: string; mentions: string[], missionId?: number }) => Promise<any>;
  onChangeNext?: (missionId: number | undefined) => void;
  onChangePrev?: (missionId: number | undefined) => void;
  onDel?: OnDel;
};

export function CommentItem({
  isMission,
  userName,
  userIcon,
  updateTime,
  content,
  onDel,
}: {
  isMission?: boolean;
  userName: string;
  userIcon: string;
  updateTime: number;
  content: string;
  onDel?: () => void;
}) {
  const userInfo:any = {};
  const contentRef = useRef<HTMLDivElement | null>(null);
  // const onEdit = useCallback(() => {}, []);
  const menu = useMemo(
    () => (
      <Menu>
        {/* <Menu.Item onClick={onEdit}>编辑</Menu.Item> */}
        {onDel ? (
          <Popconfirm
            title={
              <>
                <div className="mark-del-title">
                  {isMission ? '确认删除此标注？' : '确认删除此评论？'}
                </div>
                {isMission ? (
                  <div className="mark-del-info">删除此条标注后下方评论将同步删除</div>
                ) : null}
              </>
            }
            overlayClassName="mark-del__popconfirm"
            onConfirm={onDel}
            okText="删除"
            cancelText="取消"
            placement="top"
            okType="danger"
          >
            <Menu.Item>删除</Menu.Item>
          </Popconfirm>
        ) : null}
      </Menu>
    ),
    [isMission, onDel],
  );

  return (
    <div className="mark-comment-item" ref={contentRef}>
      <div className="mark-comment-item__header flex f-ai-c f-fd-r f-jc-sb">
        <User userName={userName} userIcon={userIcon} time={updateTime} />
        {userName === userInfo?.username ? (
          <Dropdown
            overlay={menu}
            getPopupContainer={() => contentRef.current as HTMLElement}
            placement="bottomLeft"
          >
            <EllipsisOutlined className="mark-comment-item__control pointer" />
          </Dropdown>
        ) : null}
      </div>
      <div className="mark-comment-item__content">
        <RichTextPreview content={content} />
      </div>
    </div>
  );
}

export default function Comment(props: CommentType) {
  const {
    missionId,
    userIcon,
    userName,
    content,
    status = MissionStatusEnum.UNRESOLVED,
    createdTime,
    updatedTime,
    comment = [],
    defaultImage,
    disabledPrev = false,
    disabledNext = false,
    loading = false,
    renderRichText,
    onChangeStatus,
    onChangeNext,
    onChangePrev,
    onSubmit,
    onDel,
  } = props;
  const [isSubmiting, setIsSubmit] = useSafeState(false);
  useEffect(() => {
    setIsSubmit(loading);
  }, [loading, setIsSubmit]);

  const handleSubmit = useCallback(
    (data: { html: string, mentions: string[] }) => {
      if (isFunction(onSubmit)) {
        setIsSubmit(true);
        return onSubmit?.({ ...data, missionId }).finally(() => {
          setIsSubmit(false);
        });
      } else {
        return Promise.reject();
      }
    },
    [missionId, onSubmit, setIsSubmit],
  );

  const handleChangeStatus = useCallback(
    (_status) => {
      if (missionId && onChangeStatus) {
        setIsSubmit(true);
        onChangeStatus?.(missionId, _status).finally(() => {
          setIsSubmit(false);
        });
      }
    },
    [missionId, onChangeStatus, setIsSubmit],
  );

  const handleDelete = useCallback(
    (type: 'mission' | 'comment', id?: number) => {
      if (id && onDel) {
        setIsSubmit(true);
        onDel?.(type, id).finally(() => {
          setIsSubmit(false);
        });
      }
    },
    [onDel, setIsSubmit],
  );

  return (
    <div className="mark-comment">
      <Spin spinning={isSubmiting} className="mark-comment-loading">
        {(content && (
          <div className="mark-comment__info">
            <div className="mark-comment__info-header flex f-fd-r f-ai-c f-jc-sb">
              <div className="mark-comment__info-header-button">
                <Button
                  size="small"
                  disabled={disabledPrev}
                  onClick={() => onChangePrev?.(missionId)}
                >
                  <LeftOutlined />
                </Button>
                <Button
                  size="small"
                  disabled={disabledNext}
                  onClick={() => onChangeNext?.(missionId)}
                >
                  <RightOutlined />
                </Button>
              </div>
              <MissionStatus status={status} onChangeStatus={handleChangeStatus} />
            </div>
            <CommentItem
              isMission
              onDel={() => handleDelete?.('mission', missionId)}
              userName={userName || ''}
              userIcon={userIcon || ''}
              content={content || ''}
              updateTime={updatedTime || createdTime || 0}
            />
            {comment?.map((item) => (
              <CommentItem
                onDel={() => handleDelete?.('comment', item.commentId)}
                key={item.commentId}
                userName={item.userName}
                userIcon={item.userIcon}
                content={item.content}
                updateTime={item.updatedTime || item.createdTime || 0}
              />
            ))}
          </div>
        )) ||
          null}
        {renderRichText?.({ onSubmit: (data) => handleSubmit(data) })}
      </Spin>
    </div>
  );
}
