import React, { Component } from "react";
import { Table } from "antd";
import { v4 as uuidv4 } from "uuid";
import { secondsToUTC } from "../../utils/timeUtils";
import T from "i18n-react";
import { humanizeNumber } from "../../utils";
import * as sd from "simple-duration";

const getColumnsFromEntityType = (entityType) => {
  const nameTitle =
    entityType === "asn"
      ? T.translate("table.signalHeaders.nameAsn")
      : entityType === "region"
      ? T.translate("table.signalHeaders.nameRegion")
      : T.translate("table.signalHeaders.nameCountry");
  const ipCountTitle = T.translate("table.signalHeaders.duration");
  const scoreTitle = T.translate("table.signalHeaders.score");

  if (entityType === "asn") {
    return [
      {
        title: nameTitle,
        dataIndex: "name",
        key: "name",
        sorter: (a, b) => a.localeCompare(b),
      },
      {
        title: ipCountTitle,
        dataIndex: "ipCount",
        key: "duration",
        render: (value) => sd.stringify(value, "s"),
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
  } else {
    [
      {
        title: nameTitle,
        dataIndex: "name",
        key: "name",
        sorter: (a, b) => a.localeCompare(b),
      },
      {
        title: scoreTitle,
        dataIndex: "score",
        key: "score",
        render: (value) => humanizeNumber(value),
        sorter: (a, b) => a.score - b.score,
      },
    ];
  }
};

const RawSignalsTable = ({ data, entityType }) => {
  const columns = getColumnsFromEntityType(entityType);

  // Take values from api and format for Alert table
  const formattedData = (data ?? []).map((event) => {
    return {
      key: uuidv4(),
      name: event.start,
      ipCount: event.ipCount,
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
        Showing {formattedData.length} entries
      </div>
    </div>
  );
};

export default RawSignalsTable;
