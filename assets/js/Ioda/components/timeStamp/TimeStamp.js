import React, { Component } from "react";
import T from "i18n-react";
import { secondsToUTC } from "../../utils/timeUtils";
import { message } from "antd";

message.config({
  maxCount: 3,
});

const TimeStamp = ({ from, until, className }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const format = "MMM D, YYYY h:mma UTC";
  const fromDate = secondsToUTC(from).format(format);
  const untilDate = secondsToUTC(until).format(format);
  const timestamp = `${fromDate} - ${untilDate}`;

  const hoverTitle = T.translate("timestamp.hoverTitle");
  const copyToClipboardMessage = T.translate(
    "timestamp.copyToClipboardMessage"
  );

  const copyTimestamp = (timestamp) => {
    // copy to clipboard
    navigator.clipboard.writeText(timestamp);
    messageApi.open({
      type: "success",
      content: copyToClipboardMessage,
      duration: 1,
    });
  };

  return (
    <>
      {contextHolder}
      <div
        className={`text-right cursor-pointer italic text-lg ${className}`}
        onClick={() => copyTimestamp(timestamp)}
        title={hoverTitle}
      >
        {timestamp}
      </div>
    </>
  );
};

export default TimeStamp;
