export enum IMissionStatus {
  ALL = -1, // 请求传空
  UNRESOLVED,
  RESOLVED,
  VERIFIED,
  CLOSED,
}

export type Comment = {
  commentId: number;
  content: string;
  userName: string; // 用户名
  userIcon: string; //用户头像
  createdTime: number;
  updatedTime: number;
};

export type MissionItem = {
  missionName: string;
  missionId: number;
  content: string;
  location: string;
  fullPath: string;
  status: IMissionStatus;
  createdTime: number;
  updatedTime: number;
  initiator: number; // 用户id
  userName: string;
  userIcon: string;
  comment: Comment[];
};

export const MISSION_STATUS_MAP: Record<IMissionStatus, string> = {
  [IMissionStatus.ALL]: '全部',
  [IMissionStatus.UNRESOLVED]: '未解决',
  [IMissionStatus.RESOLVED]: '已解决',
  [IMissionStatus.VERIFIED]: '已验证',
  [IMissionStatus.CLOSED]: '无需解决',
};

// 保证顺序
export const MISSION_STATUS_LIST: IMissionStatus[] = [
  IMissionStatus.ALL,
  IMissionStatus.UNRESOLVED,
  IMissionStatus.RESOLVED,
  IMissionStatus.VERIFIED,
  IMissionStatus.CLOSED,
];
