export enum MissionStatus {
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
  status: MissionStatus;
  createdTime: number;
  updatedTime: number;
  initiator: number; // 用户id
  userName: string;
  userIcon: string;
  comment: Comment[];
};

export const MISSION_STATUS_MAP: Record<MissionStatus, string> = {
  [MissionStatus.ALL]: '全部',
  [MissionStatus.UNRESOLVED]: '未解决',
  [MissionStatus.RESOLVED]: '已解决',
  [MissionStatus.VERIFIED]: '已验证',
  [MissionStatus.CLOSED]: '无需解决',
};

// 保证顺序
export const MISSION_STATUS_LIST: MissionStatus[] = [
  MissionStatus.ALL,
  MissionStatus.UNRESOLVED,
  MissionStatus.RESOLVED,
  MissionStatus.VERIFIED,
  MissionStatus.CLOSED,
];
