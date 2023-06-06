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

export const getNowAsUTC = () => {
  return dayjs.utc();
};

export const getSeconds = (dayjsObj) => {
  return millisecondsToSeconds(dayjsObj.valueOf());
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
