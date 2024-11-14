import dayjs from "dayjs";
const utc = require("dayjs/plugin/utc");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const duration = require("dayjs/plugin/duration");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.extend(duration);
dayjs.extend(timezone);

export default dayjs;
