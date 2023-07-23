import React, { Component } from "react";
import { Table } from "antd";
import { CheckSquareFilled, CloseSquareFilled } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import { secondsToUTC } from "../../utils/timeUtils";
import T from "i18n-react";

const dateStampTitle = T.translate("table.alertHeaders.timeStamp");
const dataSourceTitle = T.translate("table.alertHeaders.dataSource");
const actualValueTitle = T.translate("table.alertHeaders.actualValue");
const baselineValueTitle = T.translate("table.alertHeaders.baselineValue");

const translateDataSource = (dataSource) => {
  if (dataSource === "ping-slash24") {
    return T.translate("table.alertLabels.activeProbing");
  } else if (dataSource === "bgp") {
    return T.translate("table.alertLabels.bgp");
  } else if (dataSource === "ucsd-nt") {
    return T.translate("table.alertLabels.darknet");
  } else if (dataSource === "merit-nt") {
    return T.translate("table.alertLabels.merit");
  } else {
    return null;
  }
};

const columns = [
  {
    title: "",
    dataIndex: "level",
    key: "level",
    width: "34px",
    render(value) {
      if (value === "critical") {
        return (
          <div className="text-center">
            <CloseSquareFilled style={{ color: "#C10015", fontSize: "18px" }} />
          </div>
        );
      } else if (value === "normal") {
        return (
          <div className="text-center">
            <CheckSquareFilled style={{ color: "#21BA45", fontSize: "18px" }} />
          </div>
        );
      }
      return null;
    },
    sorter: (a, b) => a.level.localeCompare(b.level),
  },
  {
    title: dateStampTitle,
    dataIndex: "time",
    key: "time",
    width: "35%",
    render(value) {
      return secondsToUTC(value).format("MMM D, YYYY h:mma");
    },
    sorter: (a, b) => a.time - b.time,
  },
  {
    title: dataSourceTitle,
    dataIndex: "dataSource",
    key: "dataSource",
    render: (value) => translateDataSource(value),
    sorter: (a, b) => a.dataSource?.localeCompare(b.dataSource),
  },
  {
    title: actualValueTitle,
    dataIndex: "actualValue",
    key: "actualValue",
    sorter: (a, b) => a.actualValue - b.actualValue,
  },
  {
    title: baselineValueTitle,
    dataIndex: "baselineValue",
    key: "baselineValue",
    sorter: (a, b) => a.baselineValue - b.baselineValue,
  },
];

const AlertsTable = ({ data }) => {
  // Take values from api and format for Alert table
  const formattedData = (data ?? [])
    .map((alert) => ({
      key: uuidv4(),
      entityName: alert.entity.name,
      level: alert.level,
      time: alert.time,
      dataSource: alert.datasource,
      actualValue: alert.value,
      baselineValue: alert.historyValue,
    }))
    .reverse();

  return (
    <div className="ioda-table">
      <Table
        sticky
        bordered
        size="small"
        columns={columns}
        pagination={false}
        dataSource={formattedData}
        rowKey={(alert) => alert.key}
        rowClassName={() => "text-lg"}
        scroll={{ y: "450px" }}
        rootClassName="card"
      />
      <div className="w-full mt-3 text-left text-xl">
        Showing {formattedData.length} alerts
      </div>
    </div>
  );
};

export default AlertsTable;
