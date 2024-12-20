import dayjs from "./dayjs";

export const pushWithParams = ({ entityType, entityCode, from, until }) => {};

// export const getDateRangeFromUrl = () => {
//   const urlParams = new URLSearchParams(window.location.search);
//   const urlFromDate = urlParams.get("from") ?? null;
//   const urlUntilDate = urlParams.get("until") ?? null;
//
//   return {
//     urlFromDate: urlFromDate ? parseInt(urlFromDate) : null,
//     urlUntilDate: urlUntilDate ? parseInt(urlUntilDate) : null,
//   };
// };

// const getSeconds = (dayjsObj) => {
//   return Math.floor(dayjsObj.valueOf() / 1000);
// };
//
// const secondsToMilliseconds = (seconds) => seconds * 1000;
//
// export const getDateRangeFromUrl = () => {
//   const urlParams = new URLSearchParams(window.location.search);
//   const urlFromDate = urlParams.get("from") ?? null;
//   const urlUntilDate = urlParams.get("until") ?? null;
//
//   // Retrieve timezone from localStorage or default to UTC
//   const userTimezone = localStorage.getItem("timezone") || "UTC";
//   console.log(userTimezone)
//
//   return {
//     urlFromDate: urlFromDate
//         ? getSeconds(dayjs.tz(secondsToMilliseconds(parseInt(urlFromDate)), userTimezone))
//         : null,
//     urlUntilDate: urlUntilDate
//         ? getSeconds(dayjs.tz(secondsToMilliseconds(parseInt(urlUntilDate)), userTimezone))
//         : null,
//   };
// };


export const getDateRangeFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlFromDate = urlParams.get("from") ?? null;
  const urlUntilDate = urlParams.get("until") ?? null;

  // console.log(urlFromDate)
  // console.log(urlUntilDate)

  // Retrieve timezone from localStorage or default to UTC
  const userTimezone = localStorage.getItem("timezone") || "UTC";
  // console.log("Timezone:", userTimezone);
  // console.log(dayjs.unix(parseInt(urlFromDate))
  //     .tz(userTimezone) // Convert to the user's timezone
  //     .unix())
  // console.log(dayjs.unix(parseInt(urlUntilDate))
  //     .tz(userTimezone)
  //     .unix())
  return {
    urlFromDate: urlFromDate
        ? dayjs.unix(parseInt(urlFromDate))
            .tz(userTimezone) // Convert to the user's timezone
            .unix() // Convert back to Unix timestamp in the user's timezone
        : null,
    urlUntilDate: urlUntilDate
        ? dayjs.unix(parseInt(urlUntilDate))
            .tz(userTimezone)
            .unix()
        : null,
  };
};

export const hasDateRangeInUrl = () => {
  const { urlFromDate, urlUntilDate } = getDateRangeFromUrl();
  return !!(urlFromDate && urlUntilDate);
};
