import dayjs from "./dayjs";

export const MIN_IN_DAY = 24 * 60;

export const MS_IN_MIN = 60 * 1000;
export const MS_IN_HOUR = 60 * MS_IN_MIN;
export const MS_IN_DAY = 24 * MS_IN_HOUR;

export const millisecondsToSeconds = (milliseconds) => {
  return Math.floor(milliseconds / 1000);
};

export const secondsToMilliseconds = (seconds) => {
  return Math.floor(seconds * 1000);
};

export const millisecondsToUTC = (milliseconds) => {
  return dayjs.utc(milliseconds);
};

export const secondsToUTC = (seconds) => {
  const milliseconds = secondsToMilliseconds(seconds);
  return millisecondsToUTC(milliseconds);
};

export const millisecondsToTimezone= (milliseconds) => {
  const timezone = localStorage.getItem("timezone");
  return dayjs(milliseconds).tz(timezone);
};

export const secondsToTimeZone = (seconds) => {
  const milliseconds = secondsToMilliseconds(seconds);
  return millisecondsToTimezone(milliseconds);
};

export const getNowAsUTC = () => {
  return dayjs.utc();
};

// export const getSeconds = (dayjsObj, timezoneStr = 'UTC') => {
//   return millisecondsToSeconds(dayjs.tz(dayjsObj, timezoneStr).valueOf());
// };

export const getSeconds = (dayjsObj) => {
  return millisecondsToSeconds(dayjs.utc(dayjsObj).valueOf());
};

export const getNowAsUTCMilliseconds = () => {
  return getNowAsUTC().valueOf();
};

export const getNowAsUTCSeconds = () => {
  return millisecondsToSeconds(getNowAsUTCMilliseconds());
};

export const getPreviousMinutesAsUTCSecondRange = (minutes) => {
  const now = getNowAsUTCSeconds();
  return {
    start: now - minutes * millisecondsToSeconds(MS_IN_MIN),
    end: now,
  };
};

export const getCurrentAndPastTimeInSecondsForTimezone = (timezone) => {
  if (!timezone) {
    throw new Error('Timezone is required');
  }

  const currentTimeInMilliseconds = dayjs().tz(timezone).valueOf();

  const currentTimeInSeconds = Math.floor(currentTimeInMilliseconds / 1000);

  const time24HoursAgoInSeconds = currentTimeInSeconds - 24 * 60 * 60;

  return {
    start: time24HoursAgoInSeconds,
    end: currentTimeInSeconds
  };
};

export const formatUTCMilliseconds = (
  milliseconds,
  format = "MMMM D, YYYY h:mma UTC"
) => {
  return dayjs.utc(milliseconds).format(format);
};

export const formatUTCSeconds = (
  seconds,
  format = "MMMM D, YYYY h:mma UTC"
) => {
  const milliseconds = secondsToMilliseconds(seconds);
  return formatUTCMilliseconds(milliseconds, format);
};

export const getSecondsAsDurationString = (seconds) => {
  return dayjs
    .duration(secondsToMilliseconds(seconds))
    .format("Y[y] M[m] D[d] H[h] m[m] s[s]")
    .replace(/\b0y\b/, "")
    .replace(/\b0m\b/, "")
    .replace(/\b0d\b/, "")
    .replace(/\b0h\b/, "")
    .replace(/\b0m\b/, "")
    .replace(/\b0s\b/, "")
    .trim();
};

export const getSecondsAsErrorDurationString = (seconds) => {
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600 * 24));
  var h = Math.floor((seconds % (3600 * 24)) / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  var s = Math.floor(seconds % 60);

  var dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : "";
  var hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
  var mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : "";
  var sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";
  return (dDisplay + hDisplay + mDisplay + sDisplay).replace(/,\s*$/, "");
};
