export const LANG_KEY = "lang";
export const SIMPLIED_VIEW_KEY = "simplified_view";
// export const TIME_ZONE = "timezone";

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
