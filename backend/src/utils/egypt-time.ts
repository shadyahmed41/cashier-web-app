import * as moment from 'moment-timezone';

export function getEgyptDate() {
  return moment().tz('Africa/Cairo').format('YYYY-MM-DD');
}

export function getEgyptTime() {
  return moment().tz('Africa/Cairo').format('hh:mm A'); // 12-hour format
}
