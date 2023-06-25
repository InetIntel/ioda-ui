import React, { Component } from "react";
import T from "i18n-react";
import Tooltip from "../../components/tooltip/Tooltip";
import dayjs from "../../utils/dayjs";

import {
  DatePicker,
  Button,
  Popover,
  InputNumber,
  Select,
  Divider,
} from "antd";
import { getNowAsUTC, secondsToUTC, getSeconds } from "../../utils/timeUtils";
import { ClockCircleOutlined, CloseOutlined } from "@ant-design/icons";
const { RangePicker } = DatePicker;

const RANGES = {
  LAST_60_MINS: "last_60_mins",
  LAST_24_HOURS: "last_24_hours",
  LAST_7_DAYS: "last_7_days",
  LAST_30_DAYS: "last_30_days",
  THIS_MONTH: "this_month",
};

const UNITS = {
  MINUTE: "minute",
  HOUR: "hour",
  DAY: "day",
  WEEK: "week",
};

class ControlPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      popoutOpen: false,
      customDuration: 1,
      customUnit: UNITS.DAY,
      range: [secondsToUTC(props.from), secondsToUTC(props.until)],
    };
  }

  handlePopoutOpen = (val) => {
    this.setState({ popoutOpen: val });
  };

  handleCustomDurationChange = (val) => {
    this.setState({ customDuration: val });
  };

  handleCustomUnitChange = (val) => {
    this.setState({ customUnit: val });
  };

  handleRangeChange = ([fromDayjs, untilDayjs]) => {
    this.setState({ range: [fromDayjs, untilDayjs] }, () => {
      this.props.onTimeFrameChange({
        from: getSeconds(fromDayjs.add(fromDayjs.utcOffset(), "minute")),
        until: getSeconds(untilDayjs.add(untilDayjs.utcOffset(), "minute")),
      });
    });
  };

  handleCustomRange = () => {
    const { customDuration, customUnit } = this.state;
    const from = getNowAsUTC().subtract(customDuration, customUnit);
    const until = getNowAsUTC();
    this.handleRangeChange([from, until]);
    this.handlePopoutOpen(false);
  };

  handlePredefinedRangeSelection = ({ value }) => {
    if (value === RANGES.LAST_60_MINS) {
      this.handleRangeChange([
        getNowAsUTC().subtract(60, "minute"),
        getNowAsUTC(),
      ]);
    } else if (value === RANGES.LAST_24_HOURS) {
      this.handleRangeChange([
        getNowAsUTC().subtract(24, "hour"),
        getNowAsUTC(),
      ]);
    } else if (value === RANGES.LAST_7_DAYS) {
      this.handleRangeChange([getNowAsUTC().subtract(7, "day"), getNowAsUTC()]);
    } else if (value === RANGES.LAST_30_DAYS) {
      this.handleRangeChange([
        getNowAsUTC().subtract(30, "day"),
        getNowAsUTC(),
      ]);
    } else if (value === RANGES.THIS_MONTH) {
      this.handleRangeChange([
        dayjs.utc().startOf("month"),
        dayjs.utc().endOf("month"),
      ]);
    }

    this.handlePopoutOpen(false);
  };

  render() {
    const tooltipSearchBarTitle = T.translate("tooltip.searchBar.title");
    const tooltipSearchBarText = T.translate("tooltip.searchBar.text");
    const tooltipTimeRangeTitle = T.translate("tooltip.timeRange.title");
    const tooltipTimeRangeText = T.translate("tooltip.timeRange.text");

    const predefinedRanges = [
      {
        value: RANGES.LAST_60_MINS,
        label: "- 60 mins",
      },
      {
        value: RANGES.LAST_24_HOURS,
        label: "- 24 hours",
      },
      {
        value: RANGES.LAST_7_DAYS,
        label: "- 7 days",
      },
      {
        value: RANGES.LAST_30_DAYS,
        label: "- 30 days",
      },
      {
        value: RANGES.THIS_MONTH,
        label: "This Month",
      },
    ];

    const customUnitOptions = [
      {
        value: UNITS.MINUTE,
        label: "mins",
      },
      {
        value: UNITS.HOUR,
        label: "hours",
      },
      {
        value: UNITS.DAY,
        label: "days",
      },
      {
        value: UNITS.WEEK,
        label: "weeks",
      },
    ];

    const predefinedRangeGrid = (
      <div className="flex flex-column gap-2 mb-3">
        {predefinedRanges.map((item) => (
          <Button
            key={item.value}
            onClick={() => this.handlePredefinedRangeSelection(item)}
          >
            {item.label}
          </Button>
        ))}
      </div>
    );

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
            <Popover
              overlayStyle={{
                width: 240,
              }}
              placement="bottomLeft"
              trigger="click"
              open={this.state.popoutOpen}
              onOpenChange={this.handlePopoutOpen}
              content={
                <div>
                  {predefinedRangeGrid}
                  <Divider className="my-4" />
                  <div className="flex gap-1 items-center mb-3">
                    <span className="text-xl mr-1">Last</span>
                    <InputNumber
                      value={this.state.customDuration}
                      onChange={this.handleCustomDurationChange}
                      min={1}
                      size="small"
                      style={{ maxWidth: 60 }}
                    />
                    <Select
                      className="col"
                      value={this.state.customUnit}
                      onChange={this.handleCustomUnitChange}
                      options={customUnitOptions}
                      size="small"
                      style={{ width: 80 }}
                    />
                    <Button
                      type="primary"
                      size="small"
                      onClick={this.handleCustomRange}
                    >
                      Go
                    </Button>
                  </div>
                </div>
              }
            >
              <Button
                className="mr-3"
                icon={<ClockCircleOutlined />}
                type="primary"
              />
            </Popover>
            <RangePicker
              className="col"
              value={this.state.range}
              showTime={{ format: "h:mmA" }}
              format="MMM D YYYY h:mma UTC"
              onChange={this.handleRangeChange}
              onOk={this.handleRangeChange}
            />
          </div>
        </div>
        <div className="col-2-of-3">
          <div className="control-panel__title flex items-center">
            <h1 className="text-4xl mr-3 text-right">{this.props.title}</h1>
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
