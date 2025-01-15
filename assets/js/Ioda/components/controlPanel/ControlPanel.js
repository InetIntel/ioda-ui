import React, {useCallback, useEffect, useRef, useState} from "react";
import T from "i18n-react";
import Tooltip from "../../components/tooltip/Tooltip";
import dayjs from "../../utils/dayjs";
import countries from "../../constants/countries.json";

import {Button, DatePicker, notification, Select} from "antd";
import {getNowAsUTC, getSeconds, secondsToTimeZone, secondsToUTC} from "../../utils/timeUtils";

import {fetchData} from "../../data/ActionCommons";
import {v4 as uuidv4} from "uuid";
import DynamicBreadCrumb from "./BreadCrumb";

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

const allTimezones = Intl.supportedValuesOf('timeZone');
const userTimezone = dayjs.tz.guess();
const timezones = [
  'UTC',
  userTimezone,
  ...allTimezones.filter((tz) => tz !== 'UTC' && tz !== userTimezone),
];

const ControlPanel = ({from, until, searchbar, onTimeFrameChange, onClose, title, onSelect, entityCode, entityType, countryCode, searchParams}) => {

  const [customDuration, setCustomDuration] = useState(1);
  const [customUnit, setCustomUnit] = useState(UNITS.DAY);
  const [range, setRange] = useState(
      (localStorage.getItem('timezone') && localStorage.getItem('timezone') !== 'UTC') ?
          [secondsToTimeZone(from), secondsToTimeZone(until) ] :
          [secondsToUTC(from), secondsToUTC(until)]);
  const [countrySearchText, setCountrySearchText] = useState("All Countries");
  const [countrySelectedCode, setCountrySelectedCode] = useState("all");
  const [regionSearchText, setRegionSearchText] = useState("N/A");
  const [asnSearchText, setAsnSearchText] = useState("N/A");

  const [countryOptions, setCountryOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [asnOptions, setAsnOptions] = useState([]);


  const [selectedTimezone, setSelectedTimezone] = useState(() => {
    return  localStorage.getItem('timezone') || userTimezone;
  });


  useEffect(() => {
    const storedTimezone = localStorage.getItem('timezone') || userTimezone;
    setSelectedTimezone(storedTimezone);
  }, [selectedTimezone]);


  const handleTimezoneChange = (value) => {
    setSelectedTimezone(value);
    localStorage.setItem("timezone", value);

    if (from && until && range.length === 2) {
      const [fromDayjs, untilDayjs] = range;
      const fromInSelectedTimezone = fromDayjs.tz(value, true);
      const untilInSelectedTimezone = untilDayjs.tz(value, true);

      setRange([fromInSelectedTimezone, untilInSelectedTimezone]);

      const fromInUTC = fromInSelectedTimezone.tz("UTC");
      const untilInUTC = untilInSelectedTimezone.tz("UTC");

      // Trigger the API with updated UTC values
      onTimeFrameChange({
        _from: getSeconds(fromInUTC),
        _until: getSeconds(untilInUTC),
      });
    }
  };

  const MAX_LIMITS = 11;


  // const {  countryCode, regionCode, asnCode } = useParams();
  const regionCountryCacheRef = useRef({});

  // TODO - if countryCode is selected, then what will be the options in asn networks.
  //        -> Currently, it will show geoasn and it will be only based on country.
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


        regionCountryCacheRef.current[regionCode] = countryCode;
        return countryCode;
      }
    } catch(error) {
      console.log("Error getting country code");
      return "all_country";
    }
    return "all_country";
  }, [fetchData])


  async function getCountryNamesFromAsn(asnCode) {
    try {
      const url = `/entities/query?entityType=geoasn&relatedTo=asn/${asnCode}`
      const fetched = await fetchData({url});

      const geoasns = (fetched?.data?.data ?? []);

      return geoasns
          .filter(item => item.subnames && item.subnames.country)
          .map(item => item.subnames.country);
    } catch(error) {
      console.log("Error getting country code");
      return null;
    }
  }
  // returns countryCode, countryName for a geoasn
  const getCountryInfoFromGeoAsn = useCallback( async (geoasnCode) => {
    try {
      const url = `/entities/query?entityType=country&relatedTo=geoasn/${geoasnCode}`
      const fetched = await fetchData({url});
      const country = (fetched?.data?.data ?? []);

      return {
        "name": country[0].name,
        "code": country[0].code
      }
    } catch (error) {
      console.log("Error getting country code");
      return null;
    }
  }, [fetchData]);

  const getAsnNetworkEntity = useCallback(async (asnCode) => {
    try{
      const url = `/entities/query?entityType=asn&entityCode=${asnCode}`
      const fetched = await fetchData({url});
      const asnEntity = fetched?.data?.data ?? [];
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
  }, [fetchData]);

  //fetch countries names to populate the dropdown
  // countries are filtered based on region or geo-asn/asn
  useEffect(()=> {
    const fetchCountries = async () => {
      try {
        let url = `/entities/query?entityType=country`
        const fetched = await fetchData({url});
        let results = (fetched?.data?.data ?? []).map((entity) => ({
          label: entity.name,
          id: uuidv4(),
          entity: {
            name: entity.name,
            code: entity.code,
            type: entity.type,
            url : `country/${entity.code}`,
          },
        }));


        if (entityType === "asn") {
          const countryNames = await getCountryNamesFromAsn(entityCode);
          if (countryNames && countryNames.length > 0) {
            results = results.filter(item => countryNames.includes(item.label));
          }
        }
        else if(entityType === "geoasn") {
          const countryInfo = await getCountryInfoFromGeoAsn(entityCode);
          const countryName = countryInfo.name;
          if (countryName) {
            results = results.filter(item => countryName.toLowerCase() === item.label.toLowerCase());
          }
        }
        // TODO - filter based on regions too

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

  //fetch region names to populate the dropdown
  useEffect(()=> {

    const fetchRegions = async () => {
      try {
        let url = '/entities/query?entityType=region';
        if(entityType){
          let countryCode = "";
          if(entityType === "country" && entityCode){
            countryCode = entityCode;
          }
          else if(entityType === "region"){
            countryCode = await getCountryCodeFromRegion(entityCode);
          }
          else if(entityType === "geoasn") {
            const countryInfo = await getCountryInfoFromGeoAsn(entityCode);
            countryCode = countryInfo.code;
          }
          if(countryCode !== "" && countryCode !== "all_countries") {
            url += `&relatedTo=country/${countryCode}`
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

  // fetch asn names to populate the dropdown
  useEffect(()=> {

    // put selected option in
    const fetchAsnNetworks = async () => {
      try {
        let url = `/entities/query?entityType=asn`;
        if(entityType){
          if(entityCode){
            if( (entityType === "country")) {
              url = `/entities/query?entityType=geoasn&relatedTo=country/${entityCode}`;
            }
            else if (entityType === "region") {
              const countryCode = await getCountryCodeFromRegion(entityCode);
              url = `/entities/query?entityType=geoasn&relatedTo=country/${countryCode}`;
            }
            else if (entityType === "geoasn") {
              const countryInfo = await getCountryInfoFromGeoAsn(entityCode);
              const countryCode = countryInfo.code;
              url = `/entities/query?entityType=geoasn&relatedTo=country/${countryCode}`;
            }
          }
          if(entityType === "asn") {
            url =  '/entities/query?entityType=asn';
          }
        }
        const fetched = await fetchData({url});
        const results = await Promise.all(
            (fetched?.data?.data ?? []).map(async (entity) => {
              let asnUrl = `geoasn/${entity.code}`;
              // TODO - also can be asn when no country and region is selected.
              if (countrySelectedCode !== "all" && countrySelectedCode !== "N/A") {
                asnUrl = `asn=${entityCode}?country=${countrySelectedCode}?`;
              }
              return {
                label: entity.name,
                id: uuidv4(),
                entity: {
                  name: entity.name,
                  code: entity.code,
                  type: entity.type,
                  url: asnUrl,
                },
              };
            })
        );

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

  // Fill the dropdowns with the selected values whenever "Country" is chosen as the entity.
  useEffect( () => {

    const _countryNameMap = countries.reduce((map, country) => {
      map[country.code] = country.name;
      return map;
    }, {});

    const fillCountry = async () => {
      const countryInfo = await getCountryInfoFromGeoAsn(entityCode);
      const countryCode = countryInfo.code;
      setCountrySearchText(_countryNameMap[countryCode]);
      setCountrySelectedCode(entityCode);
    }

    if (entityCode && entityType === "country") {
      setCountrySearchText(_countryNameMap[entityCode]);
      setCountrySelectedCode(entityCode);
    } else if (entityType === "geoasn") {
      fillCountry();
    }
    setRegionSearchText("All Regions");
    setAsnSearchText("All Networks");
  }, [entityType, entityCode]);

  // Fill the dropdowns with the selected values whenever "Regions" is chosen as the entity.
  useEffect(() => {

    if (entityType === "region" && entityCode && regionOptions.length > 0) {
      const fetchRegionData = async () => {
        const _countryNameMap = countries.reduce((map, country) => {
          map[country.code] = country.name;
          return map;
        }, {});

        try {
          const countryCode = await getCountryCodeFromRegion(entityCode);
          setCountrySearchText(_countryNameMap[countryCode]);
          setCountrySelectedCode(countryCode);

          const region = await regionOptions.find((region) => region.entity.code === entityCode);

          setRegionSearchText(region ? region.entity.name : "");

          setAsnSearchText("All Networks");
        } catch (error) {
          console.error("Error fetching country code:", error);
        }
      };

      fetchRegionData();
    }
  }, [entityType, entityCode, regionOptions]);

  // Fill the dropdowns with the selected values whenever "Asn/Networks" is chosen as the entity.
  useEffect(() => {

    if (entityType === "asn" && entityCode
        && asnOptions.length > 0
    ) {

      const fetchAsnData = async () => {
        try {
          const countryNames = await getCountryNamesFromAsn(entityCode);
          if(countryNames.length === 1) {
            setCountrySearchText(countryNames[0]);
          }
          else {
            notification.info({
              message: 'Multiple Countries Found',
              description: (
                  <p>
                    The selected ASN operates in{' '} {countryNames.length} countries - {' '}
                    {countryNames.slice(0, -1).map((country, index) => (
                        <span key={index} style={{color: 'blue'}}>{country}</span>
                    )).reduce((prev, curr) => [prev, ', ', curr])}
                    {' and '}
                    <span style={{color: 'blue'}}>{countryNames.slice(-1)}</span>.
                  </p>
              ),
              // duration: 5,
            });
          }
          const asn = await asnOptions.find((asn) => asn.entity.code === entityCode);
          setAsnSearchText(asn ? asn : "");
          setRegionSearchText("All Regions");
        } catch (error) {
          console.error("Error fetching ASN data:", error);
        }
      };

      fetchAsnData();
    }
    else if(entityType === "geoasn" && entityCode && asnOptions.length > 0) {
      const fillGeoAsn = async () => {
        const geoasn = asnOptions.find((geoasn) => geoasn.entity.code === entityCode);
        setAsnSearchText(geoasn ? geoasn : "");
        setRegionSearchText("All Regions");
      }
      fillGeoAsn();
    }
  }, [entityType, entityCode, asnOptions]);

  useEffect(() => {
    if(entityCode === undefined && entityType) {
      switch (entityType) {
        case "country":
        case "geoasn":
          setCountrySearchText("All Countries");
          setCountrySelectedCode("all")
          setRegionSearchText("N/A")
          setAsnSearchText("N/A")
          break;
        case "region":
          setCountrySearchText("N/A")
          setCountrySelectedCode("N/A")
          setRegionSearchText("All Regions");
          setAsnSearchText("N/A")
          break;
        case "asn":
          setCountrySearchText("N/A")
          setCountrySelectedCode("N/A")
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
    setCountrySelectedCode(entity.code);
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

  function handlePopoutOpen(val) {
    setPopoutOpen(val);
  }

  function handleRangeChange([fromDayjs, untilDayjs], timezone) {

    const fromInTimezone = fromDayjs.tz(selectedTimezone, true);
    const untilInTimezone = untilDayjs.tz(selectedTimezone, true);


    const fromInUTC = fromInTimezone.tz("UTC");
    const untilInUTC = untilInTimezone.tz("UTC");

    // Update the displayed range
    setRange([fromDayjs, untilDayjs]);

    onTimeFrameChange({
      _from: getSeconds(fromInUTC),
      _until: getSeconds(untilInUTC),
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
    setCountrySearchText(query);
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
        <div>
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
            <div className="control-panel__controls">
              <label className="control-panel__label"
                     style={{display: 'inline-flex', alignItems: 'center', height: '12.1px'}}>
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
                  format="MMM D YYYY h:mma"
                  onChange={handleRangeChange}
                  onOk={handleRangeChange}
                  style={{width: '400px'}}
              />
            </div>

            {/*<div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>*/}
            {/*  <span>UTC</span>*/}
            {/*  <Switch*/}
            {/*      checked={isSwitchActive}*/}
            {/*      onChange={handleTimezoneToggleSwitch}*/}
            {/*      checkedChildren="Local"*/}
            {/*      unCheckedChildren="UTC"*/}
            {/*  />*/}
            {/*  <span>Local</span>*/}
            {/*</div>*/}
            {/*Time Zone*/}
            <div className="control-panel__controls">
              <label className="control-panel__label">Timezone</label>
              <Select
                  showSearch
                  placeholder="Select a Timezone"
                  optionFilterProp="children"
                  style={{width: '150px'}}
                  dropdownStyle={{width: '180px'}}
                  value={selectedTimezone}
                  defaultValue={selectedTimezone}
                  onChange={handleTimezoneChange}
              >
                {timezones.map((tz) => (
                    <Option key={tz} value={tz}>
                      {tz}
                    </Option>
                ))}
              </Select>

            </div>

          </div>

          {entityCode && <DynamicBreadCrumb
              searchParams={searchParams}
              entityType={entityType}
              entityCode={entityCode}
              countryOptions={countryOptions}
              regionOptions={regionOptions}
                asnOptions={asnOptions}
                getCountryCodeFromRegion={getCountryCodeFromRegion}
            />}
          </div>

          );
          }

          export default ControlPanel;
