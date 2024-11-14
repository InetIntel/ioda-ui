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
    const [countrySearch, setCountrySearch] = useState("");
    const [regionSearch, setRegionSearch] = useState("");
    const [asnSearch, setAsnSearch] = useState("");

    const handleRegionChange = (e) => {
        setRegion(e.target.value);
    };

    function handlePopoutOpen(val) {
        setPopoutOpen(val);
    }

    function handleCustomDurationChange(val) {
        setCustomDuration(val)
    }

    function handleCustomUnitChange(val){
        setCustomUnit(val);
    }

    function handleRangeChange([fromDayjs, untilDayjs]) {
        setRange([fromDayjs, untilDayjs]);

        onTimeFrameChange({
            from: getSeconds(fromDayjs.add(fromDayjs.utcOffset(), 'minute')),
            until: getSeconds(untilDayjs.add(untilDayjs.utcOffset(), 'minute')),
        });
    }

    function handleCustomRange() {
        const from = getNowAsUTC().subtract(customDuration, customUnit);
        const until = getNowAsUTC();
        handleRangeChange([from, until]);
        handlePopoutOpen(false);
    }

    function handlePredefinedRangeSelection({ value }) {
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
    }


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

    const [regions, setRegions] = useState(['N/A']);

    const handleCountryChange = (value) => {
        if (value === 'Country 1') {
            setRegions(['Region 1', 'Region 2']);
        } else {
            setRegions(['N/A']);
        }
    };


    return (
        <div className="flex items-start card p-6 mb-6 control-panel">
            {/*<div className="control-panel__controls col-1">*/}
            {/*<div className="searchbar">*/}
            {/*  <div className="flex items-center">*/}
            {/*    <T.p*/}
            {/*        text={"controlPanel.searchBarPlaceholder"}*/}
            {/*        className="text-lg"*/}
            {/*    />*/}
            {/*    <Tooltip*/}
            {/*        title={tooltipSearchBarTitle}*/}
            {/*        text={tooltipSearchBarText}*/}
            {/*    />*/}
            {/*  </div>*/}
            {/*  {searchbar()}*/}
            {/*</div>*/}

            {/*Countries*/}
            <div className="control-panel__controls">
                <label className="control-panel__label">Country</label>
                <Select
                    showSearch
                    placeholder="Select a Country"
                    optionFilterProp="children"
                    onChange={handleCountryChange}
                    style={{width: '150px'}}
                >
                    <Option value="All Countries">All Countries</Option>
                    <Option value="Country 1">Country 1</Option>
                    <Option value="Country 2">Country 2</Option>
                </Select>
            </div>

            {/*Region*/}
            <div className="control-panel__controls">
                <label className="control-panel__label">Region</label>
                <Select
                    showSearch
                    placeholder="Select a Region"
                    optionFilterProp="children"
                    style={{width: '150px'}}
                >
                    {regions.map((region, index) => (
                        <Option key={index} value={region}>{region}</Option>
                    ))}
                </Select>
            </div>

            {/*Asn*/}
            <div className="control-panel__controls">
                <label className="control-panel__label">Networks</label>

                <Select
                    showSearch
                    placeholder="Select a Network"
                    optionFilterProp="children"
                    style={{width: '150px'}}
                >
                    <Option value="N/A">N/A</Option>
                    <Option value="Network 1">Network 1</Option>
                    <Option value="Network 2">Network 2</Option>
                </Select>
            </div>

            {/*Range Picker*/}
            <div className="control-panel__controls" >
                <label className="control-panel__label" style={{display: 'inline-flex', alignItems: 'center', height: '12.1px'}}>
                    {/*<span >*/}
                    <T.p text={"controlPanel.timeRange"} className="text-lg"/>
                    <Tooltip
                        title={tooltipTimeRangeTitle}
                        text={tooltipTimeRangeText}
                    />
                    {/*</span>*/}
                </label>
                <RangePicker
                    // className="col"
                    value={range}
                    showTime={{format: "h:mmA"}}
                    format="MMM D YYYY h:mma UTC"
                    onChange={handleRangeChange}
                    onOk={handleRangeChange}
                    style={{ width: '400px' }}
                />
            </div>

            {/*Time Zone*/}
            <div className="control-panel__controls">
                <label className="control-panel__label">Timezone</label>
                <Select
                    showSearch
                    placeholder="Select a Timezone"
                    optionFilterProp="children"
                    style={{width: '150px'}}
                >
                    <Option value="UTC 0:00">UTC 0:00</Option>
                    <Option value="UTC +1:00">UTC +1:00</Option>
                    <Option value="UTC -1:00">UTC -1:00</Option>
                </Select>
            </div>

        </div>
    );
}

export default ControlPanel;
