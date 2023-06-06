import React, { Component } from "react";
import T from "i18n-react";
import Tooltip from "../../components/tooltip/Tooltip";
import dayjs from "../../utils/dayjs";

import { DatePicker, Button, Dropdown } from "antd";
import {
  getNowAsUTC,
  secondsToUTC,
  getSeconds,
  getNowAsUTCSeconds,
} from "../../utils/timeUtils";
import { ClockCircleOutlined, CloseOutlined } from "@ant-design/icons";
const { RangePicker } = DatePicker;

const RANGES = {
  LAST_60_MINS: "last_60_mins",
  LAST_24_HOURS: "last_24_hours",
  LAST_7_DAYS: "last_7_days",
  LAST_30_DAYS: "last_30_days",
  THIS_MONTH: "this_month",
};

class ControlPanel extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { from, until } = this.props;
    const defaultDateRange = [secondsToUTC(from), secondsToUTC(until)];

    const tooltipSearchBarTitle = T.translate("tooltip.searchBar.title");
    const tooltipSearchBarText = T.translate("tooltip.searchBar.text");
    const tooltipTimeRangeTitle = T.translate("tooltip.timeRange.title");
    const tooltipTimeRangeText = T.translate("tooltip.timeRange.text");

    const onRangeChange = ([fromDayjs, untilDayjs]) => {
      this.props.onTimeFrameChange({
        from: getSeconds(fromDayjs),
        until: getSeconds(untilDayjs),
      });
    };

    const menuItems = [
      {
        key: RANGES.LAST_60_MINS,
        label: "- 60 mins",
      },
      {
        key: RANGES.LAST_24_HOURS,
        label: "- 24 hours",
      },
      {
        key: RANGES.LAST_7_DAYS,
        label: "- 7 days",
      },
      {
        key: RANGES.LAST_30_DAYS,
        label: "- 30 days",
      },
      {
        key: RANGES.THIS_MONTH,
        label: "This Month",
      },
    ];

    const handlePredefinedRangeSelection = ({ key }) => {
      if (key === RANGES.LAST_60_MINS) {
        this.props.onTimeFrameChange({
          from: getSeconds(getNowAsUTC().subtract(60, "minute")),
          until: getNowAsUTCSeconds(),
        });
      } else if (key === RANGES.LAST_24_HOURS) {
        this.props.onTimeFrameChange({
          from: getSeconds(getNowAsUTC().subtract(24, "hour")),
          until: getNowAsUTCSeconds(),
        });
      } else if (key === RANGES.LAST_7_DAYS) {
        this.props.onTimeFrameChange({
          from: getSeconds(getNowAsUTC().subtract(7, "day")),
          until: getNowAsUTCSeconds(),
        });
      } else if (key === RANGES.LAST_30_DAYS) {
        this.props.onTimeFrameChange({
          from: getSeconds(getNowAsUTC().subtract(30, "day")),
          until: getNowAsUTCSeconds(),
        });
      } else if (key === RANGES.THIS_MONTH) {
        this.props.onTimeFrameChange({
          from: getSeconds(dayjs.utc().startOf("month")),
          until: getSeconds(dayjs.utc().endOf("month")),
        });
      }
    };

    return (
      <div className="row control-panel">
        <div className="col-1-of-3">
          <div className="searchbar">
            <div className="flex items-center">
              <T.p
                text={"controlPanel.searchBarPlaceholder"}
                className="text-lg"
              />
              <Tooltip
                title={tooltipSearchBarTitle}
                text={tooltipSearchBarText}
              />
            </div>
            {this.props.searchbar()}
          </div>

          <div className="flex items-center">
            <T.p text={"controlPanel.timeRange"} className="text-lg" />
            <Tooltip
              title={tooltipTimeRangeTitle}
              text={tooltipTimeRangeText}
            />
          </div>
          <div className="flex items-center">
            <Dropdown
              menu={{
                items: menuItems,
                onClick: handlePredefinedRangeSelection,
              }}
              placement="bottomLeft"
              trigger="click"
            >
              <Button
                className="mr-3"
                icon={<ClockCircleOutlined />}
                type="primary"
              />
            </Dropdown>
            <RangePicker
              value={defaultDateRange}
              showTime={{ format: "h:mm A" }}
              format="MMM D YYYY h:mm A UTC"
              onChange={onRangeChange}
              onOk={onRangeChange}
            />
          </div>
        </div>
        <div className="col-2-of-3">
          <div className="control-panel__title flex items-center">
            <h1 className="text-4xl mr-3">{this.props.title}</h1>
            {this.props.onClose && (
              <Button
                icon={<CloseOutlined />}
                onClick={() => this.props.onClose()}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default ControlPanel;
