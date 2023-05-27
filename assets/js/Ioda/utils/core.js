import dayjs from "./dayjs";

export const MIN_IN_DAY = 24 * 60;

export const MS_IN_MIN = 60 * 1000;
export const MS_IN_HOUR = 60 * MS_IN_MIN;
export const MS_IN_DAY = 24 * MS_IN_HOUR;

export const LANG_KEY = "lang";
export const SIMPLIED_VIEW_KEY = "simplified_view";

export const getSavedLanguagePreference = () => {
  return localStorage.getItem(LANG_KEY) || "en";
};

export const saveLanguagePreference = (val) => {
  return localStorage.setItem(LANG_KEY, val);
};

export const getSavedAdvancedModePreference = () => {
  return !!localStorage.getItem(SIMPLIED_VIEW_KEY) || false;
};

export const saveAdvancedModePreference = (val) => {
  localStorage.removeItem(SIMPLIED_VIEW_KEY);
  if (val) {
    return localStorage.setItem(SIMPLIED_VIEW_KEY, val);
  }
};

export const millisecondsToSeconds = (milliseconds) => {
  return Math.floor(milliseconds / 1000);
};

export const secondsToMilliseconds = (seconds) => {
  return Math.floor(seconds * 1000);
};

export const millisecondsToUTC = (milliseconds) => {
  dayjs(milliseconds).toDate();
};

export const secondsToUTC = (seconds) => {
  const milliseconds = secondsToMilliseconds(seconds);
  return millisecondsToUTC(milliseconds);
};

export const getNowAsUTC = () => {
  return dayjs();
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
  return dayjs(milliseconds).format(format);
};

export const formatUTCSeconds = (
  seconds,
  format = "MMMM D, YYYY h:mma UTC"
) => {
  const milliseconds = secondsToMilliseconds(seconds);
  return formatUTCMilliseconds(milliseconds, format);
};
