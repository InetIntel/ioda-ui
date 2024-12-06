/*
 * Portions of this source code are Copyright (c) 2021 Georgia Tech Research
 * Corporation. All Rights Reserved. Permission to copy, modify, and distribute
 * this software and its documentation for academic research and education
 * purposes, without fee, and without a written agreement is hereby granted,
 * provided that the above copyright notice, this paragraph and the following
 * three paragraphs appear in all copies. Permission to make use of this
 * software for other than academic research and education purposes may be
 * obtained by contacting:
 *
 *  Office of Technology Licensing
 *  Georgia Institute of Technology
 *  926 Dalney Street, NW
 *  Atlanta, GA 30318
 *  404.385.8066
 *  techlicensing@gtrc.gatech.edu
 *
 * This software program and documentation are copyrighted by Georgia Tech
 * Research Corporation (GTRC). The software program and documentation are
 * supplied "as is", without any accompanying services from GTRC. GTRC does
 * not warrant that the operation of the program will be uninterrupted or
 * error-free. The end-user understands that the program was developed for
 * research purposes and is advised not to rely exclusively on the program for
 * any reason.
 *
 * IN NO EVENT SHALL GEORGIA TECH RESEARCH CORPORATION BE LIABLE TO ANY PARTY FOR
 * DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING
 * LOST PROFITS, ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION,
 * EVEN IF GEORGIA TECH RESEARCH CORPORATION HAS BEEN ADVISED OF THE POSSIBILITY
 * OF SUCH DAMAGE. GEORGIA TECH RESEARCH CORPORATION SPECIFICALLY DISCLAIMS ANY
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE PROVIDED
 * HEREUNDER IS ON AN "AS IS" BASIS, AND  GEORGIA TECH RESEARCH CORPORATION HAS
 * NO OBLIGATIONS TO PROVIDE MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR
 * MODIFICATIONS.
 */

// React Imports
import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
// Internationalization
import T from "i18n-react";
// Data Hooks
import {
    getEntityMetadata,
    regionalSignalsTableSummaryDataAction,
    asnSignalsTableSummaryDataAction,
} from "../../data/ActionEntities";
import { getTopoAction } from "../../data/ActionTopo";
import { getDatasourcesAction } from "../../data/ActionDatasources";
import {
    searchAlerts,
    searchEvents,
    searchRelatedToMapSummary,
    searchRelatedToTableSummary,
    totalOutages,
} from "../../data/ActionOutages";
import {
    getSignalsAction,
    getRawRegionalSignalsPingSlash24Action,
    getRawRegionalSignalsBgpAction,
    getRawRegionalSignalsUcsdNtAction,
    getRawRegionalSignalsMeritNtAction,
    getRawAsnSignalsPingSlash24Action,
    getRawAsnSignalsBgpAction,
    getRawAsnSignalsUcsdNtAction,
    getRawAsnSignalsMeritNtAction,
    getAdditionalRawSignalAction,
} from "../../data/ActionSignals";
// Components
import ControlPanel from "../../components/controlPanel/ControlPanel";
import EntitySearchTypeahead from "../../components/entitySearchTypeahead/EntitySearchTypeahead";
import EntityRelated from "./EntityRelated";
import Loading from "../../components/loading/Loading";
import TimeStamp from "../../components/timeStamp/TimeStamp";
import * as topojson from "topojson";

import CustomToolip from "../../components/tooltip/Tooltip";

// Helper Functions
import {
    convertValuesForSummaryTable,
    combineValuesForSignalsTable,
    convertTsDataForHtsViz,
    getOutageCoords,
    normalize,
    controlPanelTimeRangeLimit,
    legend,
} from "../../utils";
import Error from "../../components/error/Error";
import { Helmet } from "react-helmet";
import ChartTabCard from "../../components/cards/ChartTabCard";
import ShareLinkModal from "../../components/modal/ShareLinkModal";
import MarkupStudioModal from "./components/MarkupStudioModal";

// Chart libraries
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
require("highcharts/modules/exporting")(Highcharts);
require("highcharts/modules/export-data")(Highcharts);
require("highcharts/modules/offline-exporting")(Highcharts);
import iodaWatermark from "images/ioda-canvas-watermark.svg";

import { getSavedAdvancedModePreference } from "../../utils/storage";
import {
    getNowAsUTC,
    getNowAsUTCSeconds,
    getSeconds,
    getSecondsAsErrorDurationString,
    millisecondsToSeconds,
    secondsToMilliseconds,
    secondsToUTC,
} from "../../utils/timeUtils";
import { getDateRangeFromUrl, hasDateRangeInUrl } from "../../utils/urlUtils";
import { Button, Checkbox, Popover, Tooltip } from "antd";
import {
    DownloadOutlined,
    EditOutlined,
    SettingOutlined,
    ShareAltOutlined,
} from "@ant-design/icons";
import MagnifyExpandIcon from "@2fd/ant-design-icons/lib/MagnifyExpand";
import {getChartExportFileName, handleCSVDownload} from "./utils/EntityUtils";

const CUSTOM_FONT_FAMILY = "Inter, sans-serif";
const dataSource = ["bgp", "ping-slash24", "merit-nt", "gtr.WEB_SEARCH"];

/**
 * Calculate the time range for the time series chart. The range shown in the
 * navigator should be defined as max(2*diff, limit)
 * @param {*} fromDateSeconds
 * @param {*} untilDateSeconds
 * @returns object containing date range (dates as seconds)
 */
const getSignalTimeRange = (fromDateSeconds, untilDateSeconds) => {
    const MAX_DAYS_AS_SEC = controlPanelTimeRangeLimit;
    const diff = untilDateSeconds - fromDateSeconds;

    const cappedDiff = Math.min(2 * diff, MAX_DAYS_AS_SEC);
    const newFrom = untilDateSeconds - cappedDiff;

    return {
        timeSignalFrom: newFrom,
        timeSignalUntil: untilDateSeconds,
    };
};

const formatLocaleNumber = (value, precision) => {
    return Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: precision,
    }).format(value);
};

/**
 * Gets the minimum value from an array of numbers that may contain null values
 */
const getMinValue = (values) =>
    values.reduce((m, v) => (v != null && v < m ? v : m), Infinity);

/**
 * Gets the maximum value from an array of numbers that may contain null values
 */
const getMaxValue = (values) =>
    values.reduce((m, v) => (v != null && v > m ? v : m), -Infinity);

const urlRange = getDateRangeFromUrl();
const fromDate =
    urlRange.urlFromDate ?? getSeconds(getNowAsUTC().subtract(24, "hour"));
const untilDate = urlRange.urlUntilDate ?? getNowAsUTCSeconds();

