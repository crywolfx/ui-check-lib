import React from 'react';
import { Select } from 'antd';
import { IMissionStatus, MISSION_STATUS_MAP } from '@/constant';
import './index.less';

const { Option } = Select;

const MISSION_STATUS_LIST: IMissionStatus[] = [
  IMissionStatus.UNRESOLVED,
  IMissionStatus.RESOLVED,
  IMissionStatus.VERIFIED,
  IMissionStatus.CLOSED,
];
export default function MissionStatus({
  status,
  onChangeStatus,
}: {
  status: IMissionStatus;
  onChangeStatus: (status: IMissionStatus) => void;
}) {
  return (
    <Select
      size="small"
      className={`mission-status mission-status-${IMissionStatus[status]}`}
      value={status}
      onChange={onChangeStatus}
      dropdownMatchSelectWidth={false}
    >
      {MISSION_STATUS_LIST.map((value) => (
        <Option value={value} key={value}>
          {MISSION_STATUS_MAP[value]}
        </Option>
      ))}
    </Select>
  );
}
