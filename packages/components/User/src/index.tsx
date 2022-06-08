import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import './index.less'

export default function User({
  userName,
  userIcon,
  time,
}: {
  userName: string;
  userIcon: string;
  time?: number;
}) {
  const formatedTime = useMemo(() => {
    return time ? dayjs(time)?.format?.('YYYY-MM-DD HH:mm') : '';
  }, [time]);
  return (
    <div className="user-info flex f-fd-r f-ai-c">
      <img className="user-avator f-fs-0" src={userIcon} />
      <div className="user-name f-fs-0">{userName}</div>
      <div className="user-time f-fs-0">{formatedTime}</div>
    </div>
  );
}