const Entity = (props) => {

    const {
        type,
        entityType,
        entityCode,
        regionCode,
        asnCode,
        signals,
        alerts,
        relatedToMapSummary,
        relatedToTableSummary,
        regionalSignalsTableSummaryData,
        asnSignalsTableSummaryData,
        rawRegionalSignalsPingSlash24,
        rawRegionalSignalsBgp,
        rawRegionalSignalsUcsdNt,
        rawRegionalSignalsMeritNt,
        rawAsnSignalsPingSlash24,
        rawAsnSignalsBgp,
        rawAsnSignalsUcsdNt,
        rawAsnSignalsMeritNt,
        additionalRawSignal,
        navigate,
        searchParams
    } = props;

    const timeSeriesChartRef = useRef();

    const isAdvancedMode = getSavedAdvancedModePreference();
    // Global
    const [entityTypeState, setEntityTypeState] = useState("asn");
    const [entityCodeState, setEntityCodeState] = useState(asnCode);
    const [entityName, setEntityName] = useState("");
    const [parentEntityName, setParentEntityName] = useState("");
    const [parentEntityCode, setParentEntityCode] = useState("");
    const [displayTimeRangeError, setDisplayTimeRangeError] = useState(false);
    const [entityMetadata, setEntityMetadata] = useState({});
    // Data Sources Available
    const [dataSources, setDataSources] = useState(null);
    // Control Panel
    const [from, setFrom] = useState(fromDate);
    const [until, setUntil] = useState(untilDate);
    // Search Bar
    const [sourceParams, setSourceParams] = useState(["WEB_SEARCH"]);
    // XY Plot Time Series
    const [xyDataOptions, setXyDataOptions] = useState(null);
    const [xyChartOptions, setXyChartOptions] = useState(null);
    const [tsDataRaw, setTsDataRaw] = useState(null);
    const [tsDataNormalized, setTsDataNormalized] = useState(true);
    const [tsDataDisplayOutageBands, setTsDataDisplayOutageBands] = useState(isAdvancedMode);
    const [tsDataLegendRangeFrom, setTsDataLegendRangeFrom] = useState(fromDate);
    const [tsDataLegendRangeUntil, setTsDataLegendRangeUntil] = useState(untilDate);
    const [showResetZoomButton, setShowResetZoomButton] = useState(false);
    // Used for responsively styling the xy chart
    const [tsDataScreenBelow970, setTsDataScreenBelow970] = useState( window.innerWidth <= 970);
    const [tsDataScreenBelow678, setTsDataScreenBelow678] = useState( window.innerWidth <= 678);
    // display export modal
    const [showXyChartModal, setShowXyChartModal] = useState(false);
    // display link sharing modal
    const [showShareLinkModal, setShowShareLinkModal] = useState(false);
    // display annotation studio modal
    const [showMarkupStudioModal, setShowMarkupStudioModal] = useState(false);
    const [markupStudioSvgBaseString, setMarkupStudioSvgBaseString] = useState("");
    // Used to track which series have visibility, needed for when switching between normalized/absolute values to maintain state
    const [tsDataSeriesVisibleMap, setTsDataSeriesVisibleMap] =
        useState(dataSource.reduce((result, item) => {
            result[item] = true;
            return result;
        }, {})); //new Map(dataSource.map(k => {return [k,true]}))
    const [prevDataSeriesVisibleMap, setPrevDataSeriesVisibleMap] =
        useState(dataSource.reduce((result, item) => {
            result[item] = true;
            return result;
        }, {}));
    // Event/Table Data
    const [currentTable, setCurrentTable] = useState("alert")
    const [eventDataRaw, setEventDataRaw] = useState(null);
    const [alertDataRaw, setAlertDataRaw] = useState(null);
    // relatedTo entity Map
    const [topoData, setTopoData] = useState(null);
    const [topoScores, setTopoScores] = useState(null);
    const [bounds, setBounds] = useState(null);
    //const [relatedToMapSummaryState, setRelatedToMapSummaryState] = useState(null);
    const [summaryDataMapRaw, setSummaryDataMapRaw] = useState(null);
    // relatedTo entity Table
    const [relatedToTableApiPageNumber, setRelatedToTableApiPageNumber] = useState(0);
    const [relatedToTableSummaryState, setRelatedToTableSummaryState] = useState(null);
    const [relatedToTableSummaryProcessed, setRelatedToTableSummaryProcessed] = useState(null);
    const [relatedToTablePageNumber, setRelatedToTablePageNumber] = useState(0);
    // RawSignalsModal window display status
    const [showMapModal, setShowMapModal] = useState(false);
    const [showTableModal, setShowTableModal] = useState(false);
    // Signals RawSignalsModal Table on Map Panel
    const [regionalSignalsTableSummaryDataState, setRegionalSignalsTableSummaryDataState] = useState([]);
    const [regionalSignalsTableSummaryDataProcessed, setRegionalSignalsTableSummaryDataProcessed] = useState([]);
    const [regionalSignalsTableTotalCount, setRegionalSignalsTableTotalCount] = useState(0);
    const [regionalSignalsTableEntitiesChecked, setRegionalSignalsTableEntitiesChecked] = useState(0);
    // Signals RawSignalsModal Table on Table Panel
    const [asnSignalsTableSummaryDataState, setAsnSignalsTableSummaryDataState] = useState([]);
    const [asnSignalsTableSummaryDataProcessed, setAsnSignalsTableSummaryDataProcessed] = useState([]);
    const [asnSignalsTableTotalCount, setAsnSignalsTableTotalCount] = useState(0);
    const [asnSignalsTableEntitiesChecked, setAsnSignalsTableEntitiesChecked] = useState(0);
    // Stacked Horizon Visual on Region Map Panel
    const [rawRegionalSignalsRawBgp, setRawRegionalSignalsRawBgp] = useState([]);
    const [rawRegionalSignalsRawPingSlash24, setRawRegionalSignalsRawPingSlash24] = useState([]);
    const [rawRegionalSignalsRawUcsdNt, setRawRegionalSignalsRawUcsdNt] = useState([]);
    const [rawRegionalSignalsRawMeritNt, setRawRegionalSignalsRawMeritNt] = useState([]);
    const [rawRegionalSignalsProcessedBgp, setRawRegionalSignalsProcessedBgp] = useState(null);
    const [rawRegionalSignalsProcessedPingSlash24, setRawRegionalSignalsProcessedPingSlash24] = useState(null);
    const [rawRegionalSignalsProcessedUcsdNt, setRawRegionalSignalsProcessedUcsdNt] = useState(null);
    const [rawRegionalSignalsProcessedMeritNt, setRawRegionalSignalsProcessedMeritNt] = useState(null);
    // tracking when to dump states if a new entity is chosen
    const [rawRegionalSignalsLoaded, setRawRegionalSignalsLoaded] = useState(false);
    // Stacked Horizon Visual on ASN Table Panel
    const [rawAsnSignalsRawBgp, setRawAsnSignalsRawBgp] = useState([]);
    const [rawAsnSignalsRawPingSlash24, setRawAsnSignalsRawPingSlash24] = useState([]);
    const [rawAsnSignalsRawUcsdNt, setRawAsnSignalsRawUcsdNt] = useState([]);
    const [rawAsnSignalsRawMeritNt, setRawAsnSignalsRawMeritNt] = useState([]);
    const [rawAsnSignalsProcessedBgp, setRawAsnSignalsProcessedBgp] = useState(null);
    const [rawAsnSignalsProcessedPingSlash24, setRawAsnSignalsProcessedPingSlash24] = useState(null);
    const [rawAsnSignalsProcessedUcsdNt, setRawAsnSignalsProcessedUcsdNt] = useState(null);
    const [rawAsnSignalsProcessedMeritNt, setRawAsnSignalsProcessedMeritNt] = useState(null);
    const [rawAsnSignalsLoaded, setRawAsnSignalsLoaded] = useState(false);
    // Shared between Modals
    const [rawSignalsMaxEntitiesHtsError, setRawSignalsMaxEntitiesHtsError] = useState("");
    const [regionalRawSignalsLoadAllButtonClicked, setRegionalRawSignalsLoadAllButtonClicked] = useState(false);
    const [asnRawSignalsLoadAllButtonClicked, setAsnRawSignalsLoadAllButtonClicked] = useState(false);
    const [loadAllButtonEntitiesLoading, setLoadAllButtonEntitiesLoading] = useState(false);
    const [checkMaxButtonLoading, setCheckMaxButtonLoading] = useState(false);
    const [uncheckAllButtonLoading, setUncheckAllButtonLoading] = useState(false);
    // additional raw signals are requested beyond what was initially loaded
    const [additionalRawSignalRequestedPingSlash24, setAdditionalRawSignalRequestedPingSlash24] = useState(false);
    const [additionalRawSignalRequestedBgp, setAdditionalRawSignalRequestedBgp] = useState(false);
    const [additionalRawSignalRequestedUcsdNt, setAdditionalRawSignalRequestedUcsdNt] = useState(false);
    const [additionalRawSignalRequestedMeritNt, setAdditionalRawSignalRequestedMeritNt] = useState(false);
    const [currentTab, setCurrentTab] = useState(1);
    const [simplifiedView, setSimplifiedView] = useState(!isAdvancedMode);
    const [currentEntitiesChecked, setCurrentEntitiesChecked] = useState(100);

    // Popovers
    const [displayChartSettingsPopover, setDisplayChartSettingsPopover] = useState(false);
    const [displayChartSharePopover, setDisplayChartSharePopover] = useState(false);

    const initialTableLimit = 300;
    const initialHtsLimit = 100;
    const maxHtsLimit = 150;

    function updateEntityMetaData (entityName, entityCode) {
        getEntityMetadata(entityName, entityCode).then((data) => {
            console.log(data)
            setEntityMetadata(data);
            setEntityName(data[0]["name"]);
            setParentEntityName(data[0]["attrs"]["country_name"] || parentEntityName);
            setParentEntityCode(data[0]["attrs"]["country_code"] || parentEntityCode);
        });
    }

    useEffect(() => {
        // Get Topo Data for relatedTo Map
        // ToDo: update parameter to base value off of url entity type
        if(entityMetadata && Object.keys(entityMetadata).length > 0) {
            getDataTopo("region");
            getDataRelatedToMapSummary("region");
            getDataRelatedToTableSummary("asn");
        }
    }, [entityMetadata]);

    // Monitor screen width
    useEffect(() => {
        window.addEventListener("resize", resize);
        // Cleanup function
        return () => {
            window.removeEventListener("resize", resize);
        };
    }, []);


    useEffect(() => {
        // If fromDate is after untilDate, show error and terminate
        if (untilDate - fromDate <= 0) {
            setDisplayTimeRangeError(true);
            return;
        }
        setFrom(fromDate);
        setUntil(untilDate);
        setTsDataLegendRangeFrom(fromDate);
        setTsDataLegendRangeUntil(untilDate);
        // If the difference is larger than the limit, terminate
        if (untilDate - fromDate >= controlPanelTimeRangeLimit) {
            return;
        }
        const { timeSignalFrom, timeSignalUntil } = getSignalTimeRange(
            fromDate,
            untilDate
        );
        // Overview Panel
        // Pull events from the same range as time series signal to show all
        // alerts in the navigator range
        props.searchEventsAction(
            timeSignalFrom,
            timeSignalUntil,
            "asn",
            entityCodeState
        );
        props.searchAlertsAction(
            fromDate,
            untilDate,
            "asn",
            entityCodeState,
            null,
            null,
            null
        );
        props.getSignalsAction(
            "asn",
            entityCodeState,
            timeSignalFrom,
            timeSignalUntil,
            null,
            3000,
            sourceParams
        );
        // Get entity name from code provided in url
        updateEntityMetaData("asn", asnCode);
    }, [untilDate, fromDate, "asn", asnCode]);

    useEffect(() => {
        if(props.datasources) {
            setDataSources(props.datasources);
        }
    }, [props.datasources]);

    useEffect(() => {
        const { timeSignalFrom, timeSignalUntil } = getSignalTimeRange(from, until);
        if(!sourceParams) return;
        props.getSignalsAction(
            "asn",
            entityCodeState,
            timeSignalFrom,
            timeSignalUntil,
            null,
            3000,
            sourceParams
        );
    }, [sourceParams, from, until, "asn", entityCodeState]);

    // Make API call for data to populate XY Chart
    useEffect(() => {
        if(signals) {
            // Map props to state and initiate data processing
            setTsDataRaw(signals);
        }
    }, [signals]);

    useEffect(() => {
        if(tsDataRaw) {
            // For XY Plotted Graph
            convertValuesForXyViz();
        }
    }, [tsDataRaw]);

    useEffect(() => {
        // Make API call for data to populate event table
        if(props.events) {
            setEventDataRaw(props.events);
        }
    }, [props.events]);

    // After API call for Alert Table data completes, check for lengths to set display counts and then process to populate
    useEffect(() => {
        if(alerts) {
            setAlertDataRaw(alerts);
        }
    }, [alerts]);

    // After API call for outage summary data completes, pass summary data to map function for data merging
    useEffect(() => {
        if(relatedToMapSummary) {
            setSummaryDataMapRaw(relatedToMapSummary);
        }
    }, [relatedToMapSummary]);

    useEffect(() => {
        if(summaryDataMapRaw || topoData) {
            getMapScores();
        }
    }, [summaryDataMapRaw, topoData]);

    // After API call for outage summary data completes, pass summary data to table component for data merging
    useEffect(() => {
        if(relatedToTableSummary) {
            setRelatedToTableSummaryState(relatedToTableSummary);
        }
    }, [relatedToTableSummary]);

    useEffect(() => {
        if(relatedToTableSummaryState) {
            _convertValuesForSummaryTable();
        }
    }, [relatedToTableSummaryState]);

    useEffect(() => {
        if (regionalSignalsTableSummaryData) {
            setRegionalSignalsTableSummaryDataState(regionalSignalsTableSummaryData);
        }
    }, [regionalSignalsTableSummaryData]);

    useEffect(() => {
        if(regionalSignalsTableSummaryDataState) {
            _combineValuesForSignalsTable("region");
        }
    }, [regionalSignalsTableSummaryDataState]);

    useEffect(() => {
        if(asnSignalsTableSummaryData) {
            setAsnSignalsTableSummaryDataState(asnSignalsTableSummaryData);
        }
    }, [asnSignalsTableSummaryData]);

    useEffect(() => {
        if(asnSignalsTableSummaryDataState) {
            _combineValuesForSignalsTable("asn");
        }
    }, [asnSignalsTableSummaryDataState]);

    useEffect(() => {
        if(tsDataNormalized && Object.keys(tsDataNormalized).length > 0) {
            // For XY Plotted Graph
            convertValuesForXyViz();
        }
    }, [tsDataNormalized]);

    useEffect(() => {
        if(tsDataDisplayOutageBands) {
            // For XY Plotted Graph
            convertValuesForXyViz();
        }
    }, [tsDataDisplayOutageBands]);

    useEffect(() => {
        if(tsDataScreenBelow678) {
            // For XY Plotted Graph
            convertValuesForXyViz();
        }
    }, [tsDataScreenBelow678]);

    useEffect(() => {
        if(tsDataSeriesVisibleMap) {
            // For XY Plotted Graph
            convertValuesForXyViz();
        }
    }, [tsDataSeriesVisibleMap]);


    // data for regional signals table Ping-Slash24 Source
    useEffect(() => {
        if(rawRegionalSignalsPingSlash24 && showMapModal) {
            let rawRegionalSignals = [];
            rawRegionalSignalsPingSlash24.map((signal) => {
                //Remove empty items and assign to proper state. Then call next function
                signal.length ? rawRegionalSignals.push(signal[0]) : null;
            });
            setRawRegionalSignalsRawPingSlash24(rawRegionalSignals);
        }
    }, [rawRegionalSignalsPingSlash24, showMapModal]);

    useEffect(() => {
        if(rawRegionalSignalsRawPingSlash24) {
            convertValuesForHtsViz("ping-slash24", "region");
        }
    }, [rawRegionalSignalsRawPingSlash24]);

    // data for regional signals table BGP Source
    useEffect(() => {
        if(rawRegionalSignalsBgp && showMapModal) {
            // assign to respective state
            let rawRegionalSignals = [];
            rawRegionalSignalsBgp.map((signal) => {
                //Remove empty items and assign to proper state. Then call next function
                signal.length ? rawRegionalSignals.push(signal[0]) : null;
            });
            setRawRegionalSignalsRawBgp(rawRegionalSignals);
        }
    }, [rawRegionalSignalsBgp, showMapModal]);

    useEffect(() => {
        if(rawRegionalSignalsBgp) {
            convertValuesForHtsViz("bgp", "region");
        }
    }, [rawRegionalSignalsBgp]);

    // data for regional signals table UCSD-NT Source
    useEffect(() => {
        if(rawRegionalSignalsUcsdNt && showMapModal) {
            // assign to respective state
            let rawRegionalSignals = [];
            rawRegionalSignalsUcsdNt.map((signal) => {
                //Remove empty items and assign to proper state. Then call next function
                signal.length ? rawRegionalSignals.push(signal[0]) : null;
            });
            setRawRegionalSignalsRawUcsdNt(rawRegionalSignals);
        }
    }, [rawRegionalSignalsUcsdNt, showMapModal]);

    useEffect(() => {
        if(rawRegionalSignalsRawUcsdNt) {
            convertValuesForHtsViz("ucsd-nt", "region");
        }
    }, [rawRegionalSignalsRawUcsdNt]);

    // data for regional signals table Merit-NT Source
    useEffect(() => {
        if(rawRegionalSignalsMeritNt && showMapModal) {
            // assign to respective state
            let rawRegionalSignals = [];
            rawRegionalSignalsMeritNt.map((signal) => {
                //Remove empty items and assign to proper state. Then call next function
                signal.length ? rawRegionalSignals.push(signal[0]) : null;
            });
            setRawRegionalSignalsRawMeritNt(rawRegionalSignals);
        }
    }, [rawRegionalSignalsMeritNt, showMapModal]);

    useEffect(() => {
        if(rawRegionalSignalsRawMeritNt) {
            convertValuesForHtsViz("merit-nt", "region");
        }
    }, [rawRegionalSignalsRawMeritNt]);

    // data for asn signals table Ping-Slash24 Source
    useEffect(() => {
        if(rawAsnSignalsPingSlash24 && showTableModal) {
            let rawAsnSignals = [];
            rawAsnSignalsPingSlash24.map((signal) => {
                //Remove empty items and assign to proper state. Then call next function
                signal.length ? rawAsnSignals.push(signal[0]) : null;
            });
            setRawAsnSignalsRawPingSlash24(rawAsnSignals);
        }
    }, [rawAsnSignalsPingSlash24, showTableModal]);

    useEffect(() => {
        if(rawAsnSignalsRawPingSlash24) {
            convertValuesForHtsViz("ping-slash24", "asn");
        }
    }, [rawAsnSignalsRawPingSlash24]);

    // data for asn signals table BGP Source
    useEffect(() => {
        if(rawAsnSignalsBgp && showTableModal) {
            // assign to respective state
            let rawAsnSignals = [];
            rawAsnSignalsBgp.map((signal) => {
                //Remove empty items and assign to proper state. Then call next function
                signal.length ? rawAsnSignals.push(signal[0]) : null;
            });
            setRawAsnSignalsRawBgp(rawAsnSignals);
        }
    }, [rawAsnSignalsBgp, showTableModal]);

    useEffect(() => {
        if(rawAsnSignalsRawBgp) {
            convertValuesForHtsViz("bgp", "asn");
        }
    }, [rawAsnSignalsRawBgp]);

    // data for asn signals table UCSD-NT Source
    useEffect(() => {
        if(rawAsnSignalsUcsdNt && showTableModal) {
            // assign to respective state
            let rawAsnSignals = [];
            rawAsnSignalsUcsdNt.map((signal) => {
                //Remove empty items and assign to proper state. Then call next function
                signal.length ? rawAsnSignals.push(signal[0]) : null;
            });
            setRawAsnSignalsRawUcsdNt(rawAsnSignals);
        }
    }, [rawAsnSignalsUcsdNt, showTableModal]);

    useEffect(() => {
        if(rawAsnSignalsRawUcsdNt) {
            convertValuesForHtsViz("ucsd-nt", "asn");
        }
    }, [rawAsnSignalsRawUcsdNt]);

    // data for asn signals table Merit-NT Source
    useEffect(() => {
        if(rawAsnSignalsMeritNt && showTableModal) {
            // assign to respective state
            let rawAsnSignals = [];
            rawAsnSignalsMeritNt.map((signal) => {
                //Remove empty items and assign to proper state. Then call next function
                signal.length ? rawAsnSignals.push(signal[0]) : null;
            });
            setRawAsnSignalsRawMeritNt(rawAsnSignals);
        }
    }, [rawAsnSignalsMeritNt, showTableModal]);

    useEffect(() => {
        if(rawAsnSignalsRawMeritNt) {
            convertValuesForHtsViz("merit-nt", "asn");
        }
    }, [rawAsnSignalsRawMeritNt]);

    // data for additional raw feed signals to use after load all button is clicked
    useEffect(() => {
        if(!additionalRawSignal) return;
        const rawSignal = additionalRawSignal[0][0];
        if (rawSignal !== undefined) {
            switch (rawSignal["entityType"]) {
                case "region":
                    switch (rawSignal["datasource"]) {
                        case "ping-slash24":
                            setRawRegionalSignalsRawPingSlash24(
                                (prevState) => prevState.concat(additionalRawSignal[0])
                            );
                            break;
                        case "bgp":
                            setRawRegionalSignalsRawBgp(
                                (prevState) => prevState.concat(additionalRawSignal[0])
                            );
                            break;
                        case "ucsd-nt":
                            setRawRegionalSignalsRawUcsdNt((prevState) => prevState.concat(
                                additionalRawSignal[0])
                            );
                            break;
                        case "merit-nt":
                            setRawRegionalSignalsRawMeritNt((prevState) => prevState.concat(
                                additionalRawSignal[0])
                            );
                            break;
                    }
                    break;
                case "asn":
                    switch (rawSignal["datasource"]) {
                        case "ping-slash24":
                            setRawAsnSignalsRawPingSlash24((prevState) => prevState.concat(
                                additionalRawSignal[0])
                            );
                            break;
                        case "bgp":
                            setRawAsnSignalsRawBgp((prevState) => prevState.concat(
                                additionalRawSignal[0])
                            );
                            break;
                        case "ucsd-nt":
                            setRawAsnSignalsRawUcsdNt((prevState) => prevState.concat(
                                additionalRawSignal[0])
                            );
                            break;
                        case "merit-nt":
                            setRawAsnSignalsRawMeritNt((prevState) => prevState.concat(
                                additionalRawSignal[0])
                            );
                            break;
                    }
                    break;
            }
        }
    }, [additionalRawSignal]);

    useEffect(() => {
        // Rerender chart and set navigator bounds
        if(xyChartOptions) {
            renderXyChart();
            const navigatorLowerBound = secondsToMilliseconds(tsDataLegendRangeFrom);
            const navigatorUpperBound = secondsToMilliseconds(tsDataLegendRangeUntil);
            setChartNavigatorTimeRange(navigatorLowerBound, navigatorUpperBound);
        }
    }, [xyChartOptions]);

    useEffect(() => {
        if (showMapModal) {
            if (!rawRegionalSignalsLoaded) {
                props.regionalSignalsTableSummaryDataAction("region", entityTypeState, entityCodeState)
                setRawRegionalSignalsLoaded(true);
            }
        } else {
            // Reset if you want to reload data next time
            setRawRegionalSignalsLoaded(false);
        }
    }, [showMapModal]);

    useEffect(() => {
        if (showTableModal) {
            if (!rawAsnSignalsLoaded) {
                props.asnSignalsTableSummaryDataAction("asn", entityTypeState, entityCodeState)
                setRawAsnSignalsLoaded(true);
            }
        } else {
            setRawAsnSignalsLoaded(false);
        }
    }, [showTableModal]);

    useEffect(() => {
        if(regionalSignalsTableSummaryDataProcessed && Object.keys(regionalSignalsTableSummaryDataProcessed).length > 0) {
            // Get data for Stacked horizon series raw signals with all regions if data is not yet available
            getSignalsHtsDataEvents("region", "ping-slash24");
            getSignalsHtsDataEvents("region", "bgp");
            getSignalsHtsDataEvents("region", "ucsd-nt");
            getSignalsHtsDataEvents("region", "merit-nt");
            convertValuesForHtsViz("ping-slash24", "region");
            convertValuesForHtsViz("bgp", "region");
            convertValuesForHtsViz("ucsd-nt", "region");
            convertValuesForHtsViz("merit-nt", "region");
        }

    }, [regionalSignalsTableSummaryDataProcessed]);

    useEffect(() => {
        if(asnSignalsTableSummaryDataProcessed && Object.keys(asnSignalsTableSummaryDataProcessed).length > 0) {
            // Populate Stacked horizon graph with all regions
            convertValuesForHtsViz("ping-slash24", "asn");
            convertValuesForHtsViz("bgp", "asn");
            convertValuesForHtsViz("ucsd-nt", "asn");
            convertValuesForHtsViz("merit-nt", "asn");
            if(entityTypeState !== "asn") {
                getSignalsHtsDataEvents("asn", "ping-slash24");
                getSignalsHtsDataEvents("asn", "ucsd-nt");
                getSignalsHtsDataEvents("asn", "bgp");
                getSignalsHtsDataEvents("asn", "merit-nt");
            }
            else {
                getSignalsHtsDataEvents("country", "ping-slash24");
                getSignalsHtsDataEvents("country", "ucsd-nt");
                getSignalsHtsDataEvents("country", "bgp");
                getSignalsHtsDataEvents("country", "merit-nt");
            }
        }
    }, [asnSignalsTableSummaryDataProcessed]);

    // Control Panel
    // manage the date selected in the input
    function handleTimeFrame ({ _from, _until }) {
        if(regionCode != null && regionCode.length > 0) {
            navigate(
                `/${entityTypeState}/${entityCodeState}/region/${regionCode}?from=${_from}&until=${_until}`
            );
        }
        if(asnCode != null && asnCode.length > 0) {
            navigate(
                `/${entityTypeState}/${entityCodeState}/asn/${asnCode}?from=${_from}&until=${_until}`
            );
        }
        navigate(
            `/${entityTypeState}/${entityCodeState}?from=${_from}&until=${_until}`
        );
    }

    function handleControlPanelClose() {
        navigate(
            hasDateRangeInUrl()
                ? `/dashboard?from=${_from}&until=${_until}`
                : `/dashboard`
        );
    }

    // Define what happens when user clicks suggested search result entry
    function handleResultClick(entity){
        if (!entity) return;
        if (!entity.url) return;
        console.log(entity);
        // navigate(`/${entity.type}/${entity.code}`);
        navigate(`/${entity.url}`)
    }

    // Function that returns search bar passed into control panel
    function populateSearchBar() {
        return (
            <EntitySearchTypeahead
                placeholder={T.translate("controlPanel.searchBarPlaceholder")}
                onSelect={(entity) => handleResultClick(entity)}
            />
        );
    }

    function getChartExportTitle() {
        return `${T.translate(
            "entity.xyChartTitle"
        )} ${entityName?.trim()}`;
    }

    function getChartExportSubtitle() {
        const fromDayjs = secondsToUTC(from);
        const untilDayjs = secondsToUTC(until);

        const formatExpanded = "MMMM D, YYYY h:mma";

        return `${fromDayjs.format(formatExpanded)} - ${untilDayjs.format(
            formatExpanded
        )} UTC`;
    }

    // function getChartExportFileName() {
    //   const fromDayjs = secondsToUTC(this.state.from);
    //
    //   const formatCompact = "YY-MM-DD-HH-mm";
    //
    //   const exportFileNameBase =
    //       `ioda-${entityName}-${fromDayjs.format(formatCompact)}`;
    //   return exportFileNameBase.replace(/\s+/g, "-").toLowerCase();
    // }

    // 1st Row
    // XY Chart Functions
    // format data from api to be compatible with chart visual
    function convertValuesForXyViz() {
        if(!tsDataRaw) {
            return;
        }
        const signalValues = [];
        const normalizedValues = [];

        // Holds a map of series-id to the max y-value in that series
        const seriesMaxes = {};

        // Holds a map of series-id to the min y-value in that series
        const seriesMins = {};

        // Loop through available datasources to collect plot points
        tsDataRaw[0].forEach((datasource) => {
            let id = datasource.datasource;
            id += datasource.subtype ? `.${datasource.subtype}` : "";

            // Only track the maxes of visible series. If we keep the maxes from
            // invisible series, they may influence the y-axis maxes even though they
            // aren't displayed
            const seriesMax = getMaxValue(datasource.values);
            if (tsDataSeriesVisibleMap[id]) {
                seriesMaxes[id] = tsDataNormalized ? 100 : seriesMax;
                seriesMins[id] = tsDataNormalized
                    ? 0
                    : getMinValue(datasource.values);
            }

            if (!datasource.values) {
                return;
            }

            const seriesDataValues = [];
            const seriesDataValuesNormalized = [];
            datasource.values.forEach((value, index) => {
                const x = secondsToMilliseconds(
                    datasource.from + datasource.step * index
                );
                const normalY = normalize(value, seriesMax);
                const y = tsDataNormalized ? normalY : value;

                seriesDataValues.push({ x, y });
                seriesDataValuesNormalized.push({ x, y: normalY });
            });

            // The last two values populating are the min value, and the max value.
            // Removing these from the coordinates.
            if (seriesDataValues.length > 2) {
                seriesDataValues.splice(-1, 2);
            }

            signalValues.push({ dataSource: id, values: seriesDataValues });
            normalizedValues.push({
                dataSource: id,
                values: seriesDataValuesNormalized,
            });
        });

        // Creates an array of [(series-id, series-max)...] sorted by max values
        const seriesSortedByMaxValues = Object.entries(seriesMaxes).sort(
            (a, b) => a[1] - b[1]
        );

        // Set the minimum factor jump to consider for partitioning. For a graph
        // with only two series, we drop the jump to visualize them separately
        let minFactorJump = 10;
        if (seriesSortedByMaxValues.length <= 2) {
            minFactorJump = 2;
        }

        // Track the largest factor increase (greater than minFactorJump) in maxes
        // of the series
        let maxFactorIncreaseValue = 1;
        let maxFactorIncreaseIndex = seriesSortedByMaxValues.length;
        for (let i = 1; i < seriesSortedByMaxValues.length; i++) {
            const currMax = seriesSortedByMaxValues[i][1];
            const prevMax = seriesSortedByMaxValues[i - 1][1];
            const factorIncrease = currMax / prevMax;
            if (
                factorIncrease > minFactorJump &&
                factorIncrease > maxFactorIncreaseValue
            ) {
                maxFactorIncreaseValue = factorIncrease;
                maxFactorIncreaseIndex = i;
            }
        }

        // Split the series into 2 arrays based on the partition line
        const leftPartition = seriesSortedByMaxValues.slice(
            0,
            maxFactorIncreaseIndex
        );
        const rightPartition = seriesSortedByMaxValues.slice(
            maxFactorIncreaseIndex,
            seriesSortedByMaxValues.length
        );

        // console.log("Sorted Series:", seriesSortedByMaxValues);
        // console.log("Left Partition:", leftPartition);
        // console.log("Right Partition:", rightPartition);

        // Get the max and min values for each partition. These will become the
        // max/mins for our two y-axes. We need to set axis mins because otherwise,
        // the axis bounds will shift when we drag the navigator
        let leftPartitionMax = -Infinity;
        let leftPartitionMin = Infinity;
        for (const [seriesId, seriesMax] of leftPartition) {
            leftPartitionMax = Math.max(leftPartitionMax, seriesMax);
            leftPartitionMin = Math.min(leftPartitionMin, seriesMins[seriesId]);
        }

        let rightPartitionMax = -Infinity;
        let rightPartitionMin = Infinity;
        for (const [seriesId, seriesMax] of rightPartition) {
            rightPartitionMax = Math.max(rightPartitionMax, seriesMax);
            rightPartitionMin = Math.min(rightPartitionMin, seriesMins[seriesId]);
        }

        // Extract the series-ids that are in the left partition
        const leftPartitionSeries = leftPartition.map((x) => x[0]);

        const formatYAxisLabels = (val) => {
            if (tsDataNormalized) {
                return val <= 100 ? `${val}%` : "";
            } else if (val > 999) {
                return formatLocaleNumber(val, 1);
            } else {
                return val;
            }
        };

        const tooltipContentFormatter = (ctx) => {
            const seriesName = ctx.series.name;
            const yValue = ctx.y;
            const formattedYValue = formatLocaleNumber(yValue, 2);
            if (tsDataNormalized) {
                return `${seriesName}: ${formattedYValue}%`;
            } else {
                return `${seriesName}: ${formattedYValue}`;
            }
        };

        // Define date formats for timeseries data
        // https://api.highcharts.com/class-reference/Highcharts.Time
        const dateFormats = {
            millisecond: "%l:%M:%S%p",
            second: "%l:%M:%S%p",
            minute: "%l:%M%p",
            hour: "%l:%M%p",
            day: "%b %e",
            week: "%b %e",
            month: "%b %Y",
            year: "%Y",
        };

        const xyChartXAxisTitle = T.translate("entity.xyChartXAxisTitle");

        const { chartSignals, alertBands } = createChartSeries(
            signalValues,
            normalizedValues,
            leftPartitionSeries
        );

        // Set necessary fields for chart exporting
        const exportChartTitle = getChartExportTitle();

        const exportChartSubtitle = getChartExportSubtitle();

        const exportFileName = getChartExportFileName(from, entityName);

        const chartOptions = {
            chart: {
                type: "line",
                zoomType: "x",
                resetZoomButton: {
                    theme: { style: { display: "none" } },
                },
                panning: true,
                panKey: "shift",
                animation: false,
                selectionMarkerFill: "rgba(50, 184, 237, 0.3)",
                height: tsDataScreenBelow678 ? 400 : 514,
                spacingBottom: 0,
                spacingLeft: 5,
                spacingRight: 5,
                style: {
                    fontFamily: CUSTOM_FONT_FAMILY,
                },
                events: {},
            },
            accessibility: {
                enabled: false,
            },
            credits: {
                enabled: false,
            },
            navigation: {
                buttonOptions: {
                    enabled: false,
                },
            },
            exporting: {
                fallbackToExportServer: false,
                filename: exportFileName,
                chartOptions: {
                    title: {
                        align: "left",
                        text: exportChartTitle,
                        style: {
                            fontWeight: "bold",
                        },
                    },
                    subtitle: {
                        align: "left",
                        text: exportChartSubtitle,
                    },
                    legend: {
                        itemDistance: 40,
                    },
                    spacing: [10, 10, 15, 10],
                },
                // Maintain a 16:9 aspect ratio: https://calculateaspectratio.com/
                sourceWidth: 1000,
                sourceHeight: 560,
            },
            title: {
                text: null,
            },
            tooltip: {
                headerFormat: "{point.key} (UTC)<br>",
                pointFormatter: function () {
                    return tooltipContentFormatter(this);
                },
                xDateFormat: "%a, %b %e %l:%M%p",
                borderWidth: 1.5,
                borderRadius: 0,
                style: {
                    fontSize: "14px",
                    fontFamily: CUSTOM_FONT_FAMILY,
                },
            },
            legend: {
                margin: 15,
                className: "time-series-legend",
                itemStyle: {
                    fontSize: tsDataScreenBelow678 ? "10px" : "12px",
                    fontFamily: CUSTOM_FONT_FAMILY,
                },
                // Compress legend items on small screens (remove column alignment)
                alignColumns: !tsDataScreenBelow678,
            },
            navigator: {
                enabled: true,
                time: {
                    useUTC: true,
                },
                margin: 10,
                maskFill: "rgba(50, 184, 237, 0.3)",
                outlineColor: "#aaa",
                xAxis: {
                    plotBands: alertBands,
                    gridLineColor: "#666",
                    gridLineDashStyle: "Dash",
                    tickPixelInterval: 100,
                    dateTimeLabelFormats: dateFormats,
                    labels: {
                        zIndex: 100,
                        align: "center",
                        y: 12,
                        style: {
                            //textOutline: "2px solid #fff",
                            color: "#666",
                            fontSize: "10px",
                            fontFamily: CUSTOM_FONT_FAMILY,
                        },
                    },
                },
                yAxis: {
                    visible: false,
                    floor: 0,
                    min: 0,
                    max: 110,
                },
            },
            time: {
                useUTC: true,
            },
            plotOptions: {
                spline: {
                    marker: {
                        enabled: true,
                    },
                },
                series: {
                    //showInNavigator: true,
                    animation: false,
                    states: {
                        hover: {
                            enabled: false,
                        },
                        inactive: {
                            opacity: 1,
                        },
                    },
                    events: {
                        legendItemClick: (e) => {
                            const legendItemId = e.target.userOptions.id;
                            handleChartLegendSelectionChange(legendItemId);
                        },
                    },
                },
            },
            xAxis: {
                type: "datetime",
                minRange: secondsToMilliseconds(5 * 60), // 5 minutes as milliseconds
                dateTimeLabelFormats: dateFormats,
                title: {
                    text: xyChartXAxisTitle,
                    style: {
                        fontSize: "12px",
                        fontFamily: CUSTOM_FONT_FAMILY,
                    },
                },
                labels: {
                    style: {
                        colors: "#111",
                        fontSize: "10px",
                        fontFamily: CUSTOM_FONT_FAMILY,
                    },
                },
                crosshair: true,
                plotBands: alertBands,
                events: {
                    afterSetExtremes: (e) => {
                        xyPlotRangeChanged(e);
                    },
                },
            },
            yAxis: [
                // Primary y-axis
                {
                    floor: 0,
                    min: tsDataNormalized ? 0 : leftPartitionMin,
                    max: tsDataNormalized ? 110 : leftPartitionMax,
                    alignTicks: true,
                    startOnTick: true,
                    endOnTick: true,
                    tickAmount: 12,
                    //tickInterval: 10,
                    gridLineWidth: 1,
                    gridLineColor: "#E6E6E6",
                    gridLineDashStyle: "ShortDash",
                    title: {
                        text: null,
                    },
                    labels: {
                        x: -5,
                        style: {
                            colors: "#111",
                            fontSize: "12px",
                            fontFamily: CUSTOM_FONT_FAMILY,
                        },
                        formatter: function (value) {
                            return formatYAxisLabels(value);
                        },
                    },
                },
                // Secondary y-axis (non-normalized mode only)
                {
                    opposite: true,
                    floor: 0,
                    min: rightPartitionMin,
                    max: rightPartitionMax,
                    alignTicks: true,
                    startOnTick: true,
                    endOnTick: true,
                    tickAmount: 12,
                    gridLineWidth: 1,
                    gridLineColor: "#E6E6E6",
                    gridLineDashStyle: "ShortDash",
                    title: {
                        text: null,
                    },
                    labels: {
                        x: 5,
                        style: {
                            colors: "#111",
                            fontSize: "12px",
                            fontFamily: CUSTOM_FONT_FAMILY,
                        },
                        formatter: function (value) {
                            return formatYAxisLabels(value);
                        },
                    },
                },
            ],
            series: chartSignals,
        };
        // Rerender chart and set navigator bounds
        setXyChartOptions(chartOptions);
    }

    function setDefaultNavigatorTimeRange(){
        const navigatorLowerBound = secondsToMilliseconds(from);
        const navigatorUpperBound = secondsToMilliseconds(until);

        setChartNavigatorTimeRange(navigatorLowerBound, navigatorUpperBound);
    }

    function setChartNavigatorTimeRange(fromMs, untilMs) {
        if (!timeSeriesChartRef.current) {
            return;
        }
        timeSeriesChartRef.current.chart.xAxis[0].setExtremes(fromMs, untilMs);
    }

    function getSeriesNameFromSource(source) {
        const legendDetails = legend.find((elem) => elem.key === source);

        if (!legendDetails) {
            return "";
        }

        return legendDetails.key.includes(".")
            ? `Google (${legendDetails.title})`
            : legendDetails.title;
    }

    // format data used to draw the lines in the chart, called from convertValuesForXyViz()
    function createChartSeries(signalValues, normalValues, primaryPartition) {
        const chartSignals = [];
        const alertBands = [];

        // Add alert bands series
        if (tsDataDisplayOutageBands) {
            if (eventDataRaw) {
                eventDataRaw.forEach((event) => {
                    alertBands.push({
                        color: "rgba(250, 62, 72, 0.2)",
                        from: secondsToMilliseconds(event.start),
                        to: secondsToMilliseconds(event.start + event.duration),
                    });
                });
            }
        }

        // Create series for main chart and navigator
        for (let i = 0; i < signalValues.length; i++) {
            const primarySignal = signalValues[i];
            const navigatorSignal = normalValues[i];
            const seriesId = primarySignal.dataSource;

            const legendDetails = legend.find(
                (elem) => elem.key === primarySignal.dataSource
            );

            if (legendDetails === undefined) {
                continue;
            }

            const primaryData = primarySignal.values.map((point) => {
                return [point.x, point.y];
            });

            const navigatorData = navigatorSignal.values.map((point) => {
                return [point.x, point.y];
            });

            const seriesName = getSeriesNameFromSource(primarySignal.dataSource);

            // Either place series on primary y-axis (left = 0) or secondary (right =
            // 1) based on whether the series-id is in the left partition or not. If
            // normalized mode, all series go on the primary y-axis
            let seriesYAxis = 0;
            if (!primaryPartition.includes(primarySignal.dataSource)) {
                seriesYAxis = 1;
            }

            // This is the series object for the primary chart. Note that we hide
            // these series from the navigator
            const primaryChartSeries = {
                type: "line",
                id: seriesId,
                name: seriesName,
                color: legendDetails.color,
                lineWidth: 0.7,
                data: primaryData,
                marker: {
                    radius: 1.5,
                },
                yAxis: seriesYAxis,
                showInNavigator: false,
                // Set visibility based on map
                // visible: !!this.state.tsDataSeriesVisibleMap[seriesId],
            };

            // This is the series object for the navigator only. Note that these
            // series are hidden from the main chart, but are linked to the visibility
            // of the main chart: if a series is hidden in the main chart, its
            // corresponding navigator series will also be hidden because its linked
            const navigatorChartSeries = {
                type: "line",
                lineWidth: 0,
                marker: {
                    enabled: false,
                },
                id: `${seriesId}-navigator`,
                linkedTo: seriesId,
                color: legendDetails.color,
                name: seriesName,
                data: navigatorData,
                showInLegend: false,
                showInNavigator: true,
            };

            chartSignals.push(primaryChartSeries);
            chartSignals.push(navigatorChartSeries);
        }

        return {
            alertBands,
            chartSignals,
        };
    }

    // function for when zoom/pan is used
    function xyPlotRangeChanged (event) {
        if (!event.target.series) {
            return;
        }

        // Count the number of visible series in our chart
        const hasVisibleSeries = event.target.series.some(
            (series) => !!series.visible
        );

        // If we don't have any data on the chart, Highcharts will set an arbitrary
        // erroring data range. We prevent this by terminating early
        if (!hasVisibleSeries) {
            return;
        }

        const axisMin = millisecondsToSeconds(event.min);
        const axisMax = millisecondsToSeconds(event.max);

        const isDefaultRange =
            axisMin === from && axisMax === until;

        setTsDataLegendRangeFrom(axisMin);
        setTsDataLegendRangeUntil(axisMax);
        setShowResetZoomButton(!isDefaultRange);
    }

    // populate xy chart UI
    function renderXyChart () {
        return (
            xyChartOptions && (
                <div className="entity__chart">
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={xyChartOptions}
                        ref={timeSeriesChartRef}
                    />
                </div>
            )
        );
    }

    function handleDisplayChartSettingsPopover(val) {
        setDisplayChartSettingsPopover(val);
    }

    function handleDisplayChartSharePopover(val){
        setDisplayChartSharePopover(val);
    }

    /**
     * Trigger a download of the chart from outside the chart context. Used in the
     * ShareLinkModal to trigger a direct download
     */
    function manuallyDownloadChart(imageType){
        if (!timeSeriesChartRef.current?.chart) {
            return;
        }

        // Append watermark to image on download:
        // https://www.highcharts.com/forum/viewtopic.php?t=47368
        timeSeriesChartRef.current.chart.exportChartLocal(
            {
                type: imageType,
            },
            {
                chart: {
                    events: {
                        load: function () {
                            const chart = this;
                            const watermarkAspectRatio = 0.184615;
                            const watermarkWidth = Math.floor(chart.chartWidth / 6);
                            const watermarkHeight = Math.floor(
                                watermarkWidth * watermarkAspectRatio
                            );
                            const padding = 12;

                            chart.watermarkImage = chart.renderer
                                .image(
                                    iodaWatermark,
                                    chart.chartWidth - watermarkWidth - padding,
                                    padding,
                                    watermarkWidth,
                                    watermarkHeight
                                )
                                .add()
                                .toFront();
                        },
                    },
                },
            }
        );
    }

    // function handleCSVDownload(){
    //   if (!timeSeriesChartRef.current) {
    //     return;
    //   }
    //
    //   const csvString = timeSeriesChartRef.current.chart.getCSV();
    //
    //   // The first column is the timestamp, and each following column is
    //   // duplicated because we duplicate each series for the navigator to always
    //   // show the normalized data. As such, we need to remove the duplicates.
    //   const parsedCSV = csvString
    //     .split("\n")
    //     .map((line) => {
    //       return line.split(",").filter((val, index) => {
    //         // Always keep the timestamp column
    //         if (index === 0) return true;
    //         // Duplicates are located at the even indices
    //         if (index % 2 === 1) return true;
    //         return false;
    //       });
    //     })
    //     .join("\n");
    //
    //   const isNormalized = !!tsDataNormalized;
    //   const fileName =
    //     getChartExportFileName(from, entityName) + (isNormalized ? "-normalized" : "-raw");
    //
    //   const blob = new Blob([parsedCSV], { type: "text/csv;charset=utf-8," });
    //   const objUrl = URL.createObjectURL(blob);
    //   const link = document.createElement("a");
    //   link.setAttribute("href", objUrl);
    //   link.setAttribute("download", `${fileName}.csv`);
    //   document.body.appendChild(link);
    //   link.click();
    //   document.body.removeChild(link);
    //
    //   registerAnalyticsEvent("Entity", "DownloadDataCSV");
    // }

    /**
     * Get an SVG node of the chart
     */
    function getChartSvg()  {
        if (timeSeriesChartRef.current) {
            return timeSeriesChartRef.current.chart.getSVG();
        }
        return null;
    }

    function handleShowMarkupStudioModal() {
        setShowMarkupStudioModal(true);
        setMarkupStudioSvgBaseString(getChartSvg());
    }

    function handleHideMarkupStudioModal() {
        setShowMarkupStudioModal(false);
    }

    // toggle normalized values and absolute values
    function changeXyChartNormalization() {
        setTsDataNormalized((prevState) => (!prevState));
    }

    // toggle any populated alert bands to be displayed in chart
    function handleDisplayAlertBands(showBands) {
        setTsDataDisplayOutageBands(showBands);
    }

    // Track screen width to shift around legend, adjust height of xy chart
    const resize = () => {
        const _tsDataScreenBelow970 = window.innerWidth <= 970;
        if (_tsDataScreenBelow970 !== tsDataScreenBelow970) {
            setTsDataScreenBelow970(_tsDataScreenBelow970);
        }

        const _tsDataScreenBelow678 = window.innerWidth <= 678;
        if (tsDataScreenBelow678 !== tsDataScreenBelow678) {
            setTsDataScreenBelow678(_tsDataScreenBelow678);
        }
    };

    function displayShareLinkModal() {
        setShowShareLinkModal(true);
    }

    function hideShareLinkModal(){
        setShowShareLinkModal(false);
    }

    // Switching between Events and Alerts

    // 2nd Row
    // RelatedTo Map
    // Make API call to retrieve topographic data
    function getDataTopo(entityType) {
        getTopoAction(entityType)
            .then((data) =>
                topojson.feature(
                    data.region.topology,
                    data.region.topology.objects["ne_10m_admin_1.regions"]
                )
            )
            .then((data) => {
                    setTopoData(data);
                }
            )
    }
    // Process Geo data from api, attribute outage scores to a new topoData property where possible, then render Map
    function getMapScores() {
        if (topoData && summaryDataMapRaw) {
            let _topoData = topoData;
            let features = [];
            let scores = [];
            let outageCoords;

            // get Topographic info for a country if it has outages
            summaryDataMapRaw.map((outage) => {
                let topoItemIndex = topoData.features.findIndex(
                    (topoItem) => topoItem.properties.name === outage.entity.name
                );

                if (topoItemIndex > 0) {
                    let item = _topoData.features[topoItemIndex];
                    item.properties.score = outage.scores.overall;
                    _topoData.features[topoItemIndex] = item;
                    features.push(item);
                    // Used to determine coloring on map objects
                    scores.push(outage.scores.overall);
                    scores.sort((a, b) => {
                        return a - b;
                    });
                }
            });

            // get impacted coordinates to determine zoom location based on affected entities, if any
            if (features.length > 0) {
                outageCoords = getOutageCoords(features);
            }

            setTopoScores(scores);
            setBounds(outageCoords);
        }
    }
    // Make API call to retrieve summary data to populate on map
    function getDataRelatedToMapSummary(entityType) {
        const limit = 170;
        const includeMetadata = true;
        let page = 0;
        const entityCode = null;
        let relatedToEntityType, relatedToEntityCode;
        switch (entityTypeState) {
            case "country":
                relatedToEntityType = entityTypeState;
                relatedToEntityCode = entityCodeState;
                break;
            case "region":
                relatedToEntityType = "country";
                relatedToEntityCode =
                    entityMetadata[0]["attrs"]["fqid"].split(".")[3];
                break;
            case "asn":
                relatedToEntityType = "asn";
                relatedToEntityCode =
                    entityMetadata[0]["attrs"]["fqid"].split(".")[1];
                break;
        }
        // console.log(entityType, relatedToEntityType, relatedToEntityCode);
        props.searchRelatedToMapSummary(
            from,
            until,
            entityType,
            relatedToEntityType,
            relatedToEntityCode,
            entityCode,
            limit,
            page,
            includeMetadata
        );
    }

    // function to manage when a user clicks a country in the map
    function handleEntityShapeClick(entity) {
        let path = `/region/${entity.properties.id}`;
        if (hasDateRangeInUrl()) {
            path += `?from=${fromDate}&until=${untilDate}`;
        }
        navigate(path);
    }

    // Show/hide modal when button is clicked on either panel
    function toggleModal(modalLocation) {
        if (modalLocation === "map") {
            // Get related entities used on table in map modal
            setShowMapModal((prev) => !prev);

        } else if (modalLocation === "table") {
            setShowTableModal((prev) => !prev);
        }
    }

    // Summary Table for related ASNs
    // Make API call to retrieve summary data to populate on map
    function getDataRelatedToTableSummary(entityType) {
        const limit = initialTableLimit;
        let page = relatedToTableApiPageNumber;
        const includeMetadata = true;
        const entityCode = null;
        let relatedToEntityType, relatedToEntityCode;
        switch (entityTypeState) {
            case "country":
                relatedToEntityType = entityTypeState;
                relatedToEntityCode = entityCodeState;
                break;
            case "region":
                relatedToEntityType = "country";
                relatedToEntityCode =
                    entityMetadata[0]["attrs"]["fqid"].split(".")[3];
                break;
            case "asn":
                relatedToEntityType = "asn";
                relatedToEntityCode =
                    entityMetadata[0]["attrs"]["fqid"].split(".")[1];
                entityType = "country";
                break;
        }
        // console.log(entityType, relatedToEntityType, relatedToEntityCode);
        props.searchRelatedToTableSummary(
            from,
            until,
            entityType,
            relatedToEntityType,
            relatedToEntityCode,
            entityCode,
            limit,
            page,
            includeMetadata
        );
    }
    // Make raw values from api compatible with table component
    function _convertValuesForSummaryTable(){
        let summaryData = convertValuesForSummaryTable(relatedToTableSummaryState);
        if (relatedToTableApiPageNumber === 0) {
            setRelatedToTableSummaryProcessed(summaryData);
        }
        // If the end of the data list is hit but more data exists, fetch it and tack it on
        if (relatedToTableApiPageNumber > 0) {
            setRelatedToTableSummaryProcessed((prevState) => prevState.concat(summaryData));
        }
    }

    // RawSignalsModal Windows
    // Make API call that gets raw signals for a group of entities
    function getSignalsHtsDataEvents(entityType, dataSource) {
        let attr = null;
        let order = "desc";
        let entities;

        switch (entityType) {
            case "region":
                entities = regionalSignalsTableSummaryDataProcessed
                    .map((entity) => {
                        // some entities don't return a code to be used in an api call, seem to default to '??' in that event
                        if (entity.code !== "??") {
                            return entity.entityCode;
                        }
                    })
                    .toString();
                switch (dataSource) {
                    case "ping-slash24":
                        props.getRawRegionalSignalsPingSlash24Action(
                            entityType,
                            entities,
                            from,
                            until,
                            attr,
                            order,
                            dataSource
                        );
                        break;
                    case "bgp":
                        props.getRawRegionalSignalsBgpAction(
                            entityType,
                            entities,
                            from,
                            until,
                            attr,
                            order,
                            dataSource
                        );
                        break;
                    case "ucsd-nt":
                        props.getRawRegionalSignalsUcsdNtAction(
                            entityType,
                            entities,
                            from,
                            until,
                            attr,
                            order,
                            dataSource
                        );
                        break;
                    case "merit-nt":
                        props.getRawRegionalSignalsMeritNtAction(
                            entityType,
                            entities,
                            from,
                            until,
                            attr,
                            order,
                            dataSource
                        );
                        break;
                }
                break;
            case "asn":
            case "country":
                entities = asnSignalsTableSummaryDataProcessed
                    .map((entity) => {
                        // some entities don't return a code to be used in an api call, seem to default to '??' in that event
                        if (entity.code !== "??") {
                            return entity.entityCode;
                        }
                    })
                    .toString();
                switch (dataSource) {
                    case "ping-slash24":
                        props.getRawAsnSignalsPingSlash24Action(
                            entityType,
                            entities,
                            from,
                            until,
                            attr,
                            order,
                            dataSource
                        );
                        break;
                    case "bgp":
                        props.getRawAsnSignalsBgpAction(
                            entityType,
                            entities,
                            from,
                            until,
                            attr,
                            order,
                            dataSource
                        );
                        break;
                    case "ucsd-nt":
                        props.getRawAsnSignalsUcsdNtAction(
                            entityType,
                            entities,
                            from,
                            until,
                            attr,
                            order,
                            dataSource
                        );
                        break;
                    case "merit-nt":
                        props.getRawAsnSignalsMeritNtAction(
                            entityType,
                            entities,
                            from,
                            until,
                            attr,
                            order,
                            dataSource
                        );
                        break;
                }
                break;
        }
    }
    // Combine summary outage data with other raw signal data for populating Raw Signal Table
    function _combineValuesForSignalsTable(entityType) {
        switch (entityType) {
            case "region":
                if (summaryDataMapRaw && regionalSignalsTableSummaryDataState) {
                    let signalsTableData = combineValuesForSignalsTable(
                        summaryDataMapRaw,
                        regionalSignalsTableSummaryDataState,
                        initialHtsLimit
                    );
                    setRegionalSignalsTableSummaryDataProcessed(signalsTableData);
                    setRegionalSignalsTableTotalCount(signalsTableData.length);
                }
                break;
            case "asn":
                if (relatedToTableSummaryState && asnSignalsTableSummaryDataState) {
                    let signalsTableData = combineValuesForSignalsTable(
                        relatedToTableSummaryState,
                        asnSignalsTableSummaryDataState,
                        initialHtsLimit
                    );
                    setAsnSignalsTableSummaryDataProcessed(signalsTableData.slice(0, initialTableLimit));
                    setAsnSignalsTableTotalCount(signalsTableData.length);
                }
                break;
        }
    }
    // function that decides what data will populate in the horizon time series
    function convertValuesForHtsViz(dataSource, entityType) {
        let visibilityChecked = [];
        let entitiesChecked = 0;
        let rawSignalsNew = [];
        let signalsTableSummaryDataProcessed, rawSignals;
        switch (entityType) {
            case "region":
                signalsTableSummaryDataProcessed =
                    regionalSignalsTableSummaryDataProcessed;
                switch (dataSource) {
                    case "ping-slash24":
                        rawSignals = rawRegionalSignalsRawPingSlash24;
                        break;
                    case "bgp":
                        rawSignals = rawRegionalSignalsRawBgp;
                        break;
                    case "ucsd-nt":
                        rawSignals = rawRegionalSignalsRawUcsdNt;
                        break;
                    case "merit-nt":
                        rawSignals = rawRegionalSignalsRawMeritNt;
                        break;
                }
                break;
            case "asn":
                signalsTableSummaryDataProcessed =
                    asnSignalsTableSummaryDataProcessed;
                switch (dataSource) {
                    case "ping-slash24":
                        rawSignals = rawAsnSignalsRawPingSlash24;
                        break;
                    case "bgp":
                        rawSignals = rawAsnSignalsRawBgp;
                        break;
                    case "ucsd-nt":
                        rawSignals = rawAsnSignalsRawUcsdNt;
                        break;
                    case "merit-nt":
                        rawSignals = rawAsnSignalsRawMeritNt;
                        break;
                }
                break;
        }

        // Get list of entities that should be visible
        signalsTableSummaryDataProcessed.map((obj) => {
            if (obj.visibility || obj.visibility === true) {
                visibilityChecked.push(obj.entityCode);
                entitiesChecked = entitiesChecked + 1;
            }
        });

        // Set count on current visible items
        switch (entityType) {
            case "region":
                setRegionalSignalsTableEntitiesChecked(entitiesChecked);
                break;
            case "asn":
                setAsnSignalsTableEntitiesChecked(entitiesChecked);
                break;
        }

        // Remove other entities from array that shouldn't be displayed
        visibilityChecked.map((entityCode) => {
            rawSignals.filter((obj) => {
                if (obj.entityCode === entityCode) {
                    rawSignalsNew.push(obj);
                }
            });
        });

        // Set state with new array that dictates what populates
        switch (entityType) {
            case "region":
                switch (dataSource) {
                    case "ping-slash24":
                        setRawRegionalSignalsProcessedPingSlash24(
                            convertTsDataForHtsViz(rawSignalsNew));
                        setAdditionalRawSignalRequestedPingSlash24(false);
                        break;
                    case "bgp":
                        setRawRegionalSignalsProcessedBgp(
                            convertTsDataForHtsViz(rawSignalsNew));
                        setAdditionalRawSignalRequestedBgp(false);
                        break;
                    case "ucsd-nt":
                        setRawRegionalSignalsProcessedUcsdNt(
                            convertTsDataForHtsViz(rawSignalsNew));
                        setAdditionalRawSignalRequestedUcsdNt(false);
                        break;
                    case "merit-nt":
                        setRawRegionalSignalsProcessedMeritNt(
                            convertTsDataForHtsViz(rawSignalsNew));
                        setAdditionalRawSignalRequestedMeritNt(false);
                        break;
                }
                break;
            case "asn":
                switch (dataSource) {
                    case "ping-slash24":
                        setRawAsnSignalsProcessedPingSlash24(
                            convertTsDataForHtsViz(rawSignalsNew));
                        setAdditionalRawSignalRequestedPingSlash24(false);
                        break;
                    case "bgp":
                        setRawAsnSignalsProcessedBgp(convertTsDataForHtsViz(rawSignalsNew));
                        setAdditionalRawSignalRequestedBgp(false);
                        break;
                    case "ucsd-nt":
                        setRawAsnSignalsProcessedUcsdNt(convertTsDataForHtsViz(rawSignalsNew));
                        setAdditionalRawSignalRequestedUcsdNt(false);
                        break;
                    case "merit-nt":
                        setRawAsnSignalsProcessedMeritNt(convertTsDataForHtsViz(rawSignalsNew));
                        setAdditionalRawSignalRequestedMeritNt(false);
                        break;
                }
                break;
        }
    }
    // function to manage what happens when a checkbox is changed in the raw signals table
    function toggleEntityVisibilityInHtsViz(entity, entityType) {
        let maxEntitiesPopulatedMessage = T.translate(
            "entityModal.maxEntitiesPopulatedMessage"
        );
        let signalsTableSummaryDataProcessed, indexValue;
        switch (entityType) {
            case "region":
                signalsTableSummaryDataProcessed =
                    regionalSignalsTableSummaryDataProcessed;
                break;
            case "asn":
                signalsTableSummaryDataProcessed =
                    asnSignalsTableSummaryDataProcessed;
                break;
        }

        // find the entity that was clicked
        signalsTableSummaryDataProcessed.filter((obj, index) => {
            if (obj.entityCode === entity.entityCode) {
                indexValue = index;
            }
        });

        switch (signalsTableSummaryDataProcessed[indexValue]["visibility"]) {
            case true:
                // If checkbox is now set to true, determine if adding it will breach the limit
                if (maxHtsLimit > currentEntitiesChecked) {
                    setCurrentEntitiesChecked((prev) => (prev + 1));

                    // check if entity data is already available
                    switch (signalsTableSummaryDataProcessed[indexValue]["initiallyLoaded"]) {
                        case false:
                            // Update visibility boolean property in copied object to update table
                            signalsTableSummaryDataProcessed[indexValue]["visibility"] = true;
                            // Check if raw signals data is already loaded for particular entity, get it if not
                            if (asnRawSignalsLoadAllButtonClicked &&
                                signalsTableSummaryDataProcessed[indexValue]["initiallyLoaded"] === false
                            ) {
                                // update property that manages if raw signal data has loaded or not
                                signalsTableSummaryDataProcessed[indexValue]["initiallyLoaded"] = true;
                                // call api for additional data on entity
                                let attr = "score";  // TODO
                                let order = "desc";  // TODO
                                let entity =
                                    signalsTableSummaryDataProcessed[indexValue]["entityCode"];
                                let entityType =
                                    signalsTableSummaryDataProcessed[indexValue]["entityType"];
                                if (entityType && entity) {
                                    props.getAdditionalRawSignalAction(
                                        entityType,
                                        entity,
                                        from,
                                        until,
                                        attr,
                                        order,
                                        "ping-slash24"
                                    );
                                    props.getAdditionalRawSignalAction(
                                        entityType,
                                        entity,
                                        from,
                                        until,
                                        attr,
                                        order,
                                        "bgp"
                                    );
                                    props.getAdditionalRawSignalAction(
                                        entityType,
                                        entity,
                                        from,
                                        until,
                                        attr,
                                        order,
                                        "ucsd-nt"
                                    );
                                    props.getAdditionalRawSignalAction(
                                        entityType,
                                        entity,
                                        from,
                                        until,
                                        attr,
                                        order,
                                        "merit-nt"
                                    );
                                    // Update state with freshly updated object list, then redraw the chart with new visibility values
                                    switch (entityType) {
                                        case "region":
                                            setRegionalSignalsTableSummaryDataProcessed(
                                                signalsTableSummaryDataProcessed);
                                            setRawSignalsMaxEntitiesHtsError("");
                                            break;
                                        case "asn":
                                            setAsnSignalsTableSummaryDataProcessed(
                                                signalsTableSummaryDataProcessed);
                                            setRawSignalsMaxEntitiesHtsError("");
                                            break;
                                    }
                                }
                            }
                            break;
                        case true:
                            // set new data
                            switch (entityType) {
                                case "region":
                                    setRegionalSignalsTableSummaryDataProcessed(signalsTableSummaryDataProcessed)
                                    setRawSignalsMaxEntitiesHtsError("");
                                    break;
                                case "asn":
                                    setAsnSignalsTableSummaryDataProcessed(signalsTableSummaryDataProcessed);
                                    setRawSignalsMaxEntitiesHtsError("");
                                    break;
                            }
                            break;
                    }
                } else {
                    // Show error message
                    setRawSignalsMaxEntitiesHtsError(maxEntitiesPopulatedMessage);
                    setAdditionalRawSignalRequestedPingSlash24(false);
                    setAdditionalRawSignalRequestedBgp(false);
                    setAdditionalRawSignalRequestedUcsdNt(false);
                    setAdditionalRawSignalRequestedMeritNt(false);
                }
                break;
            case false:
                // // Update currently checked item count and set new data to populate
                setCurrentEntitiesChecked((prev) => (prev - 1));
                switch (entityType) {
                    case "region":
                        setRegionalSignalsTableSummaryDataProcessed(signalsTableSummaryDataProcessed);
                        setRawSignalsMaxEntitiesHtsError("");
                        setAdditionalRawSignalRequestedPingSlash24(false);
                        setAdditionalRawSignalRequestedBgp(false);
                        setAdditionalRawSignalRequestedUcsdNt(false);
                        setAdditionalRawSignalRequestedMeritNt(false);
                        break;
                    case "asn":
                        setAsnSignalsTableSummaryDataProcessed(signalsTableSummaryDataProcessed);
                        setRawSignalsMaxEntitiesHtsError("");
                        setAdditionalRawSignalRequestedPingSlash24(false);
                        setAdditionalRawSignalRequestedBgp(false);
                        setAdditionalRawSignalRequestedUcsdNt(false);
                        setAdditionalRawSignalRequestedMeritNt(false);
                        break;
                }
                break;
        }
    }
    // function to manage what happens when the select max/uncheck all buttons are clicked
    function handleSelectAndDeselectAllButtons(target) {
        if (target === "checkMaxRegional") {
            setCheckMaxButtonLoading(true);

            let updatedRegionalSignalsTableSummaryDataProcessed =
                regionalSignalsTableSummaryDataProcessed;
            // Count how many entities are currently checked
            let entitiesCurrentlyChecked = 0;
            updatedRegionalSignalsTableSummaryDataProcessed.map((entity) => {
                if (entity.visibility === true) {
                    entitiesCurrentlyChecked = entitiesCurrentlyChecked + 1;
                }
            });
            // Check off additional entities to get to max allowed
            updatedRegionalSignalsTableSummaryDataProcessed.map((entity, index) => {
                entity.visibility = index < maxHtsLimit;
            });

            setRegionalSignalsTableSummaryDataProcessed(updatedRegionalSignalsTableSummaryDataProcessed);
            setRegionalSignalsTableEntitiesChecked(
                updatedRegionalSignalsTableSummaryDataProcessed.length < maxHtsLimit
                    ? updatedRegionalSignalsTableSummaryDataProcessed.length
                    : maxHtsLimit);
            setCurrentEntitiesChecked(maxHtsLimit);
            setCheckMaxButtonLoading(false);
        }
        if (target === "uncheckAllRegional") {
            setUncheckAllButtonLoading(true);

            let updatedRegionalSignalsTableSummaryDataProcessed = regionalSignalsTableSummaryDataProcessed;
            updatedRegionalSignalsTableSummaryDataProcessed.map((entity) => {
                entity.visibility = false;
            });

            setRegionalSignalsTableSummaryDataProcessed(updatedRegionalSignalsTableSummaryDataProcessed);
            setRegionalSignalsTableEntitiesChecked(0);
            setCurrentEntitiesChecked(0);
            setUncheckAllButtonLoading(false);
        }
        if (target === "checkMaxAsn") {
            // Check if all entities are loaded
            // if (this.state.asnRawSignalsLoadAllButtonClicked) {
            setCheckMaxButtonLoading(true);

            setTimeout(() => {
                let updatedAsnSignalsTableSummaryDataProcessed =
                    asnSignalsTableSummaryDataProcessed;
                // Count how many entities are currently checked
                let entitiesCurrentlyChecked = 0;
                updatedAsnSignalsTableSummaryDataProcessed.map((entity) => {
                    if (entity.visibility === true) {
                        entitiesCurrentlyChecked = entitiesCurrentlyChecked + 1;
                    }
                });
                // Check off additional entities to get to max allowed
                updatedAsnSignalsTableSummaryDataProcessed.map((entity, index) => {
                    entity.visibility = index < maxHtsLimit;
                });
                setAsnSignalsTableSummaryDataProcessed(updatedAsnSignalsTableSummaryDataProcessed);
                setAsnSignalsTableEntitiesChecked(updatedAsnSignalsTableSummaryDataProcessed.length < maxHtsLimit
                    ? updatedAsnSignalsTableSummaryDataProcessed.length
                    : maxHtsLimit);
                setCurrentEntitiesChecked(maxHtsLimit);
                setCheckMaxButtonLoading(false);
            }, 500);
        }
        if (target === "uncheckAllAsn") {
            setUncheckAllButtonLoading(true);
            setTimeout(() => {
                let updatedAsnSignalsTableSummaryDataProcessed =
                    asnSignalsTableSummaryDataProcessed;
                updatedAsnSignalsTableSummaryDataProcessed.map((entity) => {
                    entity.visibility = false;
                });
                setAsnSignalsTableSummaryDataProcessed(
                    updatedAsnSignalsTableSummaryDataProcessed);
                setAsnSignalsTableEntitiesChecked(0);
                setCurrentEntitiesChecked(0);
                setUncheckAllButtonLoading(false);
            }, 500);
        }
    }
    // function to manage what happens when the load all entities button is clicked
    function handleLoadAllEntitiesButton(name){
        if (name === "regionLoadAllEntities") {
            setLoadAllButtonEntitiesLoading(true)
            let signalsTableData = combineValuesForSignalsTable(
                summaryDataMapRaw,
                regionalSignalsTableSummaryDataState,
                0
            );
            setRegionalSignalsTableSummaryDataProcessed(
                (prevState) => prevState.concat(
                    signalsTableData.slice(initialTableLimit)
                ));
            setLoadAllButtonEntitiesLoading(false);
            setRegionalRawSignalsLoadAllButtonClicked(true);
        }

        if (name === "asnLoadAllEntities") {
            setAsnRawSignalsLoadAllButtonClicked(true);
            let signalsTableData = combineValuesForSignalsTable(
                relatedToTableSummaryState,
                asnSignalsTableSummaryDataState,
                0
            );
            setAsnSignalsTableSummaryDataProcessed(
                (prevState) => prevState.concat(
                    signalsTableData.slice(initialTableLimit)
                ),
            );
            setLoadAllButtonEntitiesLoading(false);
        }
    }
    function handleAdditionalEntitiesLoading(){
        setLoadAllButtonEntitiesLoading(true);
    }
    // to trigger loading bars on raw signals horizon time series when a checkbox event occurs in the signals table
    function handleCheckboxEventLoading(item){
        let maxEntitiesPopulatedMessage = T.translate(
            "entityModal.maxEntitiesPopulatedMessage"
        );
        // Set checkbox visibility
        let signalsTableSummaryDataProcessed, indexValue;
        switch (item.entityType) {
            case "region":
                signalsTableSummaryDataProcessed =
                    regionalSignalsTableSummaryDataProcessed;
                break;
            case "asn":
                signalsTableSummaryDataProcessed =
                    asnSignalsTableSummaryDataProcessed;
                break;
        }

        signalsTableSummaryDataProcessed.filter((obj, index) => {
            if (obj.entityCode === item.entityCode) {
                indexValue = index;
            }
        });

        // Update visibility boolean property in copied object to match updated table
        if (
            (signalsTableSummaryDataProcessed[indexValue]["visibility"] === false &&
                maxHtsLimit > currentEntitiesChecked) ||
            signalsTableSummaryDataProcessed[indexValue]["visibility"] === true
        ) {
            signalsTableSummaryDataProcessed[indexValue]["visibility"] =
                !signalsTableSummaryDataProcessed[indexValue]["visibility"];

            // set loading bars and updated table data
            switch (item.entityType) {
                case "region":
                    setAdditionalRawSignalRequestedPingSlash24(true);
                    setAdditionalRawSignalRequestedBgp(true);
                    setAdditionalRawSignalRequestedUcsdNt(true);
                    setAdditionalRawSignalRequestedMeritNt(true);
                    setRegionalSignalsTableSummaryDataProcessed(signalsTableSummaryDataProcessed);
                    setTimeout(() => {
                        toggleEntityVisibilityInHtsViz(item, item["entityType"]);
                    }, 500);
                    break;
                case "asn":
                    setAdditionalRawSignalRequestedPingSlash24(true);
                    setAdditionalRawSignalRequestedBgp(true);
                    setAdditionalRawSignalRequestedUcsdNt(true);
                    setAdditionalRawSignalRequestedMeritNt(true);
                    setAsnSignalsTableSummaryDataProcessed(signalsTableSummaryDataProcessed);
                    setTimeout(() => {
                        toggleEntityVisibilityInHtsViz(item, item["entityType"]);
                    }, 500);
                    break;
            }
        } else {
            setRawSignalsMaxEntitiesHtsError(maxEntitiesPopulatedMessage);
        }
    }

    /**
     * Handles users toggling a chart legend series (on the chart itself): when a
     * user clicks in the chart legend, toggle the side checkboxes on the side to
     * match the state
     */
    function handleChartLegendSelectionChange(source) {
        const currentSeriesVisibility = !!tsDataSeriesVisibleMap[source];
        const newSeriesVisibility = !currentSeriesVisibility;
        const newVisibility = {
            ...tsDataSeriesVisibleMap,
            [source]: newSeriesVisibility,
        };
        setTsDataSeriesVisibleMap(newVisibility);
    }

    /**
     * Handles user toggling checkboxes (next to the chart, not on the chart
     * legend itself) for series: dispatch an event to simulate the user changing
     * a selection on the chart legend itself. This will call the
     * handleChartLegendSelectionChange method above to update the checkbox state
     */
    function handleSelectedSignal(source) {
        const currentSeriesVisibility = !!tsDataSeriesVisibleMap[source];
        const newSeriesVisibility = !currentSeriesVisibility;
        const newVisibility = {
            ...tsDataSeriesVisibleMap,
            [source]: newSeriesVisibility,
        };

        setTsDataSeriesVisibleMap(newVisibility);
        setSeriesVisibilityInChartLegend(source, newSeriesVisibility);
    }

    function setSeriesVisibilityInChartLegend(source, visible) {
        if (!timeSeriesChartRef.current) {
            return;
        }

        // Find the chart series object corresponding to the changed signal
        const seriesObject = timeSeriesChartRef.current.chart.series.find(
            (s) => s.userOptions.id === source
        );

        if (!seriesObject) {
            return;
        }

        // Show or hide the series based on the new series visibility
        if (visible) {
            seriesObject.show();
        } else {
            seriesObject.hide();
        }
    }

    function updateSourceParams(src) {
        if (!sourceParams.includes(src)) {
            setSourceParams([...sourceParams, src]);
        }
    }

    function toggleView(){
        let tmpVisibleSeries = prevDataSeriesVisibleMap;
        setSimplifiedView(!simplifiedView);
        setTsDataDisplayOutageBands(!tsDataDisplayOutageBands);
        setPrevDataSeriesVisibleMap(tsDataSeriesVisibleMap);
        setTsDataSeriesVisibleMap(tmpVisibleSeries);
    }

    function handleSelectTab(selectedKey) {
        if (currentTab !== selectedKey) {
            setCurrentTab(selectedKey);
            toggleView();
        }
    }

    const xyChartTitle = T.translate("entity.xyChartTitle");
    const eventFeedTitle = T.translate("entity.eventFeedTitle");
    const alertFeedTitle = T.translate("entity.alertFeedTitle");
    const xyChartAlertToggleLabel = T.translate(
        "entity.xyChartAlertToggleLabel"
    );
    const xyChartNormalizedToggleLabel = T.translate(
        "entity.xyChartNormalizedToggleLabel"
    );

    const tooltipXyPlotTimeSeriesTitle = T.translate(
        "tooltip.xyPlotTimeSeriesTitle.title"
    );
    const tooltipXyPlotTimeSeriesText = T.translate(
        "tooltip.xyPlotTimeSeriesTitle.text"
    );
    const timeDurationTooHighErrorMessage = T.translate(
        "dashboard.timeDurationTooHighErrorMessage"
    );

    return (
        <div className="w-full max-cont entity">
            <Helmet>
                <title>IODA | Internet Outages for {entityName}</title>
                <meta
                    name="description"
                    content={`Visualizations and Alerts for ${entityName} Internet Outages Detected by IODA`}
                />
            </Helmet>
            <ControlPanel
                from={from}
                until={until}
                searchbar={populateSearchBar}
                onTimeFrameChange={handleTimeFrame}
                onClose={handleControlPanelClose}
                title={entityName}
                entityCode={entityCodeState}
                entityType="asn"
                onSelect={(entity) => handleResultClick(entity)}
                searchParams={searchParams}
            />
            {displayTimeRangeError ? (
                <Error />
            ) : until - from < controlPanelTimeRangeLimit ? (
                <React.Fragment>
                    {/* Share Link Modal */}
                    <ShareLinkModal
                        open={showShareLinkModal}
                        link={window.location.href}
                        hideModal={hideShareLinkModal}
                        showModal={displayShareLinkModal}
                        entityName={entityName}
                        handleDownload={() => manuallyDownloadChart("image/jpeg")}
                    />
                    <MarkupStudioModal
                        open={showMarkupStudioModal}
                        svgString={markupStudioSvgBaseString}
                        hideModal={handleHideMarkupStudioModal}
                        chartTitle={getChartExportTitle()}
                        chartSubtitle={getChartExportSubtitle()}
                        exportFileName={() => getChartExportFileName(fromDate,  entityName)}
                        shareLink={window.location.href}
                        entityName={entityName}
                    />
                    <div className="flex items-stretch gap-6 mb-6 entity__chart-layout">
                        <div className="col-2 p-4 card entity__chart">
                            <div className="flex items-center mb-3">
                                <h3 className="text-2xl mr-1">
                                    {xyChartTitle}
                                    {entityName}
                                </h3>
                                <CustomToolip
                                    className="mr-auto"
                                    title={tooltipXyPlotTimeSeriesTitle}
                                    text={tooltipXyPlotTimeSeriesText}
                                />

                                {showResetZoomButton && (
                                    <Tooltip title="Reset View">
                                        <Button
                                            className="mr-3"
                                            icon={<MagnifyExpandIcon />}
                                            onClick={setDefaultNavigatorTimeRange}
                                        />
                                    </Tooltip>
                                )}

                                {!simplifiedView && (
                                    <Popover
                                        open={displayChartSettingsPopover}
                                        onOpenChange={handleDisplayChartSettingsPopover}
                                        trigger="click"
                                        placement="bottomRight"
                                        overlayStyle={{
                                            width: 180,
                                        }}
                                        content={
                                            <div
                                                onClick={() =>
                                                    handleDisplayChartSettingsPopover(false)
                                                }
                                            >
                                                <>
                                                    <Checkbox
                                                        checked={!!tsDataDisplayOutageBands}
                                                        onChange={(e) =>
                                                            handleDisplayAlertBands(e.target.checked)
                                                        }
                                                    >
                                                        {xyChartAlertToggleLabel}
                                                    </Checkbox>
                                                    <Checkbox
                                                        checked={!!tsDataNormalized}
                                                        onChange={changeXyChartNormalization}
                                                    >
                                                        {xyChartNormalizedToggleLabel}
                                                    </Checkbox>
                                                </>
                                            </div>
                                        }
                                    >
                                        <Tooltip title="Chart Settings">
                                            <Button className="mr-3" icon={<SettingOutlined />} />
                                        </Tooltip>
                                    </Popover>
                                )}

                                <Tooltip title="Markup">
                                    <Button
                                        className="mr-3"
                                        icon={<EditOutlined />}
                                        onClick={handleShowMarkupStudioModal}
                                        disabled={xyChartOptions == null}
                                    />
                                </Tooltip>

                                <Tooltip title="Share Link">
                                    <Button
                                        className="mr-3"
                                        icon={<ShareAltOutlined />}
                                        onClick={displayShareLinkModal}
                                    />
                                </Tooltip>

                                <Popover
                                    open={displayChartSharePopover}
                                    onOpenChange={handleDisplayChartSharePopover}
                                    trigger="click"
                                    placement="bottomRight"
                                    overlayStyle={{
                                        maxWidth: 180,
                                    }}
                                    content={
                                        <div
                                            onClick={() =>
                                                handleDisplayChartSharePopover(false)
                                            }
                                        >
                                            <Button
                                                className="w-full mb-2"
                                                size="small"
                                                onClick={() => handleCSVDownload(timeSeriesChartRef)}
                                                disabled={xyChartOptions == null}
                                            >
                                                Data CSV
                                            </Button>
                                            <Button
                                                className="w-full mb-2"
                                                size="small"
                                                onClick={() =>
                                                    manuallyDownloadChart("image/jpeg")
                                                }
                                                disabled={xyChartOptions == null}
                                            >
                                                Chart JPEG
                                            </Button>
                                            <Button
                                                className="w-full mb-2"
                                                size="small"
                                                onClick={() =>
                                                    manuallyDownloadChart("image/png")
                                                }
                                                disabled={xyChartOptions == null}
                                            >
                                                Chart PNG
                                            </Button>
                                            <Button
                                                className="w-full"
                                                size="small"
                                                onClick={() =>
                                                    manuallyDownloadChart("image/svg+xml")
                                                }
                                                disabled={xyChartOptions == null}
                                            >
                                                Chart SVG
                                            </Button>
                                        </div>
                                    }
                                >
                                    <Tooltip
                                        title="Download"
                                        mouseEnterDelay={0}
                                        mouseLeaveDelay={0}
                                    >
                                        <Button icon={<DownloadOutlined />} />
                                    </Tooltip>
                                </Popover>
                            </div>
                            {xyChartOptions ? renderXyChart() : <Loading />}
                            <TimeStamp
                                className="mt-4"
                                from={tsDataLegendRangeFrom}
                                until={tsDataLegendRangeUntil}
                            />
                        </div>
                        <div className="col-1 p-4 card">
                            <ChartTabCard
                                type={type}
                                eventData={eventDataRaw}
                                alertsData={alertDataRaw}
                                legendHandler={handleSelectedSignal}
                                tsDataSeriesVisibleMap={tsDataSeriesVisibleMap}
                                updateSourceParams={updateSourceParams}
                                simplifiedView={simplifiedView}
                            />
                        </div>
                    </div>
                    <EntityRelated
                        entityName={entityName}
                        entityType={entityTypeState}
                        parentEntityName={parentEntityName}
                        toggleModal={toggleModal}
                        showMapModal={showMapModal}
                        showTableModal={showTableModal}
                        // to populate map
                        topoData={topoData}
                        topoScores={topoScores}
                        bounds={bounds}
                        handleEntityShapeClick={(entity) =>
                            handleEntityShapeClick(entity)
                        }
                        // to populate asn summary table
                        relatedToTableSummaryProcessed={
                            relatedToTableSummaryProcessed
                        }
                        relatedToTableSummary={relatedToTableSummaryState}
                        // handleEntityClick={(entity) => this.handleEntityClick(entity)}
                        // raw signals tables for region modal
                        handleSelectAndDeselectAllButtons={(event) =>
                            handleSelectAndDeselectAllButtons(event)
                        }
                        regionalSignalsTableSummaryDataProcessed={
                            regionalSignalsTableSummaryDataProcessed
                        }
                        toggleEntityVisibilityInHtsViz={(event) =>
                            toggleEntityVisibilityInHtsViz(event, "region")
                        }
                        handleCheckboxEventLoading={(item) =>
                            handleCheckboxEventLoading(item)
                        }
                        asnSignalsTableSummaryDataProcessed={
                            asnSignalsTableSummaryDataProcessed
                        }
                        // Regional HTS methods
                        regionalSignalsTableEntitiesChecked={
                            regionalSignalsTableEntitiesChecked
                        }
                        asnSignalsTableEntitiesChecked={
                            asnSignalsTableEntitiesChecked
                        }
                        initialTableLimit={initialTableLimit}
                        rawRegionalSignalsProcessedPingSlash24={
                            rawRegionalSignalsProcessedPingSlash24
                        }
                        rawRegionalSignalsProcessedBgp={
                            rawRegionalSignalsProcessedBgp
                        }
                        rawRegionalSignalsProcessedUcsdNt={
                            rawRegionalSignalsProcessedUcsdNt
                        }
                        rawRegionalSignalsProcessedMeritNt={
                            rawRegionalSignalsProcessedMeritNt
                        }
                        rawAsnSignalsProcessedPingSlash24={
                            rawAsnSignalsProcessedPingSlash24
                        }
                        rawAsnSignalsProcessedBgp={rawAsnSignalsProcessedBgp}
                        rawAsnSignalsProcessedUcsdNt={
                            rawAsnSignalsProcessedUcsdNt
                        }
                        rawAsnSignalsProcessedMeritNt={
                            rawAsnSignalsProcessedMeritNt
                        }
                        summaryDataMapRaw={summaryDataMapRaw}
                        rawSignalsMaxEntitiesHtsError={
                            rawSignalsMaxEntitiesHtsError
                        }
                        // count used to determine if text to populate remaining entities beyond the initial Table load limit should display
                        asnSignalsTableTotalCount={asnSignalsTableTotalCount}
                        regionalSignalsTableTotalCount={
                            regionalSignalsTableTotalCount
                        }
                        // function used to call api to load remaining entities
                        handleLoadAllEntitiesButton={(event) =>
                            handleLoadAllEntitiesButton(event)
                        }
                        // Used to determine if load all message should display or not
                        regionalRawSignalsLoadAllButtonClicked={
                            regionalRawSignalsLoadAllButtonClicked
                        }
                        asnRawSignalsLoadAllButtonClicked={
                            asnRawSignalsLoadAllButtonClicked
                        }
                        // modal loading icon for load all button
                        loadAllButtonEntitiesLoading={
                            loadAllButtonEntitiesLoading
                        }
                        handleAdditionalEntitiesLoading={() =>
                            handleAdditionalEntitiesLoading()
                        }
                        additionalRawSignalRequestedPingSlash24={
                            additionalRawSignalRequestedPingSlash24
                        }
                        additionalRawSignalRequestedBgp={
                            additionalRawSignalRequestedBgp
                        }
                        additionalRawSignalRequestedUcsdNt={
                            additionalRawSignalRequestedUcsdNt
                        }
                        additionalRawSignalRequestedMeritNt={
                            additionalRawSignalRequestedMeritNt
                        }
                        // used for tracking when check max/uncheck all loading icon should appear and not
                        checkMaxButtonLoading={checkMaxButtonLoading}
                        uncheckAllButtonLoading={uncheckAllButtonLoading}
                        // used to check if there are no entities available to load (to control when loading bar disappears)
                        rawRegionalSignalsRawBgpLength={
                            rawRegionalSignalsRawBgp.length
                        }
                        rawRegionalSignalsRawPingSlash24Length={
                            rawRegionalSignalsRawPingSlash24.length
                        }
                        rawRegionalSignalsRawUcsdNtLength={
                            rawRegionalSignalsRawUcsdNt.length
                        }
                        rawRegionalSignalsRawMeritNtLength={
                            rawRegionalSignalsRawMeritNt.length
                        }
                        rawAsnSignalsRawBgpLength={rawAsnSignalsRawBgp.length}
                        rawAsnSignalsRawPingSlash24Length={
                            rawAsnSignalsRawPingSlash24.length
                        }
                        rawAsnSignalsRawUcsdNtLength={
                            rawAsnSignalsRawUcsdNt.length
                        }
                        rawAsnSignalsRawMeritNtLength={
                            rawAsnSignalsRawMeritNt.length
                        }
                    />
                </React.Fragment>
            ) : (
                <div className="p-6 text-lg card">
                    {timeDurationTooHighErrorMessage}
                    {getSecondsAsErrorDurationString(
                        until - from
                    )}
                    .
                </div>
            )}
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        datasources: state.iodaApi.datasources,
        relatedEntities: state.iodaApi.relatedEntities,
        relatedToMapSummary: state.iodaApi.relatedToMapSummary,
        relatedToTableSummary: state.iodaApi.relatedToTableSummary,
        topoData: state.iodaApi.topo,
        totalOutages: state.iodaApi.summaryTotalCount,
        events: state.iodaApi.events,
        alerts: state.iodaApi.alerts,
        signals: state.iodaApi.signals,
        mapModalSummary: state.iodaApi.mapModalSummary,
        mapModalTopoData: state.iodaApi.mapModalTopoData,
        regionalSignalsTableSummaryData:
        state.iodaApi.regionalSignalsTableSummaryData,
        asnSignalsTableSummaryData: state.iodaApi.asnSignalsTableSummaryData,
        rawRegionalSignalsPingSlash24: state.iodaApi.rawRegionalSignalsPingSlash24,
        rawRegionalSignalsBgp: state.iodaApi.rawRegionalSignalsBgp,
        rawRegionalSignalsUcsdNt: state.iodaApi.rawRegionalSignalsUcsdNt,
        rawRegionalSignalsMeritNt: state.iodaApi.rawRegionalSignalsMeritNt,
        rawAsnSignalsPingSlash24: state.iodaApi.rawRegionalSignalsPingSlash24,
        rawAsnSignalsBgp: state.iodaApi.rawRegionalSignalsBgp,
        rawAsnSignalsUcsdNt: state.iodaApi.rawRegionalSignalsUcsdNt,
        rawAsnSignalsMeritNt: state.iodaApi.rawRegionalSignalsMeritNt,
        additionalRawSignal: state.iodaApi.additionalRawSignal,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getDatasourcesAction: () => {
            getDatasourcesAction(dispatch);
        },
        searchEventsAction: (
            from,
            until,
            entityType,
            entityCode,
            datasource = null,
            includeAlerts = null,
            format = null,
            limit = null,
            page = null
        ) => {
            searchEvents(
                dispatch,
                from,
                until,
                entityType,
                entityCode,
                datasource,
                includeAlerts,
                format,
                limit,
                page
            );
        },
        searchAlertsAction: (
            from,
            until,
            entityType,
            entityCode,
            datasource = null,
            limit = null,
            page = null
        ) => {
            searchAlerts(
                dispatch,
                from,
                until,
                entityType,
                entityCode,
                datasource,
                limit,
                page
            );
        },
        getSignalsAction: (
            entityType,
            entityCode,
            from,
            until,
            datasource = null,
            maxPoints,
            sourceParams = null
        ) => {
            getSignalsAction(
                dispatch,
                entityType,
                entityCode,
                from,
                until,
                datasource,
                maxPoints,
                sourceParams
            );
        },

        searchRelatedToMapSummary: (
            from,
            until,
            entityType,
            relatedToEntityType,
            relatedToEntityCode,
            entityCode,
            limit,
            page,
            includeMetaData
        ) => {
            searchRelatedToMapSummary(
                dispatch,
                from,
                until,
                entityType,
                relatedToEntityType,
                relatedToEntityCode,
                entityCode,
                limit,
                page,
                includeMetaData
            );
        },
        searchRelatedToTableSummary: (
            from,
            until,
            entityType,
            relatedToEntityType,
            relatedToEntityCode,
            entityCode,
            limit,
            page,
            includeMetaData
        ) => {
            searchRelatedToTableSummary(
                dispatch,
                from,
                until,
                entityType,
                relatedToEntityType,
                relatedToEntityCode,
                entityCode,
                limit,
                page,
                includeMetaData
            );
        },
        totalOutagesAction: (from, until, entityType) => {
            totalOutages(dispatch, from, until, entityType);
        },
        regionalSignalsTableSummaryDataAction: (
            entityType,
            relatedToEntityType,
            relatedToEntityCode
        ) => {
            regionalSignalsTableSummaryDataAction(
                dispatch,
                entityType,
                relatedToEntityType,
                relatedToEntityCode
            );
        },
        asnSignalsTableSummaryDataAction: (
            entityType,
            relatedToEntityType,
            relatedToEntityCode
        ) => {
            asnSignalsTableSummaryDataAction(
                dispatch,
                entityType,
                relatedToEntityType,
                relatedToEntityCode
            );
        },
        getRawRegionalSignalsPingSlash24Action: (
            entityType,
            entities,
            from,
            until,
            attr = null,
            order = null,
            dataSource,
            maxPoints = null
        ) => {
            getRawRegionalSignalsPingSlash24Action(
                dispatch,
                entityType,
                entities,
                from,
                until,
                attr,
                order,
                dataSource,
                maxPoints
            );
        },
        getRawRegionalSignalsBgpAction: (
            entityType,
            entities,
            from,
            until,
            attr = null,
            order = null,
            dataSource,
            maxPoints = null
        ) => {
            getRawRegionalSignalsBgpAction(
                dispatch,
                entityType,
                entities,
                from,
                until,
                attr,
                order,
                dataSource,
                maxPoints
            );
        },
        getRawRegionalSignalsUcsdNtAction: (
            entityType,
            entities,
            from,
            until,
            attr = null,
            order = null,
            dataSource,
            maxPoints = null
        ) => {
            getRawRegionalSignalsUcsdNtAction(
                dispatch,
                entityType,
                entities,
                from,
                until,
                attr,
                order,
                dataSource,
                maxPoints
            );
        },
        getRawRegionalSignalsMeritNtAction: (
            entityType,
            entities,
            from,
            until,
            attr = null,
            order = null,
            dataSource,
            maxPoints = null
        ) => {
            getRawRegionalSignalsMeritNtAction(
                dispatch,
                entityType,
                entities,
                from,
                until,
                attr,
                order,
                dataSource,
                maxPoints
            );
        },
        getRawAsnSignalsPingSlash24Action: (
            entityType,
            entities,
            from,
            until,
            attr = null,
            order = null,
            dataSource,
            maxPoints = null
        ) => {
            getRawAsnSignalsPingSlash24Action(
                dispatch,
                entityType,
                entities,
                from,
                until,
                attr,
                order,
                dataSource,
                maxPoints
            );
        },
        getRawAsnSignalsBgpAction: (
            entityType,
            entities,
            from,
            until,
            attr = null,
            order = null,
            dataSource,
            maxPoints = null
        ) => {
            getRawAsnSignalsBgpAction(
                dispatch,
                entityType,
                entities,
                from,
                until,
                attr,
                order,
                dataSource,
                maxPoints
            );
        },
        getRawAsnSignalsUcsdNtAction: (
            entityType,
            entities,
            from,
            until,
            attr = null,
            order = null,
            dataSource,
            maxPoints = null
        ) => {
            getRawAsnSignalsUcsdNtAction(
                dispatch,
                entityType,
                entities,
                from,
                until,
                attr,
                order,
                dataSource,
                maxPoints
            );
        },
        getRawAsnSignalsMeritNtAction: (
            entityType,
            entities,
            from,
            until,
            attr = null,
            order = null,
            dataSource,
            maxPoints = null
        ) => {
            getRawAsnSignalsMeritNtAction(
                dispatch,
                entityType,
                entities,
                from,
                until,
                attr,
                order,
                dataSource,
                maxPoints
            );
        },
        getAdditionalRawSignalAction: (
            entityType,
            entity,
            from,
            until,
            attr = null,
            order = null,
            dataSource,
            maxPoints = null
        ) => {
            getAdditionalRawSignalAction(
                dispatch,
                entityType,
                entity,
                from,
                until,
                attr,
                order,
                dataSource,
                maxPoints
            );
        },
    };
};

const EntityFn = (props) => {
    const navigate = useNavigate();
    // using useRef to avoid re-rendering between renders
    const previousFullPath = useRef(window.location.href);
    const { entityCode, entityType, regionCode, asnCode } = useParams();
    const [searchParams] = useSearchParams();
    // Reload page if the URL changes.
    useEffect(() => {
        if (previousFullPath.current !== window.location.href) {
            previousFullPath.current = window.location.href;

            window.location.reload();
        }
    }, [window.location.href]);

    return (
        <Entity
            {...props}
            navigate={navigate}
            entityType={entityType}
            entityCode={entityCode}
            regionCode={regionCode}
            asnCode={asnCode}
            searchParams={searchParams}
        />
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(EntityFn);
