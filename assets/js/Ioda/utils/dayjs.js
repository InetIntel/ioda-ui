import dayjs from "dayjs";
const utc = require("dayjs/plugin/utc");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(utc);
dayjs.extend(customParseFormat);

export default dayjs;
