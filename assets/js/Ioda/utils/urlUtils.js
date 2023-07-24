export const pushWithParams = ({ entityType, entityCode, from, until }) => {};

export const getDateRangeFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlFromDate = urlParams.get("from") ?? null;
  const urlUntilDate = urlParams.get("until") ?? null;

  return {
    urlFromDate: urlFromDate ? parseInt(urlFromDate) : null,
    urlUntilDate: urlUntilDate ? parseInt(urlUntilDate) : null,
  };
};

export const hasDateRangeInUrl = () => {
  const { urlFromDate, urlUntilDate } = getDateRangeFromUrl();
  return !!(urlFromDate && urlUntilDate);
};
