import React, {useCallback, useEffect, useRef, useState} from "react";
import T from "i18n-react";
import Tooltip from "../../components/tooltip/Tooltip";
import dayjs from "../../utils/dayjs";
import countries from "../../constants/countries.json";

import {Button, DatePicker, Divider, InputNumber, notification, Popover, Select} from "antd";
import {getNowAsUTC, getSeconds, secondsToUTC} from "../../utils/timeUtils";
import {ClockCircleOutlined} from "@ant-design/icons";
import {fetchData} from "../../data/ActionCommons";
import {v4 as uuidv4} from "uuid";
import DynamicBreadCrumb from "./BreadCrumb";
import {debounce} from "lodash";

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

const ControlPanel = ({from, until, onTimeFrameChange, onClose, title, onSelect, entityCode, entityType, countryCode, searchParams,
                       handleEntityChange, showGlobalSignals}) => {

  const [customDuration, setCustomDuration] = useState(1);
  const [customUnit, setCustomUnit] = useState(UNITS.DAY);
  const [range, setRange] = useState(
      // (localStorage.getItem('timezone') && localStorage.getItem('timezone') !== 'UTC') ?
      //     [secondsToTimeZone(from), secondsToTimeZone(until) ] :
          [secondsToUTC(from), secondsToUTC(until)]);
  const [countrySearchText, setCountrySearchText] = useState(null);
  const [countrySelectedCode, setCountrySelectedCode] = useState(null);
  const [regionSearchText, setRegionSearchText] = useState(null);
  const [regionSelectedCode, setRegionSelectedCode] = useState(null);
  const [asnSearchText, setAsnSearchText] = useState(null);
  const [asnSelectedCode, setAsnSelectedCode] = useState(null);

  const [countryOptions, setCountryOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [asnOptions, setAsnOptions] = useState([]);

  const [customRangePopOutOpen, setCustomRangePopOutOpen] = useState(false);
  const [asnSearchLoading, setAsnSearchLoading] = useState(false);
  const [regionSearchLoading, setRegionSearchLoading] = useState(false);

  const [selectedTimezone, setSelectedTimezone] = useState(() => {
    return  "UTC";
  });


  // useEffect(() => {
  //   const storedTimezone = localStorage.getItem('timezone') || userTimezone;
  //   setSelectedTimezone(storedTimezone);
  // }, [selectedTimezone]);


  // const handleTimezoneChange = (value) => {
  //   setSelectedTimezone(value);
  //   localStorage.setItem("timezone", value);
  //
  //   if (from && until && range.length === 2) {
  //     const [fromDayjs, untilDayjs] = range;
  //     const fromInSelectedTimezone = fromDayjs.tz(value, true);
  //     const untilInSelectedTimezone = untilDayjs.tz(value, true);
  //
  //     setRange([fromInSelectedTimezone, untilInSelectedTimezone]);
  //
  //     const fromInUTC = fromInSelectedTimezone.tz("UTC");
  //     const untilInUTC = untilInSelectedTimezone.tz("UTC");
  //
  //     // Trigger the API with updated UTC values
  //     onTimeFrameChange({
  //       _from: getSeconds(fromInUTC),
  //       _until: getSeconds(untilInUTC),
  //     });
  //   }
  // };

  const MAX_LIMITS = 11;


  const regionCountryCacheRef = useRef({});
  const asnRegionCountryCacheRef = useRef({});

  const getCountryCodeFromRegion = useCallback(async (regionCode) => {
    if (regionCountryCacheRef.current[regionCode]) {

      return regionCountryCacheRef.current[regionCode];
    }
    try {
      regionCode = regionCode.includes("-") ? regionCode.split("-")[0] : regionCode;
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
      return "";
    }
    return "";
  }, [fetchData]);


  const getCountryNamesFromAsn = useCallback(async (geoasnCode) => {
    try {
      // asnGeoCode -> {138322-AF, 138322, 138322-12}
      const asnCode = geoasnCode.split("-")[0];
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
  }, [fetchData]);

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
      let url;
      if(asnCode.includes("-")) {
        url = `/entities/query?entityType=geoasn&entityCode=${asnCode}`
      }
      else {
        url = `/entities/query?entityType=asn&entityCode=${asnCode}`
      }
      const fetched = await fetchData({url});
      const asnEntity = fetched?.data?.data ?? [];
      if(asnEntity.length > 0) {
        const entity = asnEntity[0];
        return {
          label: entity.name.replace(/--/g, "|"),
          id: uuidv4(),
          entity: {
            name: entity.name.replace(/--/g, "|"),
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

  const allCountryOption = {
    label: "All Countries",
    id: uuidv4(),
    entity: {
      name: "All Countries",
      code: "all_countries",
      type: "all_countries",
      url: `dashboard/country`,
      backUrl: 'dashboard'
    }
  }

  const allRegionOption = {
    label: "All Regions",
    id: uuidv4(),
    entity: {
      name: "All Regions",
      code: "all_regions",
      type: "all_regions",
      url: 'dashboard/region',
      backUrl: 'dashboard'
    }
  }

  const allNetworkOption = {
    label: "All Networks",
    id: uuidv4(),
    entity: {
      name: "All Networks",
      code: "all_networks",
      type: "all_networks",
      url: 'dashboard/asn',
      backUrl: 'dashboard'
    }
  }

  const getRegionsOfACountry = async (countryName) => {
    let url = `/entities/query?entityType=region&relatedTo=country/${countryName}`;
    const fetched = await fetchData({url});
    return await Promise.all(
        (fetched?.data?.data ?? []).map(async (entity) => {
          return entity.name;
        })
    );
  }

  // fetch countries names to populate the dropdown
  // countries are filtered based on region or geo-asn/asn
  // only countries dropdown is affected
  useEffect(()=> {
    const fetchCountries = async () => {
      try {
        let url = `/entities/query?entityType=country`
        const fetched = await fetchData({url});
        let results = (fetched?.data?.data ?? []).map((entity) => ({
          label: entity.name.replace(/--/g, "|"),
          id: uuidv4(),
          entity: {
            name: entity.name,
            code: entity.code,
            type: entity.type,
            url : `country/${entity.code}`,
            backUrl: `dashboard`
          },
        }));


        if (entityType === "asn" && entityCode) {
          const countryNames = await getCountryNamesFromAsn(entityCode);
          if (countryNames && countryNames.length > 0) {
            results = results.filter(item => countryNames.includes(item.label));
            const asnCode = entityCode.split("-")[0];
            results = results.map(item => {
              item.entity.url = `${entityType}/${asnCode}-${item.entity.code}`;
              item.entity.backUrl = `${entityType}/${asnCode}`;
              return item;
            });
            allCountryOption.entity.url = `asn/${asnCode}`;
            allCountryOption.entity.backUrl = `asn/${asnCode}`;
          }
        }
        else if (entityType === "region" && entityCode) {
          const countryCode = await getCountryCodeFromRegion(entityCode);
          if (countryCode !== "") {
            results = results.filter(item => countryCode === item.entity.code);
            allCountryOption.entity.url = 'country';
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
        setCountryOptions([allCountryOption]);
        console.error("Error fetching countries:", error);
      }
    };
    // Call the async function
    fetchCountries();
  }, [entityCode, entityType]);

  //fetch region names to populate the dropdown
  useEffect(()=> {

    const fetchRegions = async () => {
      try {
        let url = '/entities/query?entityType=region';
        if(entityCode){
          let countryCode = "";
          if(entityType === "country" && entityCode){
            countryCode = entityCode;
          }
          else if(entityType === "region" && entityCode){
            countryCode = await getCountryCodeFromRegion(entityCode);
          }
          if(countryCode !== "") {
            url += `&relatedTo=country/${countryCode}`
          }
          if(entityType === "asn" && entityCode) {
            let relatedToEntityCode = entityCode;
            if (relatedToEntityCode.includes("-")) {
               relatedToEntityCode = entityCode.split("-")[0];
            }
              url += `&relatedTo=asn/${relatedToEntityCode}`
          }
        }
        const fetched = await fetchData({url});
        let results = (fetched?.data?.data ?? []).map((entity) => {
          return {
            label: entity.name.replace(/--/g, "|"),
            id: uuidv4(),
            entity: {
              name: entity.name,
              code: entity.code,
              type: entity.type,
              url: `region/${entity.code}`,
              backUrl: 'dashboard/region'
            }
          }
        });
        // filter geoasns based on country selected if geoasn with country is selected.
        if(entityType === "asn" && entityCode) {
          if (entityCode.includes("-")) {
            const geoCode = entityCode.split("-")[1];
            if (isNaN(geoCode)) { // country
              const regionsAllowed = await getRegionsOfACountry(geoCode);
              results = results.filter(item =>
                regionsAllowed.includes(item.label)
              )
            }
          }
        }

        // backUrl
        if (entityType === "asn" && entityCode) {
            const asnCode = entityCode.split("-")[0];
            results = results.map(item => {
              item.entity.url = `${entityType}/${asnCode}-${item.entity.code}`;
              item.entity.backUrl = `${entityType}/${asnCode}`;
              return item;
            });
            allRegionOption.entity.url = `asn/${asnCode}`;
            allRegionOption.entity.backUrl = `asn/${asnCode}`;
        }
        const countryCode = await getCountryCodeFromRegion(entityCode);
        if (entityType === "region" && entityCode) {
          results = results.map(item => {
            item.entity.backUrl = `country/${countryCode}`;
            return item;
          });
        }
        // Regions are already filtered based on country in API call
        const updatedResults = [allRegionOption, ...results];

        const regionOptions = (updatedResults || []).map((d) => ({
          value: d.id,
          label: d.label,
          entity: d.entity
        }));
        setRegionOptions(regionOptions);
      } catch (error) {
        setRegionOptions([allRegionOption])
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
        let url = '/entities/query?entityType=asn';
        if(entityType){
          if(entityCode) {
            const urlString = '/entities/query?entityType=geoasn';
            if ((entityType === "country")) {
              url = urlString + `&relatedTo=country/${entityCode}`;
            } else if (entityType === "region") {
              url = urlString + `&relatedTo=region/${entityCode}`;
            } else if(entityType === "asn") {
              if (entityCode.includes("-")) {
                const geoCode = entityCode.split("-")[1];
                if (isNaN(geoCode)) { // country
                  url = urlString + `&relatedTo=country/${geoCode}`;
                } else { // region
                  url = urlString + `&relatedTo=region/${geoCode}`;
                }
              }
            }
          }
        }

        const fetched = await fetchData({url});
        const results = await Promise.all(
            (fetched?.data?.data ?? []).map(async (entity) => {
              return {
                label: entity.name.replace(/--/g, "|"),
                id: uuidv4(),
                entity: {
                  name: entity.name.replace(/--/g, "|"),
                  code: entity.code,
                  type: entity.type,
                  url: `asn/${entity.code}`,
                  backUrl: 'dashboard/asn'
                },
              };
            })
        );
        let selectedNetwork;
        if(results.length > 0) {
          selectedNetwork =
              await results.find((asn) => asn.entity.code == entityCode);
        }

        let updatedResults = [];
        if(!selectedNetwork && entityCode && entityType === "asn") {
          const selectedNetworkOption = await getAsnNetworkEntity(entityCode);
          if (selectedNetworkOption) {
            updatedResults = [allNetworkOption, selectedNetworkOption, ...results];
          }
        } else {
          updatedResults = [allNetworkOption, ...results];
        }

        if (entityType === "asn" && entityCode) {
          let backurl;
          if(entityCode.includes("-")) {
            const geoCode = entityCode.split("-")[1];
            if (isNaN(geoCode)) { // country
              backurl = `country/${geoCode}`;
            } else { // region
              backurl = `region/${geoCode}`;
            }
          }
          else {
            backurl = 'dashboard/asn';
          }
          allCountryOption.entity.url = `dashboard/country`;
          allCountryOption.entity.backUrl = `dashboard/country`;
          updatedResults = updatedResults.map(item => {
            item.entity.backUrl = backurl;
            return item;
          });
        }
        const asnOptions = (updatedResults || []).map((d) => ({
          value: d.id,
          label: d.label.replace(/--/g, "|"),
          entity: d.entity
        }));
        setAsnOptions(asnOptions);
      } catch (error) {
        setAsnOptions([allNetworkOption])
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

    if (entityCode && entityType === "country") {
      setCountrySearchText(_countryNameMap[entityCode]);
      setCountrySelectedCode(entityCode);
    }
    // else if (entityType === "asn") {
    //   if(entityCode.includes("-")) {
    //     const geoCode = entityCode.split("-");
    //     if(!isNaN(geoCode)) {
    //       setCountrySearchText(_countryNameMap[geoCode]);
    //       setCountrySelectedCode(geoCode);
    //     }
    //   }
    // }
    setRegionSearchText("All Regions");
    setAsnSearchText("All Networks");
    setRegionSelectedCode("all_regions");
    setAsnSelectedCode("all_networks")
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
          const region = await regionOptions.find((region) => region.entity.code == entityCode);

          setRegionSearchText(region ? region.entity.name : "");
          setRegionSelectedCode(region ? region.entity.code : "");

          setAsnSearchText("All Networks");
          setAsnSelectedCode("all_networks");
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
          if(entityCode.includes("-")) {
            const _countryNameMap = countries.reduce((map, country) => {
              map[country.code] = country.name;
              return map;
            }, {});
            const geoCode = entityCode.split("-")[1];
            if(isNaN(geoCode)) { // country
              setCountrySearchText(_countryNameMap[geoCode]);
              setCountrySelectedCode(geoCode);
              setRegionSearchText("All Regions")
            }
            else { // region
              const selectedRegion = await regionOptions.find((region) => region.entity.code == geoCode);
              setRegionSearchText(selectedRegion ? selectedRegion.label : "");
              const countryCode = await getCountryCodeFromRegion(geoCode);
              setCountrySearchText(_countryNameMap[countryCode]);
              setCountrySelectedCode(countryCode);
            }
            const asn = await asnOptions.find((asn) => entityCode === asn.entity.code);
            setAsnSearchText(asn ? asn.entity.name.replace(/--/g, "|") : "");
            setAsnSelectedCode(asn ? asn.entity.code : null)
          }
          else {
            const countryNames = await getCountryNamesFromAsn(entityCode);
            if(countryNames.length > 1) {
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
            setCountrySearchText("All Countries");
            setCountrySelectedCode("all_countries")
            const asn = await asnOptions.find((asn) => asn.entity.code == entityCode);
            setAsnSearchText(asn ? asn.entity.name.replace(/--/g, "|") : "");
            setAsnSelectedCode(asn ? asn.entity.code : null);
            setRegionSearchText("All Networks");
          }
        } catch (error) {
          console.error("Error fetching ASN data:", error);
        }
      };
      fetchAsnData();
    }
  }, [entityType, entityCode, asnOptions, regionOptions]);

  useEffect(() => {
    if(entityCode === undefined && entityType) {
      setCountrySearchText("All Countries");
      setCountrySelectedCode("all_countries")
      setRegionSearchText("All Regions")
      setRegionSelectedCode("all_regions")
      setAsnSearchText("All Networks")
      setAsnSelectedCode("all_networks")
    }
  }, [entityType, entityCode]);


  // Triggered when a country is selected by clicking on one of the select option
  const handleCountrySelect = (id) => {
    const entity = countryOptions.find((d) => d.value === id)?.entity ?? null;
    if (!entity) return;
    setCountrySearchText(entity.name);
    setCountrySelectedCode(entity.code);
    onSelect(entity);
  }

  // Triggered when a region is selected by clicking on one of the select option
  const handleRegionSelect = (id) => {
    const entity = regionOptions.find((d) => d.value === id)?.entity ?? null;
    if (!entity) return;
    setRegionSearchText(entity.name);
    onSelect(entity);
    // handleRegionChange();
  }

  // Triggered when an asn is selected from clicking on one of the select option
  const handleAsnSelect = (id) => {
    const entity = asnOptions.find((d) => d.value === id)?.entity ?? null;
    if (!entity) return;
    setAsnSearchText(entity.name.replace(/--/g, "|"));
    setAsnSelectedCode(entity.code);
    onSelect(entity);
    // handleAsnChange();
  }

  const handleCustomRangePopOut = (val) => {
    setCustomRangePopOutOpen(val);
  };

  const handleCustomUnitChange = (val) => {
    setCustomUnit(val);
  }

  const handleCustomDurationChange = (val) => {
    setCustomDuration(val);
  }

  const handleRangeChange = ([fromDayjs, untilDayjs]) => {
    setRange([fromDayjs, untilDayjs]);
    onTimeFrameChange({
      _from: getSeconds(fromDayjs.add(fromDayjs.utcOffset(), "minute")),
      _until: getSeconds(untilDayjs.add(untilDayjs.utcOffset(), "minute")),
    });
  };

  const handleCustomRange = ()=>  {
    const from = getNowAsUTC().subtract(customDuration, customUnit);
    const until = getNowAsUTC();
    handleRangeChange([from, until]);
    setCustomRangePopOutOpen(false);
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

    setCustomRangePopOutOpen(false);
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

  // Triggered when there is change in search box of country
  function handleCountrySelectChange(id) {
    if(id === undefined) {
      if(countrySearchText !== "N/A") {
        const entity = countryOptions.find((d) => d.name === countrySearchText)?.entity ?? null;
        if(entity != null){
          handleEntityChange(entity.backUrl);
        }
      }
    }
    else {
      setCountrySearchText(id);
    }
  }

  function handleRegionSelectChange(id) {
    if(id === undefined) {
      if(regionSelectedCode) {
        const entity = regionOptions.find((d) => d.entity.code === regionSelectedCode)?.entity ?? null;
        if(entity != null){
          handleEntityChange(entity.backUrl);
        }
      }
    }
    else {
      setRegionSearchText(id);
      setRegionSelectedCode(id);
    }
  }

  function handleAsnSelectChange(id) {
    if(id === undefined) {
      if(asnSelectedCode) {
        const entity = asnOptions.find((d) => d.entity.code == asnSelectedCode)?.entity ?? null;
        if(entity != null){
          handleEntityChange(entity.backUrl);
        }
      }
    }
    else {
      setAsnSearchText(id);
      setAsnSelectedCode(id);
    }
  }
  const handleAsnSearch = (asnSearchText) => {
    if(asnSearchText) {
      const isMatchingOptionLoaded = asnOptions.some((option) => {
        const entity = option?.entity || {};
        return (
            entity.name?.toLowerCase().includes(asnSearchText.toLowerCase()) ||
            entity.code?.toLowerCase().includes(asnSearchText.toLowerCase()) ||
            entity.type?.toLowerCase().includes(asnSearchText.toLowerCase())
        );
      });


      if (!isMatchingOptionLoaded) {
        fetchAsnMatchingOptions(asnSearchText);
      }
    }
    setAsnSearchText(asnSearchText);
  }
  const debouncedHandleAsnSearch = useCallback(debounce(handleAsnSearch, 200), [asnOptions]);
  const debouncedRegionSearch = useCallback(
      debounce((value) => {
        handleRegionSearch(value);
      }, 200),
      [regionOptions]
  );
  const fetchAsnMatchingOptions = async (asnSearchText) => {
    setAsnSearchLoading(true);
    if (asnSearchText.trim().length < 2) {
      return;
    }
    try {
      const entityTypeUrlText = 'asn';
      let url = `/entities/query?entityType=${entityTypeUrlText}&search=${asnSearchText}`
      const fetched = await fetchData({url});
      const resultsArray = Array.isArray(fetched?.data?.data) ? fetched.data.data : [];
      const results = await Promise.all(
          resultsArray.map(async (entity) => {
            let asnUrl = `asn/${entity.code}`;
            return {
              label: entity.name.replace(/--/g, "|"),
              id: uuidv4(),
              entity: {
                name: entity.name.replace(/--/g, "|"),
                code: entity.code,
                type: entity.type,
                url: asnUrl,
                backUrl: 'dashboard'
              },
            };
          })
      );
      const updatedResults = [...asnOptions, ...results];
      const options = (updatedResults || []).map((d) => ({
        value: d.id,
        label: d.label.replace(/--/g, "|"),
        entity: d.entity
      }));
      setAsnOptions(options);
    } catch (error) {
      console.error("Failed to fetch asn options based on search text:", error);
    } finally {
      setAsnSearchLoading(false);
    }
  };

  const handleRegionSearch = (regionSearchText) => {
    if(regionSearchText) {
      const isMatchingOptionLoaded = regionOptions.some((option) => {
        const entity = option?.entity || {};
        return (
            entity.name?.toLowerCase().includes(regionSearchText.toLowerCase()) ||
            entity.code?.toLowerCase().includes(regionSearchText.toLowerCase()) ||
            entity.type?.toLowerCase().includes(regionSearchText.toLowerCase())
        );
      });

      if (!isMatchingOptionLoaded) {
        console.log("No match found calling API");
        fetchRegionMatchingOptions(regionSearchText);
      }
    }
    setRegionSearchText(regionSearchText);
  }

  const fetchRegionMatchingOptions = async (regionSearchText) => {
    setRegionSearchLoading(true);
    if (regionSearchText.trim().length < 2) {
      return;
    }
    try {
      const entityTypeUrlText = 'region';
      let url = `/entities/query?entityType=${entityTypeUrlText}&search=${regionSearchText}`
      const fetched = await fetchData({url});
      const resultsArray = Array.isArray(fetched?.data?.data) ? fetched.data.data : [];
      const results = await Promise.all(
          resultsArray.map(async (entity) => {
            let asnUrl = `region/${entity.code}`;
            return {
              label: entity.name.replace(/--/g, "|"),
              id: uuidv4(),
              entity: {
                name: entity.name,
                code: entity.code,
                type: entity.type,
                url: asnUrl,
                backUrl: 'dashboard'
              },
            };
          })
      );
      const updatedResults = [...regionOptions, ...results];
      const options = (updatedResults || []).map((d) => ({
        value: d.id,
        label: d.label.replace(/--/g, "|"),
        entity: d.entity
      }));
      setRegionOptions(options);
    } catch (error) {
      console.error("Failed to fetch region options based on search text:", error);
    } finally {
      setRegionSearchLoading(false);
    }
  };


  const rangePresets = [
    {
      label: 'Past Hour',
      value: [dayjs().add(-60, 'minute'), dayjs()],
    },
    {
      label: 'Past Day',
      value: [dayjs().add(-24, 'hour'), dayjs()],
    },
    {
      label: 'Past 7 Days',
      value: [dayjs().add(-7, 'day'), dayjs()],
    },
    {
      label: 'Past 30 Days',
      value: [dayjs().add(-30, 'day'), dayjs()],
    },
    {
      label: (
          // <Space>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}
               onClick={(e) => e.stopPropagation()}>
            <span>Last</span>
            <InputNumber
                min={1}
                value={customDuration}
                onChange={(value) => handleCustomDurationChange(value || 1)}
                size="small"
                style={{width: 60}}
            />
            <span>
            <Select
                className="col"
                value={customUnit}
                onChange={handleCustomUnitChange}
                options={customUnitOptions}
                size="small"
                style={{width: 80}}
            />
            </span>
            <Button
                type="primary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCustomRange();
                }}
            >
              Go
            </Button>
              {/*</Space>*/}
          </div>
      ),
      value: null,
    }
  ];


  return (
      <div>
        <div className="flex items-start card p-6 mb-6 control-panel">

          {/*Countries*/}
          <div className="control-panel__controls">
            <label className="control-panel__label">Country</label>
            <Select
                showSearch
                placeholder="Search Countries"
                value={countrySearchText}
                optionFilterProp="name" //label
                onChange={handleCountrySelectChange}
                onSelect={handleCountrySelect}
                options={countryOptions}
                allowClear
                style={{width: '150px'}}
                popupMatchSelectWidth={false}
                dropdownStyle={{ width: 200}}
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
                onChange={handleRegionSelectChange}
                onSelect={handleRegionSelect}
                onSearch={(value) => {
                  if(countrySelectedCode === "all_countries" && asnSelectedCode === "all_networks") {
                    debouncedRegionSearch(value);
                  }
                }}
                options={regionOptions}
                allowClear
                style={{width: '150px'}}
                popupMatchSelectWidth={false}
                dropdownStyle={{ width: 200}}
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
                onChange={handleAsnSelectChange}
                onSelect={handleAsnSelect}
                onSearch={debouncedHandleAsnSearch}
                options={asnOptions}
                style={{width: '200px'}}
                popupMatchSelectWidth={false}
                dropdownStyle={{ width: 300 }}
                allowClear
                filterOption={(input, option) => {
                  const entity = option?.entity || {};
                  return (
                      entity.name.toLowerCase().includes(input.toLowerCase()) ||
                      entity.code.toLowerCase().includes(input.toLowerCase()) ||
                      entity.type.toLowerCase().includes(input.toLowerCase())
                  );
                }}
                optionLabelProp="label"
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <Popover
                overlayStyle={{
                  width: 240,
                }}
                placement="bottomLeft"
                trigger="click"
                open={customRangePopOutOpen}
                onOpenChange={handleCustomRangePopOut}
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
                // presets={[
                //   {
                //     label: (
                //         <span
                //             aria-label="Quick Select"
                //             style={{
                //               color: '#dad7d6',
                //               cursor: 'default',
                //               fontWeight: 'bold',
                //               pointerEvents: 'none',
                //             }}
                //         >
                //       Quick Select:
                //     </span>
                //     ),
                //   },
                //   ...rangePresets,
                // ]}
                value={range}
                showTime={{format: "h:mmA"}}
                format="MMM D YYYY h:mma UTC"
                onChange={handleRangeChange}
                onOk={handleRangeChange}
                style={{width: '480px'}}
            />
            </div>
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
          {/*<div className="control-panel__controls">*/}
          {/*  <label className="control-panel__label">Timezone</label>*/}
          {/*  <Select*/}
          {/*      showSearch*/}
          {/*      placeholder="Select a Timezone"*/}
          {/*      optionFilterProp="children"*/}
          {/*      style={{width: '150px'}}*/}
          {/*      dropdownStyle={{width: '180px'}}*/}
          {/*      value={selectedTimezone}*/}
          {/*      defaultValue={selectedTimezone}*/}
          {/*      onChange={handleTimezoneChange}*/}
          {/*  >*/}
          {/*    {timezones.map((tz) => (*/}
          {/*        <Option key={tz} value={tz}>*/}
          {/*          {tz}*/}
          {/*        </Option>*/}
          {/*    ))}*/}
          {/*  </Select>*/}

          {/*</div>*/}

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

export default React.memo(ControlPanel);
