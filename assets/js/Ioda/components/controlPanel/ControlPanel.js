import React from "react";
import { useState } from "react";
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

const ControlPanel = ({from, until, searchbar, onTimeFrameChange, onClose, title}) => {

  const [popoutOpen, setPopoutOpen] = useState(false);
  const [customDuration, setCustomDuration] = useState(1);
  const [customUnit, setCustomUnit] = useState(UNITS.DAY);
  const [range, setRange] = useState([secondsToUTC(from), secondsToUTC(until)]);

  const handlePopoutOpen = (val) => {
    setPopoutOpen(val);
  };

  const handleCustomDurationChange = (val) => {
    setCustomDuration(val)
  };

  const handleCustomUnitChange = (val) => {
    setCustomUnit(val);
  };

  const handleRangeChange = ([fromDayjs, untilDayjs]) => {
    setRange([fromDayjs, untilDayjs]);

    onTimeFrameChange({
      from: getSeconds(fromDayjs.add(fromDayjs.utcOffset(), 'minute')),
      until: getSeconds(untilDayjs.add(untilDayjs.utcOffset(), 'minute')),
    });
  };

  const handleCustomRange = () => {
    const from = getNowAsUTC().subtract(customDuration, customUnit);
    const until = getNowAsUTC();
    handleRangeChange([from, until]);
    handlePopoutOpen(false);
  };

  const handlePredefinedRangeSelection = ({ value }) => {
    if (value === RANGES.LAST_60_MINS) {
      handleRangeChange([
        getNowAsUTC().subtract(60, "minute"),
        getNowAsUTC(),
      ]);
    } else if (value === RANGES.LAST_24_HOURS) {
      handleRangeChange([
        getNowAsUTC().subtract(24, "hour"),
        getNowAsUTC(),
      ]);
    } else if (value === RANGES.LAST_7_DAYS) {
      handleRangeChange([getNowAsUTC().subtract(7, "day"), getNowAsUTC()]);
    } else if (value === RANGES.LAST_30_DAYS) {
      handleRangeChange([
        getNowAsUTC().subtract(30, "day"),
        getNowAsUTC(),
      ]);
    } else if (value === RANGES.THIS_MONTH) {
      handleRangeChange([
        dayjs.utc().startOf("month"),
        dayjs.utc().endOf("month"),
      ]);
    }

    handlePopoutOpen(false);
  };


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
                className="w-full"
                onClick={() => handlePredefinedRangeSelection(item)}
            >
              {item.label}
            </Button>
        ))}
      </div>
  );

  return (
      <div className="flex items-start card p-6 mb-6 control-panel">
        <div className="control-panel__controls col-1">
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
            {searchbar()}
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
                open={popoutOpen}
                onOpenChange={handlePopoutOpen}
                content={
                  <div>
                    {predefinedRangeGrid}
                    <Divider className="my-4" />
                    <div className="flex gap-1 items-center mb-3">
                      <span className="text-xl mr-1">Last</span>
                      <InputNumber
                          value={customDuration}
                          onChange={handleCustomDurationChange}
                          min={1}
                          size="small"
                          style={{ maxWidth: 60 }}
                      />
                      <Select
                          className="col"
                          value={customUnit}
                          onChange={handleCustomUnitChange}
                          options={customUnitOptions}
                          size="small"
                          style={{ width: 80 }}
                      />
                      <Button
                          type="primary"
                          size="small"
                          onClick={handleCustomRange}
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
                value={range}
                showTime={{ format: "h:mmA" }}
                format="MMM D YYYY h:mma UTC"
                onChange={handleRangeChange}
                onOk={handleRangeChange}
            />
          </div>
        </div>
        <div className="col-1 w-full flex items-center gap-3 justify-end mb-4 control-panel__title">
          <h1 className="text-4xl text-right">{title}</h1>
          {onClose && (
              <Button
                  icon={<CloseOutlined />}
                  onClick={() => onClose()}
              />
          )}
        </div>
      </div>
  );
}

export default ControlPanel;
