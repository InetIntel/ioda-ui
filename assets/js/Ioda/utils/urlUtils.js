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

export const getEntityDataFromUrl = () => {
  const urlEntityType = window.location.pathname.split("/")[1] ?? null;
  const urlEntityCode = window.location.pathname.split("/")[2] ?? null;

  return {
    urlEntityType,
    urlEntityCode,
  };
};
