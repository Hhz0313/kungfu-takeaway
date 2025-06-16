import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export const formatTimeInChina = (dateString) => {
  if (!dateString) {
    return 'N/A';
  }

  // Use dayjs to parse the UTC date string and convert it to Shanghai time
  return dayjs.utc(dateString).tz('Asia/Shanghai').format('YYYY/MM/DD HH:mm:ss');
}; 