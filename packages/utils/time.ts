import dayjs from 'dayjs';

export const formatTime = (time?: string | number | Date | dayjs.Dayjs | null | undefined) => {
  return time ? dayjs(time)?.format?.('YYYY-MM-DD HH:mm') : ''
}