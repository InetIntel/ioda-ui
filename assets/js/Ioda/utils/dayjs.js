import dayjs from "dayjs";
const utc = require("dayjs/plugin/utc");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const duration = require("dayjs/plugin/duration");
dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.extend(duration);

export default dayjs;
