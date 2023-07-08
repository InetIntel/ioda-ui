import React, { Component } from "react";
import { Table } from "antd";
import { v4 as uuidv4 } from "uuid";
import {
  getSecondsAsDurationString,
  secondsToUTC,
} from "../../utils/timeUtils";
import T from "i18n-react";
import { humanizeNumber } from "../../utils";

const fromDateTitle = T.translate("table.eventHeaders.fromDate");
const untilDateTitle = T.translate("table.eventHeaders.untilDate");
const durationTitle = T.translate("table.eventHeaders.duration");
const scoreTitle = T.translate("table.eventHeaders.score");

const columns = [
  {
    title: fromDateTitle,
    dataIndex: "fromDate",
    key: "fromDate",
    render: (value) => secondsToUTC(value).format("MMM D, YYYY h:mma"),
    sorter: (a, b) => a.fromDate - b.fromDate,
  },
  {
    title: untilDateTitle,
    dataIndex: "untilDate",
    key: "untilDate",
    render: (value) => secondsToUTC(value).format("MMM D, YYYY h:mma"),
    sorter: (a, b) => a.untilDate - b.untilDate,
  },
  {
    title: durationTitle,
    dataIndex: "duration",
    key: "duration",
    render: (value) => getSecondsAsDurationString(value),
    sorter: (a, b) => a.duration - b.duration,
  },
  {
    title: scoreTitle,
    dataIndex: "score",
    key: "score",
    render: (value) => humanizeNumber(value),
    sorter: (a, b) => a.score - b.score,
  },
];

const EventsTable = ({ data }) => {
  // Take values from api and format for Alert table
  const formattedData = (data ?? []).map((event) => {
    return {
      key: uuidv4(),
      fromDate: event.start,
      untilDate: event.start + event.duration,
      duration: event.duration,
      score: event.score,
    };
  });

  return (
    <div className="ioda-table">
      <Table
        sticky
        bordered
        size="small"
        columns={columns}
        pagination={false}
        dataSource={formattedData}
        rowKey={(event) => event.key}
        rowClassName={() => "text-lg"}
        scroll={{ y: "450px" }}
        rootClassName="card"
      />
      <div className="w-full mt-3 text-left text-xl">
        Showing {formattedData.length} events
      </div>
    </div>
  );
};

export default EventsTable;
