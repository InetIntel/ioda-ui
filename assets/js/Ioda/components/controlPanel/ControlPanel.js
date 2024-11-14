import React, {useRef, useEffect, useCallback} from "react";
import { useState } from "react";
import T from "i18n-react";
import Tooltip from "../../components/tooltip/Tooltip";
import dayjs from "../../utils/dayjs";
import countries from "../../constants/countries.json";

import {
  DatePicker,
  Button,
  Popover,
  InputNumber,
  Select,
  Divider,
} from "antd";
import { getNowAsUTC, secondsToUTC, getSeconds } from "../../utils/timeUtils";

import {fetchData} from "../../data/ActionCommons";
import {v4 as uuidv4} from "uuid";
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

const ControlPanel = ({from, until, searchbar, onTimeFrameChange, onClose, title, onSelect, entityCode, entityType}) => {
  const [popoutOpen, setPopoutOpen] = useState(false);
  const [customDuration, setCustomDuration] = useState(1);
  const [customUnit, setCustomUnit] = useState(UNITS.DAY);
  const [range, setRange] = useState([secondsToUTC(from), secondsToUTC(until)]);
  const [countrySearchText, setCountrySearchText] = useState("All Countries");
  const [regionSearchText, setRegionSearchText] = useState("N/A");
  const [asnSearchText, setAsnSearchText] = useState("N/A");

  const [countryOptions, setCountryOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [asnOptions, setAsnOptions] = useState([]);

  const [loading, setLoading] = useState(false);

  const MAX_LIMITS = 11;

  console.log(entityCode, entityType)

  // const {  countryCode, regionCode, asnCode } = useParams();
  const regionCountryCacheRef = useRef({});

  // if entityType is set, then countryCode, regionCode and asnCode will be null
  // else if countryCode/regionCode/asnCode is not null, entityType will be null

  // TODO - if countryCode and regionCode is selected, then what will be the options in asn networks.
  //        -> Currently, it will be only based on country even if some region is selected.
  // TODO - if countryCode and asnCode is selected, then what will be the options in regions.
  //        -> Currently, it will be only based on country even if asnCode is selected.

  const getCountryCodeFromRegion = useCallback(async (regionCode) => {
    if (regionCountryCacheRef.current[regionCode]) {
      return regionCountryCacheRef.current[regionCode];
    }
      try {
        const url = `/entities/query?entityType=country&relatedTo=region/${regionCode}`
        const fetched = await fetchData({url});
        const countries = (fetched?.data?.data ?? []);
        if (countries.length > 0) {

          const countryCode = countries[0].code;
          console.log(countryCode);
          regionCountryCacheRef.current[regionCode] = countryCode;
          return countryCode;
        }
      } catch(error) {
        console.log("Error getting country code");
        return "all_country";
      }
      return "all_country";
  }, [fetchData])

  async function getCountryCodesFromAsn(asnCode) {
    try {
      const url = `/entities/query?entityType=country&relatedTo=asn/${asnCode}`
      const fetched = await fetchData({url});
      const countries = (fetched?.data?.data ?? []);
      if (countries.length > 0) {
        return countries.map(country => country.code);
      }
    } catch(error) {
      console.log("Error getting country code");
      return null;
    }
    return null;
  }

  async function getAsnNetworkEntity(asnCode) {
    try{
      const url = `/entities/query?entityType=asn&entityCode=${asnCode}`
      const fetched = await fetchData({url});
      const asnEntity = fetched?.data?.data ?? [];
      console.log(asnEntity);
      if(asnEntity.length > 0) {
        const entity = asnEntity[0];
        return {
          label: entity.name,
          id: uuidv4(),
          entity: {
            name: entity.name,
            code: entity.code,
            type: entity.type,
            url: `asn/${entity.code}`,
          }
        }
      }
    } catch (error) {
      console.log("Error getting asn network for ", asnCode);
      return {};
    }

    return {};
  }

  useEffect(()=> {
    const fetchCountries = async () => {
      try {
        let url = `/entities/query?entityType=country`
        const fetched = await fetchData({url});
        const results = (fetched?.data?.data ?? []).map((entity) => ({
          label: entity.name,
          id: uuidv4(),
          entity: {
            name: entity.name,
            code: entity.code,
            type: entity.type,
            url : `country/${entity.code}`,
          },
        }));

        const allCountryOption = {
          label: "All Countries",
          id: uuidv4(),
          entity: {
            name: "All Countries",
            code: "All Countries",
            type: "all_countries",
            url: 'country'
          }
        }

        const updatedResults = [allCountryOption, ...results];

        const _countryFlagMap = countries.reduce((map, country) => {
          map[country.code] = country.emoji;
          return map;
        }, {});
        const countrySearchResultOptions = (updatedResults || []).map((d) => ({
          value: d.id,
          name: d.label,
          label: (
              <span>
               {_countryFlagMap[d.entity.code]} {d.label}
              </span>),
          entity: d.entity
        }));
        setCountryOptions(countrySearchResultOptions);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    // Call the async function
    fetchCountries();
  }, []);

  useEffect(()=> {
    const fetchRegions = async () => {
      try {
        let url = '/entities/query?entityType=region';
        if(entityType){
          let countryCode = "";
          if(entityType === "country"){
            countryCode = entityCode;
          }
          else if(entityType === "region"){
            countryCode = await getCountryCodeFromRegion(entityCode);
          }
          if(countryCode !== "" && countryCode !== "all_countries") {
            url += `&relatedTo=country/${countryCode}`
          }
        }
        console.log(url)
        const fetched = await fetchData({url});
        const results = (fetched?.data?.data ?? []).map((entity) => {
          return {
            label: entity.name,
            id: uuidv4(),
            entity: {
              name: entity.name,
              code: entity.code,
              type: entity.type,
              url: `region/${entity.code}`,
            }
          }
        });

        const allRegionOption = {
          label: "All Regions",
          id: uuidv4(),
          entity: {
            name: "All Regions",
            code: "All Regions",
            type: "all_regions",
            url: 'region'
          }
        }
        const updatedResults = [allRegionOption, ...results];

        const regionOptions = (updatedResults || []).map((d) => ({
          value: d.id,
          label: d.label,
          entity: d.entity
        }));
        setRegionOptions(regionOptions);
      } catch (error) {
        console.error("Error fetching regions:", error);
      }
    };
    // Call the async function
    fetchRegions();
  }, [entityCode, entityType]);

  useEffect(()=> {
    // put selected option in
    const fetchAsnNetworks = async () => {
      try {
        let url = `/entities/query?entityType=asn`;
        if(entityType){
          if(entityCode && (entityType === "country" || entityType === "region")){
            url += `&relatedTo=${entityType}/${entityCode}`
          }
          if(entityType === "asn") {
            url =  '/entities/query?entityType=asn';
          }
        }
        const fetched = await fetchData({url});
        const results = (fetched?.data?.data ?? []).map((entity) => {
          return {
            label: entity.name,
            id: uuidv4(),
            entity: {
              name: entity.name,
              code: entity.code,
              type: entity.type,
              url: `asn/${entity.code}`,
            }
          }
        });
        const allNetworkOption = {
          label: "All Networks",
          id: uuidv4(),
          entity: {
            name: "All Networks",
            code: "All Networks",
            type: "all_networks",
            url: 'asn'
          }
        }

        let updatedResults = [];
        if(entityCode && entityType === "asn") {
          const selectedNetworkOption = await getAsnNetworkEntity(entityCode);
          if (selectedNetworkOption) {
            updatedResults = [allNetworkOption, selectedNetworkOption, ...results];
          }
        } else {
          updatedResults = [allNetworkOption, ...results];
        }
        const _asnOptions = (updatedResults || []).map((d) => ({
          value: d.id,
          label: d.label,
          entity: d.entity
        }));
        setAsnOptions(_asnOptions);
      } catch (error) {
        console.error("Error fetching asn networks:", error);
      }
    };
    fetchAsnNetworks();
  }, [entityCode, entityType]);

  useEffect(() => {
    if(entityCode && entityType === "country"){
      const _countryNameMap = countries.reduce((map, country) => {
        map[country.code] = country.name;
        return map;
      }, {});
      setCountrySearchText(_countryNameMap[entityCode]);
      setRegionSearchText("All Regions");
      setAsnSearchText("All Networks");
    }
  }, [entityType, entityCode]);

  useEffect(() => {
    if (entityType === "region" && entityCode) {
      const fetchRegionData = async () => {
        const _countryNameMap = countries.reduce((map, country) => {
          map[country.code] = country.name;
          return map;
        }, {});

        try {
          const countryCode = await getCountryCodeFromRegion(entityCode);
          setCountrySearchText(_countryNameMap[countryCode]);
          console.log(regionOptions)
          const region = await regionOptions.find((region) => region.entity.code === entityCode);
          console.log(region);
          setRegionSearchText(region ? region : "");

          setAsnSearchText("All Networks");
        } catch (error) {
          console.error("Error fetching country code:", error);
        }
      };

      fetchRegionData();
    }
  }, [entityType, entityCode, regionOptions]);


  useEffect(() => {
    if (entityType === "asn" && entityCode
        && asnOptions.length > 0
    ) {

      const fetchAsnData = async () => {
        const _countryNameMap = countries.reduce((map, country) => {
          map[country.code] = country.name;
          return map;
        }, {});
        try {
          const countryCodes = await getCountryCodesFromAsn(entityCode); // Assuming async
          const countryCodesSet = new Set(countryCodes);

          const matchingCountries = countryOptions.filter((country) =>
              countryCodesSet.has(country.entity.code)
          );
          const allCountriesItem = countryOptions.find((country) => country.entity.name === 'All Countries');
          matchingCountries.unshift(allCountriesItem);

          setCountryOptions(matchingCountries);
          console.log(matchingCountries);
          if(matchingCountries.length === 1) {
            setCountrySearchText(_countryNameMap[countryCodes[0]]);
          }
          console.log(asnOptions);
          const asn = await asnOptions.find((asn) => asn.entity.code === entityCode);
          console.log(asn)
          setAsnSearchText(asn ? asn : "");
          setRegionSearchText("All Regions");
        } catch (error) {
          console.error("Error fetching ASN data:", error);
        }
      };

      fetchAsnData();
    }
  }, [entityType, entityCode, asnOptions]);

  useEffect(() => {
    if(entityCode === undefined && entityType) {
      switch (entityType) {
        case "country":
          setCountrySearchText("All Countries");
          setRegionSearchText("N/A")
          setAsnSearchText("N/A")
          break;
        case "region":
          setCountrySearchText("N/A")
          setRegionSearchText("All Regions");
          setAsnSearchText("N/A")
          break;
        case "asn":
          setCountrySearchText("N/A")
          setRegionSearchText("N/A")
          setAsnSearchText("All Networks");
          break;
      }
    }
  }, [entityType, entityCode]);



  const handleCountrySelect = (id) => {
    const entity = countryOptions.find((d) => d.value === id)?.entity ?? null;
    if (!entity) return;
    setCountrySearchText(entity.name);
    onSelect(entity);
  }

  const handleRegionSelect = (id) => {
    const entity = regionOptions.find((d) => d.value === id)?.entity ?? null;
    if (!entity) return;
    setRegionSearchText(entity.name);
    onSelect(entity);
  }

  const handleAsnSelect = (id) => {
    const entity = asnOptions.find((d) => d.value === id)?.entity ?? null;
    if (!entity) return;
    setAsnSearchText(entity.name);
    onSelect(entity);
  }


  // const debouncedHandleSearch = debounce(handleCountrySearch, 200);


  function handlePopoutOpen(val) {
    setPopoutOpen(val);
  }

  function handleCustomDurationChange(val) {
    setCustomDuration(val)
  }

  function handleCustomUnitChange(val){
    setCustomUnit(val);
  }

  // function handleRangeChange([fromDayjs, untilDayjs]) {
  //   setRange([fromDayjs, untilDayjs]);
  //   console.log(fromDayjs, untilDayjs);
  //
  //   onTimeFrameChange({
  //     _from: getSeconds(fromDayjs.add(fromDayjs.utcOffset(), 'minute')),
  //     _until: getSeconds(untilDayjs.add(untilDayjs.utcOffset(), 'minute')),
  //   });
  // }

  function handleRangeChange([fromDayjs, untilDayjs], timezone) {
    const fromInTimezone = fromDayjs.tz(timezone);
    const untilInTimezone = untilDayjs.tz(timezone);

    setRange([fromInTimezone, untilInTimezone]);
    console.log(fromInTimezone, untilInTimezone);

    onTimeFrameChange({
      _from: getSeconds(fromInTimezone, timezone),
      _until: getSeconds(untilInTimezone, timezone),
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

  function handleCountryChange(query) {

    // const query = e.target.value;
    // console.log(query)
    setCountrySearchText(query);
    // debouncedCountryHandleSearch(query);
    // filter regions
  }

  function handleRegionChange(query) {
    setRegionSearchText(query);
  }

  function handleAsnChange(query) {
    setAsnSearchText(query);
  }

  const rangePresets = [
    {
      label: 'Past Hour',
      value: [dayjs().add(-7, 'd'), dayjs()],
    },
    {
      label: 'Past Day',
      value: [dayjs().add(-7, 'd'), dayjs()],
    },
    {
      label: 'Past 7 Days',
      value: [dayjs().add(-7, 'd'), dayjs()],
    },
    {
      label: 'Past 30 Days',
      value: [dayjs().add(-14, 'd'), dayjs()],
    }
  ];


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
              placeholder="Search Countries"
              value={countrySearchText}
              optionFilterProp="name" //label
              onChange={handleCountryChange}
              onSelect={handleCountrySelect}
              options={countryOptions}
              style={{width: '150px'}}
          >
          </Select>

        </div>

        {/*Region*/}
        <div className="control-panel__controls">
          <label className="control-panel__label">Region</label>
          <Select
              showSearch
              placeholder="Search Regions"
              value={regionSearchText}
              optionFilterProp="label"
              onChange={handleRegionChange}
              onSelect={handleRegionSelect}
              options={regionOptions}
              style={{width: '150px'}}
          >
          </Select>
        </div>

        {/*Asn*/}
        <div className="control-panel__controls">
          <label className="control-panel__label">Networks</label>

          <Select
              showSearch
              placeholder="Search Networks"
              value={asnSearchText}
              optionFilterProp="label"
              onChange={handleAsnChange}
              onSelect={handleAsnSelect}
              options={asnOptions}
              style={{width: '150px'}}
          >
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
              presets={[
                {
                  label: (
                      <span
                          aria-label="Quick Select"
                          style={{
                            color: '#dad7d6',
                            cursor: 'default',
                            fontWeight: 'bold',
                            pointerEvents: 'none',
                          }}
                                >
                      Quick Select:
                    </span>
                            ),
                          },
                          ...rangePresets,
              ]}
              value={range}
              showTime={{format: "h:mmA"}}
              format="MMM D YYYY h:mma UTC"
              onChange={handleRangeChange}
              onOk={handleRangeChange}
              style={{ width: '450px' }}
          />
        </div>

        {/*Time Zone*/}
        <div className="control-panel__controls">
          <label className="control-panel__label">Timezone</label>
          <Select
              showSearch
              placeholder="Select a Timezone"
              optionFilterProp="children"
              style={{width: '120px'}}
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
