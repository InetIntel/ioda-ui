import dayjs from "./dayjs";

const LANG_KEY = "lang";
const SIMPLIED_VIEW_KEY = "simplified_view";

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
