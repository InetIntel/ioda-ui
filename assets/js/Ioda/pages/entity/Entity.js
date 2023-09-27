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
import React, { Component } from "react";
import { connect } from "react-redux";
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

import Tooltip from "../../components/tooltip/Tooltip";

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
import AnnotationStudioModal from "./components/AnnotationStudioModal";

// Chart libraries
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
require("highcharts/modules/exporting")(Highcharts);
require("highcharts/modules/export-data")(Highcharts);
require("highcharts/modules/offline-exporting")(Highcharts);

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
import { withRouter } from "react-router-dom";
import { Button, Checkbox, Popover } from "antd";
import {
  DownloadOutlined,
  EditOutlined,
  SettingOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";

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

class Entity extends Component {
  constructor(props) {
    super(props);

    this.timeSeriesChartRef = React.createRef();

    const entityType = this.props?.match?.params?.entityType;
    const entityCode = this.props?.match?.params?.entityCode;

    const isAdvancedMode = getSavedAdvancedModePreference();

    this.state = {
      // Global
      mounted: false,
      entityType: entityType,
      entityCode: entityCode,
      entityName: "",
      parentEntityName: "",
      parentEntityCode: "",
      displayTimeRangeError: false,
      entityMetadata: {},
      // Data Sources Available
      dataSources: null,
      // Control Panel
      from: fromDate,
      until: untilDate,
      // Search Bar
      sourceParams: ["WEB_SEARCH"],
      // XY Plot Time Series
      xyDataOptions: null,
      xyChartOptions: null,
      tsDataRaw: null,
      tsDataNormalized: true,
      tsDataDisplayOutageBands: isAdvancedMode,
      tsDataLegendRangeFrom: fromDate,
      tsDataLegendRangeUntil: untilDate,
      // Used for responsively styling the xy chart
      tsDataScreenBelow970: window.innerWidth <= 970,
      tsDataScreenBelow678: window.innerWidth <= 678,
      // display export modal
      showXyChartModal: false,
      // display link sharing modal
      showShareLinkModal: false,
      // display annotation studio modal
      showAnnotationStudioModal: false,
      annotationStudioSvgBaseString: "",
      // Used to track which series have visibility, needed for when switching between normalized/absolute values to maintain state
      tsDataSeriesVisibleMap: dataSource.reduce((result, item) => {
        result[item] = true;
        return result;
      }, {}), //new Map(dataSource.map(k => {return [k,true]})),
      prevDataSeriesVisibleMap: dataSource.reduce((result, item) => {
        result[item] = true;
        return result;
      }, {}),
      // Event/Table Data
      currentTable: "alert",
      eventDataRaw: null,
      alertDataRaw: null,
      // relatedTo entity Map
      topoData: null,
      topoScores: null,
      bounds: null,
      relatedToMapSummary: null,
      summaryDataMapRaw: null,
      // relatedTo entity Table
      relatedToTableApiPageNumber: 0,
      relatedToTableSummary: null,
      relatedToTableSummaryProcessed: null,
      relatedToTablePageNumber: 0,
      // RawSignalsModal window display status
      showMapModal: false,
      showTableModal: false,
      // Signals RawSignalsModal Table on Map Panel
      regionalSignalsTableSummaryData: [],
      regionalSignalsTableSummaryDataProcessed: [],
      regionalSignalsTableTotalCount: 0,
      regionalSignalsTableEntitiesChecked: 0,
      // Signals RawSignalsModal Table on Table Panel
      asnSignalsTableSummaryData: [],
      asnSignalsTableSummaryDataProcessed: [],
      asnSignalsTableTotalCount: 0,
      asnSignalsTableEntitiesChecked: 0,
      // Stacked Horizon Visual on Region Map Panel
      rawRegionalSignalsRawBgp: [],
      rawRegionalSignalsRawPingSlash24: [],
      rawRegionalSignalsRawUcsdNt: [],
      rawRegionalSignalsRawMeritNt: [],
      rawRegionalSignalsProcessedBgp: null,
      rawRegionalSignalsProcessedPingSlash24: null,
      rawRegionalSignalsProcessedUcsdNt: null,
      rawRegionalSignalsProcessedMeritNt: null,
      // tracking when to dump states if a new entity is chosen
      rawRegionalSignalsLoaded: false,
      // Stacked Horizon Visual on ASN Table Panel
      rawAsnSignalsRawBgp: [],
      rawAsnSignalsRawPingSlash24: [],
      rawAsnSignalsRawUcsdNt: [],
      rawAsnSignalsRawMeritNt: [],
      rawAsnSignalsProcessedBgp: null,
      rawAsnSignalsProcessedPingSlash24: null,
      rawAsnSignalsProcessedUcsdNt: null,
      rawAsnSignalsProcessedMeritNt: null,
      rawAsnSignalsLoaded: false,
      // Shared between Modals
      rawSignalsMaxEntitiesHtsError: "",
      regionalRawSignalsLoadAllButtonClicked: false,
      asnRawSignalsLoadAllButtonClicked: false,
      loadAllButtonEntitiesLoading: false,
      checkMaxButtonLoading: false,
      uncheckAllButtonLoading: false,
      // manage loading bar for when loadAll button is clicked and
      // additional raw signals are requested beyond what was initially loaded
      additionalRawSignalRequestedPingSlash24: false,
      additionalRawSignalRequestedBgp: false,
      additionalRawSignalRequestedUcsdNt: false,
      additionalRawSignalRequestedMeritNt: false,
      currentTab: 1,
      simplifiedView: !isAdvancedMode,
      currentEntitiesChecked: 100,

      // Popovers
      displayChartSettingsPopover: false,
      displayChartSharePopover: false,
    };

    this.initialTableLimit = 300;
    this.initialHtsLimit = 100;
    this.maxHtsLimit = 150;

    this.props.history.listen((location, action) => {
      window.location.reload();
    });
  }

  updateEntityMetaData = (entityName, entityCode) => {
    getEntityMetadata(entityName, entityCode).then((data) => {
      this.setState(
        {
          entityMetadata: data,
          entityName: data[0]["name"],
          parentEntityName: data[0]["attrs"]["country_name"]
            ? data[0]["attrs"]["country_name"]
            : this.state.parentEntityName,
          parentEntityCode: data[0]["attrs"]["country_code"]
            ? data[0]["attrs"]["country_code"]
            : this.state.parentEntityCode,
        },
        () => {
          // Get Topo Data for relatedTo Map
          // ToDo: update parameter to base value off of url entity type
          this.getDataTopo("region");
          this.getDataRelatedToMapSummary("region");
          this.getDataRelatedToTableSummary("asn");
        }
      );
    });
  };

  componentDidMount() {
    // Monitor screen width
    window.addEventListener("resize", this.resize.bind(this));

    // If fromDate is after untilDate, show error and terminate
    if (untilDate - fromDate <= 0) {
      this.setState({ displayTimeRangeError: true });
      return;
    }

    this.setState(
      {
        mounted: true,
        from: fromDate,
        until: untilDate,
        tsDataLegendRangeFrom: fromDate,
        tsDataLegendRangeUntil: untilDate,
      },
      () => {
        // If the difference is larger than the limit, terminate
        if (untilDate - fromDate >= controlPanelTimeRangeLimit) {
          return;
        }

        const { timeSignalFrom, timeSignalUntil } = getSignalTimeRange(
          fromDate,
          untilDate
        );

        const { entityType, entityCode } = this.state;

        // Overview Panel
        // Pull events from the same range as time series signal to show all
        // alerts in the navigator range
        this.props.searchEventsAction(
          timeSignalFrom,
          timeSignalUntil,
          entityType,
          entityCode
        );
        this.props.searchAlertsAction(
          fromDate,
          untilDate,
          entityType,
          entityCode,
          null,
          null,
          null
        );
        this.props.getSignalsAction(
          entityType,
          entityCode,
          timeSignalFrom,
          timeSignalUntil,
          null,
          3000,
          this.state.sourceParams
        );

        // Get entity name from code provided in url
        this.updateEntityMetaData(entityType, entityCode);
      }
    );
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resize.bind(this));
    this.setState({ mounted: false });
  }

  componentDidUpdate(prevProps, prevState) {
    // After API call for available data sources completes, update dataSources state with fresh data
    if (this.props.datasources !== prevProps.datasources) {
      this.setState({
        dataSources: this.props.datasources,
      });
    }

    const { timeSignalFrom, timeSignalUntil } = getSignalTimeRange(
      this.state.from,
      this.state.until
    );

    const { entityType, entityCode } = this.state;

    if (this.state.sourceParams !== prevState.sourceParams) {
      this.props.getSignalsAction(
        entityType,
        entityCode,
        timeSignalFrom,
        timeSignalUntil,
        null,
        3000,
        this.state.sourceParams
      );
    }

    // Make API call for data to populate XY Chart
    if (this.props.signals !== prevProps.signals) {
      // Map props to state and initiate data processing
      this.setState({ tsDataRaw: this.props.signals }, () => {
        // For XY Plotted Graph
        this.convertValuesForXyViz();
      });
    }

    // Make API call for data to populate event table
    if (this.props.events !== prevProps.events) {
      this.setState({ eventDataRaw: this.props.events });
    }

    // After API call for Alert Table data completes, check for lengths to set display counts and then process to populate
    if (this.props.alerts !== prevProps.alerts) {
      this.setState({ alertDataRaw: this.props.alerts });
    }

    // After API call for outage summary data completes, pass summary data to map function for data merging
    if (this.props.relatedToMapSummary !== prevProps.relatedToMapSummary) {
      this.setState(
        { summaryDataMapRaw: this.props.relatedToMapSummary },
        this.getMapScores
      );
    }

    // After API call for outage summary data completes, pass summary data to table component for data merging
    if (this.props.relatedToTableSummary !== prevProps.relatedToTableSummary) {
      this.setState(
        {
          relatedToTableSummary: this.props.relatedToTableSummary,
        },
        () => {
          this.convertValuesForSummaryTable();
        }
      );
    }

    if (
      this.props.regionalSignalsTableSummaryData !==
      prevProps.regionalSignalsTableSummaryData
    ) {
      this.setState(
        {
          regionalSignalsTableSummaryData:
            this.props.regionalSignalsTableSummaryData,
        },
        () => {
          this.combineValuesForSignalsTable("region");
        }
      );
    }

    if (
      this.props.asnSignalsTableSummaryData !==
      prevProps.asnSignalsTableSummaryData
    ) {
      this.setState(
        {
          asnSignalsTableSummaryData: this.props.asnSignalsTableSummaryData,
        },
        () => {
          this.combineValuesForSignalsTable("asn");
        }
      );
    }

    // data for regional signals table Ping-Slash24 Source
    if (
      this.props.rawRegionalSignalsPingSlash24 !==
        prevProps.rawRegionalSignalsPingSlash24 &&
      this.props.rawRegionalSignalsPingSlash24 &&
      this.state.showMapModal
    ) {
      let rawRegionalSignals = [];
      this.props.rawRegionalSignalsPingSlash24.map((signal) => {
        //Remove empty items and assign to proper state. Then call next function
        signal.length ? rawRegionalSignals.push(signal[0]) : null;
      });
      this.setState(
        {
          rawRegionalSignalsRawPingSlash24: rawRegionalSignals,
        },
        () => {
          this.convertValuesForHtsViz("ping-slash24", "region");
        }
      );
    }

    // data for regional signals table BGP Source
    if (
      this.props.rawRegionalSignalsBgp !== prevProps.rawRegionalSignalsBgp &&
      this.props.rawRegionalSignalsBgp &&
      this.state.showMapModal
    ) {
      // assign to respective state
      let rawRegionalSignals = [];
      this.props.rawRegionalSignalsBgp.map((signal) => {
        //Remove empty items and assign to proper state. Then call next function
        signal.length ? rawRegionalSignals.push(signal[0]) : null;
      });
      this.setState(
        {
          rawRegionalSignalsRawBgp: rawRegionalSignals,
        },
        () => {
          this.convertValuesForHtsViz("bgp", "region");
        }
      );
    }

    // data for regional signals table UCSD-NT Source
    if (
      this.props.rawRegionalSignalsUcsdNt !==
        prevProps.rawRegionalSignalsUcsdNt &&
      this.props.rawRegionalSignalsUcsdNt &&
      this.state.showMapModal
    ) {
      // assign to respective state
      let rawRegionalSignals = [];
      this.props.rawRegionalSignalsUcsdNt.map((signal) => {
        //Remove empty items and assign to proper state. Then call next function
        signal.length ? rawRegionalSignals.push(signal[0]) : null;
      });
      this.setState(
        {
          rawRegionalSignalsRawUcsdNt: rawRegionalSignals,
        },
        () => {
          this.convertValuesForHtsViz("ucsd-nt", "region");
        }
      );
    }

    // data for regional signals table Merit-NT Source
    if (
      this.props.rawRegionalSignalsMeritNt !==
        prevProps.rawRegionalSignalsMeritNt &&
      this.props.rawRegionalSignalsMeritNt &&
      this.state.showMapModal
    ) {
      // assign to respective state
      let rawRegionalSignals = [];
      this.props.rawRegionalSignalsMeritNt.map((signal) => {
        //Remove empty items and assign to proper state. Then call next function
        signal.length ? rawRegionalSignals.push(signal[0]) : null;
      });
      this.setState(
        {
          rawRegionalSignalsRawMeritNt: rawRegionalSignals,
        },
        () => {
          this.convertValuesForHtsViz("merit-nt", "region");
        }
      );
    }

    // data for asn signals table Ping-Slash24 Source
    if (
      this.props.rawAsnSignalsPingSlash24 !==
        prevProps.rawAsnSignalsPingSlash24 &&
      this.props.rawAsnSignalsPingSlash24 &&
      this.state.showTableModal
    ) {
      let rawAsnSignals = [];
      this.props.rawAsnSignalsPingSlash24.map((signal) => {
        //Remove empty items and assign to proper state. Then call next function
        signal.length ? rawAsnSignals.push(signal[0]) : null;
      });
      this.setState(
        {
          rawAsnSignalsRawPingSlash24: rawAsnSignals,
        },
        () => {
          this.convertValuesForHtsViz("ping-slash24", "asn");
        }
      );
    }

    // data for asn signals table BGP Source
    if (
      this.props.rawAsnSignalsBgp !== prevProps.rawAsnSignalsBgp &&
      this.props.rawAsnSignalsBgp &&
      this.state.showTableModal
    ) {
      // assign to respective state
      let rawAsnSignals = [];
      this.props.rawAsnSignalsBgp.map((signal) => {
        //Remove empty items and assign to proper state. Then call next function
        signal.length ? rawAsnSignals.push(signal[0]) : null;
      });
      this.setState(
        {
          rawAsnSignalsRawBgp: rawAsnSignals,
        },
        () => {
          this.convertValuesForHtsViz("bgp", "asn");
        }
      );
    }

    // data for asn signals table UCSD-NT Source
    if (
      this.props.rawAsnSignalsUcsdNt !== prevProps.rawAsnSignalsUcsdNt &&
      this.props.rawAsnSignalsUcsdNt &&
      this.state.showTableModal
    ) {
      // assign to respective state
      let rawAsnSignals = [];
      this.props.rawAsnSignalsUcsdNt.map((signal) => {
        //Remove empty items and assign to proper state. Then call next function
        signal.length ? rawAsnSignals.push(signal[0]) : null;
      });
      this.setState(
        {
          rawAsnSignalsRawUcsdNt: rawAsnSignals,
        },
        () => {
          this.convertValuesForHtsViz("ucsd-nt", "asn");
        }
      );
    }

    // data for asn signals table Merit-NT Source
    if (
      this.props.rawAsnSignalsMeritNt !== prevProps.rawAsnSignalsMeritNt &&
      this.props.rawAsnSignalsMeritNt &&
      this.state.showTableModal
    ) {
      // assign to respective state
      let rawAsnSignals = [];
      this.props.rawAsnSignalsMeritNt.map((signal) => {
        //Remove empty items and assign to proper state. Then call next function
        signal.length ? rawAsnSignals.push(signal[0]) : null;
      });
      this.setState(
        {
          rawAsnSignalsRawMeritNt: rawAsnSignals,
        },
        () => {
          this.convertValuesForHtsViz("merit-nt", "asn");
        }
      );
    }

    // data for additional raw feed signals to use after load all button is clicked
    if (this.props.additionalRawSignal !== prevProps.additionalRawSignal) {
      if (this.props.additionalRawSignal[0][0] !== undefined) {
        switch (this.props.additionalRawSignal[0][0]["entityType"]) {
          case "region":
            switch (this.props.additionalRawSignal[0][0]["datasource"]) {
              case "ping-slash24":
                let rawRegionalSignalsRawPingSlash24 =
                  this.state.rawRegionalSignalsRawPingSlash24.concat(
                    this.props.additionalRawSignal[0]
                  );
                this.setState(
                  {
                    rawRegionalSignalsRawPingSlash24:
                      rawRegionalSignalsRawPingSlash24,
                  },
                  () => {
                    this.convertValuesForHtsViz("ping-slash24", "asn");
                  }
                );
                break;
              case "bgp":
                let rawRegionalSignalsRawBgp =
                  this.state.rawRegionalSignalsRawBgp.concat(
                    this.props.additionalRawSignal[0]
                  );
                this.setState(
                  {
                    rawRegionalSignalsRawBgp: rawRegionalSignalsRawBgp,
                  },
                  () => {
                    this.convertValuesForHtsViz("bgp", "asn");
                  }
                );
                break;
              case "ucsd-nt":
                let rawRegionalSignalsRawUcsdNt =
                  this.state.rawRegionalSignalsRawUcsdNt.concat(
                    this.props.additionalRawSignal[0]
                  );
                this.setState(
                  {
                    rawRegionalSignalsRawUcsdNt: rawRegionalSignalsRawUcsdNt,
                  },
                  () => {
                    this.convertValuesForHtsViz("ucsd-nt", "asn");
                  }
                );
                break;
              case "merit-nt":
                let rawRegionalSignalsRawMeritNt =
                  this.state.rawRegionalSignalsRawMeritNt.concat(
                    this.props.additionalRawSignal[0]
                  );
                this.setState(
                  {
                    rawRegionalSignalsRawMeritNt: rawRegionalSignalsRawMeritNt,
                  },
                  () => {
                    this.convertValuesForHtsViz("merit-nt", "asn");
                  }
                );
                break;
            }
            break;
          case "asn":
            switch (this.props.additionalRawSignal[0][0]["datasource"]) {
              case "ping-slash24":
                let rawAsnSignalsRawPingSlash24 =
                  this.state.rawAsnSignalsRawPingSlash24.concat(
                    this.props.additionalRawSignal[0]
                  );
                this.setState(
                  {
                    rawAsnSignalsRawPingSlash24: rawAsnSignalsRawPingSlash24,
                  },
                  () => this.convertValuesForHtsViz("ping-slash24", "asn")
                );
                break;
              case "bgp":
                let rawAsnSignalsRawBgp = this.state.rawAsnSignalsRawBgp.concat(
                  this.props.additionalRawSignal[0]
                );
                this.setState(
                  {
                    rawAsnSignalsRawBgp: rawAsnSignalsRawBgp,
                  },
                  () => this.convertValuesForHtsViz("bgp", "asn")
                );
                break;
              case "ucsd-nt":
                let rawAsnSignalsRawUcsdNt =
                  this.state.rawAsnSignalsRawUcsdNt.concat(
                    this.props.additionalRawSignal[0]
                  );
                this.setState(
                  {
                    rawAsnSignalsRawUcsdNt: rawAsnSignalsRawUcsdNt,
                  },
                  () => this.convertValuesForHtsViz("ucsd-nt", "asn")
                );
                break;
              case "merit-nt":
                let rawAsnSignalsRawMeritNt =
                  this.state.rawAsnSignalsRawMeritNt.concat(
                    this.props.additionalRawSignal[0]
                  );
                this.setState(
                  {
                    rawAsnSignalsRawMeritNt: rawAsnSignalsRawMeritNt,
                  },
                  () => this.convertValuesForHtsViz("merit-nt", "asn")
                );
                break;
            }
            break;
        }
      }
    }
  }

  // Control Panel
  // manage the date selected in the input
  handleTimeFrame = ({ from, until }) => {
    const { history } = this.props;
    history.push(
      `/${this.state.entityType}/${this.state.entityCode}?from=${from}&until=${until}`
    );
  };

  handleControlPanelClose = () => {
    const { history } = this.props;
    history.push(
      hasDateRangeInUrl()
        ? `/dashboard?from=${this.state.from}&until=${this.state.until}`
        : `/dashboard`
    );
  };

  // Define what happens when user clicks suggested search result entry
  handleResultClick = (entity) => {
    if (!entity) return;
    const { history } = this.props;
    history.push(`/${entity.type}/${entity.code}`);
  };

  // Function that returns search bar passed into control panel
  populateSearchBar = () => {
    return (
      <EntitySearchTypeahead
        placeholder={T.translate("controlPanel.searchBarPlaceholder")}
        onSelect={(entity) => this.handleResultClick(entity)}
      />
    );
  };

  getChartExportTitle = () => {
    return `${T.translate(
      "entity.xyChartTitle"
    )} ${this.state.entityName?.trim()}`;
  };

  getChartExportSubtitle = () => {
    const fromDayjs = secondsToUTC(this.state.from);
    const untilDayjs = secondsToUTC(this.state.until);

    const formatExpanded = "MMMM D, YYYY h:mma";

    return `${fromDayjs.format(formatExpanded)} - ${untilDayjs.format(
      formatExpanded
    )} UTC`;
  };

  getChartExportFileName = () => {
    const fromDayjs = secondsToUTC(this.state.from);

    const formatCompact = "YY-MM-DD-HH-mm";

    const exportFileNameBase = `ioda-${
      this.state.entityName
    }-${fromDayjs.format(formatCompact)}`;

    return exportFileNameBase.replace(/\s+/g, "-").toLowerCase();
  };

  // 1st Row
  // XY Chart Functions
  // format data from api to be compatible with chart visual
  convertValuesForXyViz = () => {
    const signalValues = [];
    const normalizedValues = [];

    // Holds a map of series-id to the max y-value in that series
    const seriesMaxes = {};

    // Holds a map of series-id to the min y-value in that series
    const seriesMins = {};

    // Loop through available datasources to collect plot points
    this.state.tsDataRaw[0].forEach((datasource) => {
      let id = datasource.datasource;
      id += datasource.subtype ? `.${datasource.subtype}` : "";

      // Only track the maxes of visible series. If we keep the maxes from
      // invisible series, they may influence the y-axis maxes even though they
      // aren't displayed
      const seriesMax = getMaxValue(datasource.values);
      if (this.state.tsDataSeriesVisibleMap[id]) {
        seriesMaxes[id] = this.state.tsDataNormalized ? 100 : seriesMax;
        seriesMins[id] = this.state.tsDataNormalized
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
        const y = this.state.tsDataNormalized ? normalY : value;

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
      if (this.state.tsDataNormalized) {
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
      if (this.state.tsDataNormalized) {
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

    const { chartSignals, alertBands } = this.createChartSeries(
      signalValues,
      normalizedValues,
      leftPartitionSeries
    );

    // Set necessary fields for chart exporting
    const exportChartTitle = this.getChartExportTitle();

    const exportChartSubtitle = this.getChartExportSubtitle();

    const exportFileName = this.getChartExportFileName();

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
        height: this.state.tsDataScreenBelow678 ? 400 : 514,
        spacingBottom: 0,
        spacingLeft: 5,
        spacingRight: 5,
        style: {
          fontFamily: CUSTOM_FONT_FAMILY,
        },
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
          credits: {
            enabled: true,
            text: "ioda.live",
            href: "https://ioda.inetintel.cc.gatech.edu/",
            position: {
              align: "right",
              verticalAlign: "top",
              x: -15,
              y: 25,
            },
            style: {
              color: "#000",
              fontSize: "16px",
              fontWeight: "bold",
              fontFamily: CUSTOM_FONT_FAMILY,
            },
          },
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
          fontSize: this.state.tsDataScreenBelow678 ? "10px" : "12px",
          fontFamily: CUSTOM_FONT_FAMILY,
        },
        // Compress legend items on small screens (remove column alignment)
        alignColumns: !this.state.tsDataScreenBelow678,
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
              this.handleChartLegendSelectionChange(legendItemId);
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
            this.xyPlotRangeChanged(e);
          },
        },
      },
      yAxis: [
        // Primary y-axis
        {
          floor: 0,
          min: this.state.tsDataNormalized ? 0 : leftPartitionMin,
          max: this.state.tsDataNormalized ? 110 : leftPartitionMax,
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
            formatter: function () {
              return formatYAxisLabels(this.value);
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
            formatter: function () {
              return formatYAxisLabels(this.value);
            },
          },
        },
      ],
      series: chartSignals,
    };

    const navigatorLowerBound = secondsToMilliseconds(
      this.state.tsDataLegendRangeFrom
    );
    const navigatorUpperBound = secondsToMilliseconds(
      this.state.tsDataLegendRangeUntil
    );

    // Rerender chart and set navigator bounds
    this.setState({ xyChartOptions: chartOptions }, () => {
      this.renderXyChart();
      this.setChartNavigatorTimeRange(navigatorLowerBound, navigatorUpperBound);
    });
  };

  setDefaultNavigatorTimeRange = () => {
    const navigatorLowerBound = secondsToMilliseconds(this.state.from);
    const navigatorUpperBound = secondsToMilliseconds(this.state.until);

    this.setChartNavigatorTimeRange(navigatorLowerBound, navigatorUpperBound);
  };

  setChartNavigatorTimeRange = (fromMs, untilMs) => {
    if (!this.timeSeriesChartRef.current) {
      return;
    }
    this.timeSeriesChartRef.current.chart.xAxis[0].setExtremes(fromMs, untilMs);
  };

  getSeriesNameFromSource = (source) => {
    const legendDetails = legend.find((elem) => elem.key === source);

    if (!legendDetails) {
      return "";
    }

    return legendDetails.key.includes(".")
      ? `Google (${legendDetails.title})`
      : legendDetails.title;
  };

  // format data used to draw the lines in the chart, called from convertValuesForXyViz()
  createChartSeries = (signalValues, normalValues, primaryPartition) => {
    const chartSignals = [];
    const alertBands = [];

    // Add alert bands series
    if (this.state.tsDataDisplayOutageBands) {
      if (this.state.eventDataRaw) {
        this.state.eventDataRaw.forEach((event) => {
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

      const seriesName = this.getSeriesNameFromSource(primarySignal.dataSource);

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
  };

  // function for when zoom/pan is used
  xyPlotRangeChanged = (event) => {
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

    this.setState({
      tsDataLegendRangeFrom: axisMin,
      tsDataLegendRangeUntil: axisMax,
    });
  };

  // populate xy chart UI
  renderXyChart = () => {
    return (
      this.state.xyChartOptions && (
        <div className="entity__chart">
          <HighchartsReact
            highcharts={Highcharts}
            options={this.state.xyChartOptions}
            ref={this.timeSeriesChartRef}
          />
        </div>
      )
    );
  };

  handleDisplayChartSettingsPopover = (val) => {
    this.setState({
      displayChartSettingsPopover: val,
    });
  };

  handleDisplayChartSharePopover = (val) => {
    this.setState({
      displayChartSharePopover: val,
    });
  };

  /**
   * Trigger a download of the chart from outside the chart context. Used in the
   * ShareLinkModal to trigger a direct download
   */
  manuallyDownloadChart = (imageType) => {
    if (this.timeSeriesChartRef.current) {
      this.timeSeriesChartRef.current.chart.exportChartLocal({
        type: imageType,
      });
    }
  };

  handleCSVDownload = () => {
    if (!this.timeSeriesChartRef.current) {
      return;
    }

    const csvString = this.timeSeriesChartRef.current.chart.getCSV();

    // The first column is the timestamp, and each following column is
    // duplicated because we duplicate each series for the navigator to always
    // show the normalized data. As such, we need to remove the duplicates.
    const parsedCSV = csvString
      .split("\n")
      .map((line) => {
        return line.split(",").filter((val, index) => {
          // Always keep the timestamp column
          if (index === 0) return true;
          // Duplicates are located at the even indices
          if (index % 2 === 1) return true;
          return false;
        });
      })
      .join("\n");

    const isNormalized = !!this.state.tsDataNormalized;
    const fileName =
      this.getChartExportFileName() + (isNormalized ? "-normalized" : "-raw");

    const blob = new Blob([parsedCSV], { type: "text/csv;charset=utf-8," });
    const objUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", objUrl);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Get an SVG node of the chart
   */
  getChartSvg = () => {
    if (this.timeSeriesChartRef.current) {
      return this.timeSeriesChartRef.current.chart.getSVG();
    }
    return null;
  };

  showAnnotationStudioModal = () => {
    this.setState({
      showAnnotationStudioModal: true,
      annotationStudioSvgBaseString: this.getChartSvg(),
    });
  };

  hideAnnotationStudioModal = () => {
    this.setState({
      showAnnotationStudioModal: false,
    });
  };

  // toggle normalized values and absolute values
  changeXyChartNormalization = () => {
    this.setState({ tsDataNormalized: !this.state.tsDataNormalized }, () =>
      this.convertValuesForXyViz()
    );
  };

  // toggle any populated alert bands to be displayed in chart
  handleDisplayAlertBands = (showBands) => {
    this.setState({ tsDataDisplayOutageBands: showBands }, () =>
      this.convertValuesForXyViz()
    );
  };

  // Track screen width to shift around legend, adjust height of xy chart
  resize = () => {
    const tsDataScreenBelow970 = window.innerWidth <= 970;
    if (tsDataScreenBelow970 !== this.state.tsDataScreenBelow970) {
      this.setState({ tsDataScreenBelow970 });
    }

    const tsDataScreenBelow678 = window.innerWidth <= 678;
    if (tsDataScreenBelow678 !== this.state.tsDataScreenBelow678) {
      this.setState({ tsDataScreenBelow678 }, () => {
        this.convertValuesForXyViz();
      });
    }
  };

  displayShareLinkModal = () => {
    this.setState({
      showShareLinkModal: true,
    });
  };

  hideShareLinkModal = () => {
    this.setState({
      showShareLinkModal: false,
    });
  };

  // Switching between Events and Alerts

  // 2nd Row
  // RelatedTo Map
  // Make API call to retrieve topographic data
  getDataTopo = (entityType) => {
    if (this.state.mounted) {
      getTopoAction(entityType)
        .then((data) =>
          topojson.feature(
            data.region.topology,
            data.region.topology.objects["ne_10m_admin_1.regions.v3.0.0"]
          )
        )
        .then((data) =>
          this.setState(
            {
              topoData: data,
            },
            this.getMapScores
          )
        );
    }
  };
  // Process Geo data from api, attribute outage scores to a new topoData property where possible, then render Map
  getMapScores = () => {
    if (this.state.topoData && this.state.summaryDataMapRaw) {
      let topoData = this.state.topoData;
      let features = [];
      let scores = [];
      let outageCoords;

      // get Topographic info for a country if it has outages
      this.state.summaryDataMapRaw.map((outage) => {
        let topoItemIndex = this.state.topoData.features.findIndex(
          (topoItem) => topoItem.properties.name === outage.entity.name
        );

        if (topoItemIndex > 0) {
          let item = topoData.features[topoItemIndex];
          item.properties.score = outage.scores.overall;
          topoData.features[topoItemIndex] = item;
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

      this.setState({ topoScores: scores, bounds: outageCoords });
    }
  };
  // Make API call to retrieve summary data to populate on map
  getDataRelatedToMapSummary = (entityType) => {
    if (this.state.mounted) {
      let until = this.state.until;
      let from = this.state.from;
      const limit = 170;
      const includeMetadata = true;
      let page = this.state.pageNumber;
      const entityCode = null;
      let relatedToEntityType, relatedToEntityCode;
      switch (this.state.entityType) {
        case "country":
          relatedToEntityType = this.state.entityType;
          relatedToEntityCode = this.state.entityCode;
          break;
        case "region":
          relatedToEntityType = "country";
          relatedToEntityCode =
            this.state.entityMetadata[0]["attrs"]["fqid"].split(".")[3];
          break;
        case "asn":
          relatedToEntityType = "asn";
          relatedToEntityCode =
            this.state.entityMetadata[0]["attrs"]["fqid"].split(".")[1];
          break;
      }
      // console.log(entityType, relatedToEntityType, relatedToEntityCode);
      this.props.searchRelatedToMapSummary(
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
  };

  // function to manage when a user clicks a country in the map
  handleEntityShapeClick = (entity) => {
    const { history } = this.props;
    let path = `/region/${entity.properties.id}`;
    if (hasDateRangeInUrl()) {
      path += `?from=${fromDate}&until=${untilDate}`;
    }
    history.push(path);
  };

  // Show/hide modal when button is clicked on either panel
  toggleModal = (modalLocation) => {
    const { entityType, entityCode } = this.state;
    if (modalLocation === "map") {
      // Get related entities used on table in map modal
      this.setState(
        {
          showMapModal: !this.state.showMapModal,
        },
        () => {
          if (this.state.showMapModal) {
            if (!this.state.rawRegionalSignalsLoaded) {
              this.props.regionalSignalsTableSummaryDataAction(
                "region",
                entityType,
                entityCode
              );
            }
          }
          if (!this.state.showMapModal) {
            this.setState({
              rawRegionalSignalsLoaded: true,
            });
          }
        }
      );
    } else if (modalLocation === "table") {
      this.setState(
        {
          showTableModal: !this.state.showTableModal,
        },
        () => {
          if (this.state.showTableModal) {
            if (!this.state.rawAsnSignalsLoaded) {
              this.props.asnSignalsTableSummaryDataAction(
                "asn",
                entityType,
                entityCode
              );
            }
          }
          if (!this.state.showTableModal) {
            this.setState({
              rawAsnSignalsLoaded: true,
            });
          }
        }
      );
    }
  };

  // Summary Table for related ASNs
  // Make API call to retrieve summary data to populate on map
  getDataRelatedToTableSummary = (entityType) => {
    if (this.state.mounted) {
      let until = this.state.until;
      let from = this.state.from;
      const limit = this.initialTableLimit;
      let page = this.state.relatedToTableApiPageNumber;
      const includeMetadata = true;
      const entityCode = null;
      let relatedToEntityType, relatedToEntityCode;
      switch (this.state.entityType) {
        case "country":
          relatedToEntityType = this.state.entityType;
          relatedToEntityCode = this.state.entityCode;
          break;
        case "region":
          relatedToEntityType = "country";
          relatedToEntityCode =
            this.state.entityMetadata[0]["attrs"]["fqid"].split(".")[3];
          break;
        case "asn":
          relatedToEntityType = "asn";
          relatedToEntityCode =
            this.state.entityMetadata[0]["attrs"]["fqid"].split(".")[1];
          entityType = "country";
          break;
      }
      // console.log(entityType, relatedToEntityType, relatedToEntityCode);
      this.props.searchRelatedToTableSummary(
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
  };
  // Make raw values from api compatible with table component
  convertValuesForSummaryTable = () => {
    let summaryData = convertValuesForSummaryTable(
      this.state.relatedToTableSummary
    );

    if (this.state.relatedToTableApiPageNumber === 0) {
      // console.log(summaryData);
      this.setState({
        relatedToTableSummaryProcessed: summaryData,
      });
    }
    // If the end of the data list is hit but more data exists, fetch it and tack it on
    if (this.state.relatedToTableApiPageNumber > 0) {
      this.setState({
        relatedToTableSummaryProcessed:
          this.state.relatedToTableSummaryProcessed.concat(summaryData),
      });
    }
  };

  // RawSignalsModal Windows
  // Make API call that gets raw signals for a group of entities
  getSignalsHtsDataEvents = (entityType, dataSource) => {
    let until = this.state.until;
    let from = this.state.from;
    let attr = null;
    let order = this.state.eventOrderByOrder;
    let entities;

    switch (entityType) {
      case "region":
        entities = this.state.regionalSignalsTableSummaryDataProcessed
          .map((entity) => {
            // some entities don't return a code to be used in an api call, seem to default to '??' in that event
            if (entity.code !== "??") {
              return entity.entityCode;
            }
          })
          .toString();
        switch (dataSource) {
          case "ping-slash24":
            this.props.getRawRegionalSignalsPingSlash24Action(
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
            this.props.getRawRegionalSignalsBgpAction(
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
            this.props.getRawRegionalSignalsUcsdNtAction(
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
            this.props.getRawRegionalSignalsMeritNtAction(
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
        entities = this.state.asnSignalsTableSummaryDataProcessed
          .map((entity) => {
            // some entities don't return a code to be used in an api call, seem to default to '??' in that event
            if (entity.code !== "??") {
              return entity.entityCode;
            }
          })
          .toString();
        switch (dataSource) {
          case "ping-slash24":
            this.props.getRawAsnSignalsPingSlash24Action(
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
            this.props.getRawAsnSignalsBgpAction(
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
            this.props.getRawAsnSignalsUcsdNtAction(
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
            this.props.getRawAsnSignalsMeritNtAction(
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
  };
  // Combine summary outage data with other raw signal data for populating Raw Signal Table
  combineValuesForSignalsTable = (entityType) => {
    switch (entityType) {
      case "region":
        if (
          this.state.summaryDataMapRaw &&
          this.state.regionalSignalsTableSummaryData
        ) {
          let signalsTableData = combineValuesForSignalsTable(
            this.state.summaryDataMapRaw,
            this.state.regionalSignalsTableSummaryData,
            this.initialHtsLimit
          );
          this.setState(
            {
              regionalSignalsTableSummaryDataProcessed: signalsTableData,
              regionalSignalsTableTotalCount: signalsTableData.length,
            },
            () => {
              // Get data for Stacked horizon series raw signals with all regions if data is not yet available
              this.getSignalsHtsDataEvents("region", "ping-slash24");
              this.getSignalsHtsDataEvents("region", "bgp");
              this.getSignalsHtsDataEvents("region", "ucsd-nt");
              this.getSignalsHtsDataEvents("region", "merit-nt");
            }
          );
        }
        break;
      case "asn":
        if (
          this.state.relatedToTableSummary &&
          this.state.asnSignalsTableSummaryData
        ) {
          let signalsTableData = combineValuesForSignalsTable(
            this.state.relatedToTableSummary,
            this.state.asnSignalsTableSummaryData,
            this.initialHtsLimit
          );
          this.setState(
            {
              asnSignalsTableSummaryDataProcessed: signalsTableData.slice(
                0,
                this.initialTableLimit
              ),
              asnSignalsTableTotalCount: signalsTableData.length,
            },
            () => {
              // Populate Stacked horizon graph with all regions
              if (this.state.entityType !== "asn") {
                this.getSignalsHtsDataEvents("asn", "ping-slash24");
                this.getSignalsHtsDataEvents("asn", "ucsd-nt");
                this.getSignalsHtsDataEvents("asn", "bgp");
                this.getSignalsHtsDataEvents("asn", "merit-nt");
              } else {
                this.getSignalsHtsDataEvents("country", "ping-slash24");
                this.getSignalsHtsDataEvents("country", "ucsd-nt");
                this.getSignalsHtsDataEvents("country", "bgp");
                this.getSignalsHtsDataEvents("country", "merit-nt");
              }
            }
          );
        }
        break;
    }
  };
  // function that decides what data will populate in the horizon time series
  convertValuesForHtsViz = (dataSource, entityType) => {
    let visibilityChecked = [];
    let entitiesChecked = 0;
    let rawSignalsNew = [];
    let signalsTableSummaryDataProcessed, rawSignals;
    switch (entityType) {
      case "region":
        signalsTableSummaryDataProcessed =
          this.state.regionalSignalsTableSummaryDataProcessed;
        switch (dataSource) {
          case "ping-slash24":
            rawSignals = this.state.rawRegionalSignalsRawPingSlash24;
            break;
          case "bgp":
            rawSignals = this.state.rawRegionalSignalsRawBgp;
            break;
          case "ucsd-nt":
            rawSignals = this.state.rawRegionalSignalsRawUcsdNt;
            break;
          case "merit-nt":
            rawSignals = this.state.rawRegionalSignalsRawMeritNt;
            break;
        }
        break;
      case "asn":
        signalsTableSummaryDataProcessed =
          this.state.asnSignalsTableSummaryDataProcessed;
        switch (dataSource) {
          case "ping-slash24":
            rawSignals = this.state.rawAsnSignalsRawPingSlash24;
            break;
          case "bgp":
            rawSignals = this.state.rawAsnSignalsRawBgp;
            break;
          case "ucsd-nt":
            rawSignals = this.state.rawAsnSignalsRawUcsdNt;
            break;
          case "merit-nt":
            rawSignals = this.state.rawAsnSignalsRawMeritNt;
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
        this.setState({
          regionalSignalsTableEntitiesChecked: entitiesChecked,
        });
        break;
      case "asn":
        this.setState({
          asnSignalsTableEntitiesChecked: entitiesChecked,
        });
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
            this.setState({
              rawRegionalSignalsProcessedPingSlash24:
                convertTsDataForHtsViz(rawSignalsNew),
              additionalRawSignalRequestedPingSlash24: false,
            });
            break;
          case "bgp":
            this.setState({
              rawRegionalSignalsProcessedBgp:
                convertTsDataForHtsViz(rawSignalsNew),
              additionalRawSignalRequestedBgp: false,
            });
            break;
          case "ucsd-nt":
            this.setState({
              rawRegionalSignalsProcessedUcsdNt:
                convertTsDataForHtsViz(rawSignalsNew),
              additionalRawSignalRequestedUcsdNt: false,
            });
            break;
          case "merit-nt":
            this.setState({
              rawRegionalSignalsProcessedMeritNt:
                convertTsDataForHtsViz(rawSignalsNew),
              additionalRawSignalRequestedMeritNt: false,
            });
            break;
        }
        break;
      case "asn":
        switch (dataSource) {
          case "ping-slash24":
            this.setState({
              rawAsnSignalsProcessedPingSlash24:
                convertTsDataForHtsViz(rawSignalsNew),
              additionalRawSignalRequestedPingSlash24: false,
            });
            break;
          case "bgp":
            this.setState({
              rawAsnSignalsProcessedBgp: convertTsDataForHtsViz(rawSignalsNew),
              additionalRawSignalRequestedBgp: false,
            });
            break;
          case "ucsd-nt":
            this.setState({
              rawAsnSignalsProcessedUcsdNt:
                convertTsDataForHtsViz(rawSignalsNew),
              additionalRawSignalRequestedUcsdNt: false,
            });
            break;
          case "merit-nt":
            this.setState({
              rawAsnSignalsProcessedMeritNt:
                convertTsDataForHtsViz(rawSignalsNew),
              additionalRawSignalRequestedMeritNt: false,
            });
            break;
        }
        break;
    }
  };
  // function to manage what happens when a checkbox is changed in the raw signals table
  toggleEntityVisibilityInHtsViz = (entity, entityType) => {
    let maxEntitiesPopulatedMessage = T.translate(
      "entityModal.maxEntitiesPopulatedMessage"
    );
    let signalsTableSummaryDataProcessed, indexValue;
    switch (entityType) {
      case "region":
        signalsTableSummaryDataProcessed =
          this.state.regionalSignalsTableSummaryDataProcessed;
        break;
      case "asn":
        signalsTableSummaryDataProcessed =
          this.state.asnSignalsTableSummaryDataProcessed;
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
        if (this.maxHtsLimit > this.state.currentEntitiesChecked) {
          this.setState(
            {
              currentEntitiesChecked: this.state.currentEntitiesChecked + 1,
            },
            () => {
              // check if entity data is already available
              switch (
                signalsTableSummaryDataProcessed[indexValue]["initiallyLoaded"]
              ) {
                case false:
                  // Update visibility boolean property in copied object to update table
                  signalsTableSummaryDataProcessed[indexValue][
                    "visibility"
                  ] = true;
                  // Check if raw signals data is already loaded for particular entity, get it if not
                  if (
                    this.state.asnRawSignalsLoadAllButtonClicked &&
                    signalsTableSummaryDataProcessed[indexValue][
                      "initiallyLoaded"
                    ] === false
                  ) {
                    // update property that manages if raw signal data has loaded or not
                    signalsTableSummaryDataProcessed[indexValue][
                      "initiallyLoaded"
                    ] = true;
                    // call api for additional data on entity
                    let until = this.state.until;
                    let from = this.state.from;
                    let attr = this.state.eventOrderByAttr;
                    let order = this.state.eventOrderByOrder;
                    let entity =
                      signalsTableSummaryDataProcessed[indexValue][
                        "entityCode"
                      ];
                    let entityType =
                      signalsTableSummaryDataProcessed[indexValue][
                        "entityType"
                      ];

                    if (entityType && entity) {
                      this.props.getAdditionalRawSignalAction(
                        entityType,
                        entity,
                        from,
                        until,
                        attr,
                        order,
                        "ping-slash24"
                      );
                      this.props.getAdditionalRawSignalAction(
                        entityType,
                        entity,
                        from,
                        until,
                        attr,
                        order,
                        "bgp"
                      );
                      this.props.getAdditionalRawSignalAction(
                        entityType,
                        entity,
                        from,
                        until,
                        attr,
                        order,
                        "ucsd-nt"
                      );
                      this.props.getAdditionalRawSignalAction(
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
                          this.setState({
                            regionalSignalsTableSummaryDataProcessed:
                              signalsTableSummaryDataProcessed,
                            rawSignalsMaxEntitiesHtsError: "",
                          });
                          break;
                        case "asn":
                          this.setState({
                            asnSignalsTableSummaryDataProcessed:
                              signalsTableSummaryDataProcessed,
                            rawSignalsMaxEntitiesHtsError: "",
                          });
                          break;
                      }
                    }
                  }
                  break;
                case true:
                  // set new data
                  switch (entityType) {
                    case "region":
                      this.setState(
                        {
                          regionalSignalsTableSummaryDataProcessed:
                            signalsTableSummaryDataProcessed,
                          rawSignalsMaxEntitiesHtsError: "",
                        },
                        () => {
                          this.convertValuesForHtsViz("ping-slash24", "region");
                          this.convertValuesForHtsViz("bgp", "region");
                          this.convertValuesForHtsViz("ucsd-nt", "region");
                          this.convertValuesForHtsViz("merit-nt", "region");
                        }
                      );

                      break;
                    case "asn":
                      this.setState(
                        {
                          asnSignalsTableSummaryDataProcessed:
                            signalsTableSummaryDataProcessed,
                          rawSignalsMaxEntitiesHtsError: "",
                        },
                        () => {
                          this.convertValuesForHtsViz("ping-slash24", "asn");
                          this.convertValuesForHtsViz("bgp", "asn");
                          this.convertValuesForHtsViz("ucsd-nt", "asn");
                          this.convertValuesForHtsViz("merit-nt", "asn");
                        }
                      );
                      break;
                  }
                  break;
              }
            }
          );
        } else {
          // Show error message
          this.setState({
            rawSignalsMaxEntitiesHtsError: maxEntitiesPopulatedMessage,
            additionalRawSignalRequestedPingSlash24: false,
            additionalRawSignalRequestedBgp: false,
            additionalRawSignalRequestedUcsdNt: false,
            additionalRawSignalRequestedMeritNt: false,
          });
        }
        break;
      case false:
        // // Update currently checked item count and set new data to populate
        this.setState({
          currentEntitiesChecked: this.state.currentEntitiesChecked - 1,
        });
        switch (entityType) {
          case "region":
            this.setState(
              {
                regionalSignalsTableSummaryDataProcessed:
                  signalsTableSummaryDataProcessed,
                rawSignalsMaxEntitiesHtsError: "",
                additionalRawSignalRequestedPingSlash24: false,
                additionalRawSignalRequestedBgp: false,
                additionalRawSignalRequestedUcsdNt: false,
                additionalRawSignalRequestedMeritNt: false,
              },
              () => {
                this.convertValuesForHtsViz("ping-slash24", "region");
                this.convertValuesForHtsViz("bgp", "region");
                this.convertValuesForHtsViz("ucsd-nt", "region");
                this.convertValuesForHtsViz("merit-nt", "region");
              }
            );
            break;
          case "asn":
            this.setState(
              {
                asnSignalsTableSummaryDataProcessed:
                  signalsTableSummaryDataProcessed,
                rawSignalsMaxEntitiesHtsError: "",
                additionalRawSignalRequestedPingSlash24: false,
                additionalRawSignalRequestedBgp: false,
                additionalRawSignalRequestedUcsdNt: false,
                additionalRawSignalRequestedMeritNt: false,
              },
              () => {
                this.convertValuesForHtsViz("ping-slash24", "asn");
                this.convertValuesForHtsViz("bgp", "asn");
                this.convertValuesForHtsViz("ucsd-nt", "asn");
                this.convertValuesForHtsViz("merit-nt", "asn");
              }
            );
            break;
        }
        break;
    }
  };
  // function to manage what happens when the select max/uncheck all buttons are clicked
  handleSelectAndDeselectAllButtons = (target) => {
    if (target === "checkMaxRegional") {
      this.setState(
        {
          checkMaxButtonLoading: true,
        },
        () => {
          let regionalSignalsTableSummaryDataProcessed =
            this.state.regionalSignalsTableSummaryDataProcessed;
          // Count how many entities are currently checked
          let entitiesCurrentlyChecked = 0;
          regionalSignalsTableSummaryDataProcessed.map((entity) => {
            if (entity.visibility === true) {
              entitiesCurrentlyChecked = entitiesCurrentlyChecked + 1;
            }
          });
          // Check off additional entities to get to max allowed
          regionalSignalsTableSummaryDataProcessed.map((entity, index) => {
            entity.visibility = index < this.maxHtsLimit;
          });

          this.setState(
            {
              regionalSignalsTableSummaryDataProcessed:
                regionalSignalsTableSummaryDataProcessed,
              regionalSignalsTableEntitiesChecked:
                regionalSignalsTableSummaryDataProcessed.length <
                this.maxHtsLimit
                  ? regionalSignalsTableSummaryDataProcessed.length
                  : this.maxHtsLimit,
              currentEntitiesChecked: this.maxHtsLimit,
              checkMaxButtonLoading: false,
            },
            () => {
              this.convertValuesForHtsViz("ping-slash24", "region");
              this.convertValuesForHtsViz("bgp", "region");
              this.convertValuesForHtsViz("ucsd-nt", "region");
              this.convertValuesForHtsViz("merit-nt", "region");
            }
          );
        }
      );
    }
    if (target === "uncheckAllRegional") {
      this.setState(
        {
          uncheckAllButtonLoading: true,
        },
        () => {
          let regionalSignalsTableSummaryDataProcessed =
            this.state.regionalSignalsTableSummaryDataProcessed;
          regionalSignalsTableSummaryDataProcessed.map((entity) => {
            entity.visibility = false;
          });
          this.setState(
            {
              regionalSignalsTableSummaryDataProcessed:
                regionalSignalsTableSummaryDataProcessed,
              regionalSignalsTableEntitiesChecked: 0,
              currentEntitiesChecked: 0,
              uncheckAllButtonLoading: false,
            },
            () => {
              this.convertValuesForHtsViz("ping-slash24", "region");
              this.convertValuesForHtsViz("bgp", "region");
              this.convertValuesForHtsViz("ucsd-nt", "region");
              this.convertValuesForHtsViz("merit-nt", "region");
            }
          );
        }
      );
    }
    if (target === "checkMaxAsn") {
      // Check if all entities are loaded
      // if (this.state.asnRawSignalsLoadAllButtonClicked) {
      this.setState(
        {
          checkMaxButtonLoading: true,
        },
        () => {
          setTimeout(() => {
            let asnSignalsTableSummaryDataProcessed =
              this.state.asnSignalsTableSummaryDataProcessed;
            // Count how many entities are currently checked
            let entitiesCurrentlyChecked = 0;
            asnSignalsTableSummaryDataProcessed.map((entity) => {
              if (entity.visibility === true) {
                entitiesCurrentlyChecked = entitiesCurrentlyChecked + 1;
              }
            });
            // Check off additional entities to get to max allowed
            asnSignalsTableSummaryDataProcessed.map((entity, index) => {
              entity.visibility = index < this.maxHtsLimit;
            });
            this.setState(
              {
                asnSignalsTableSummaryDataProcessed:
                  asnSignalsTableSummaryDataProcessed,
                asnSignalsTableEntitiesChecked:
                  asnSignalsTableSummaryDataProcessed.length < this.maxHtsLimit
                    ? asnSignalsTableSummaryDataProcessed.length
                    : this.maxHtsLimit,
                currentEntitiesChecked: this.maxHtsLimit,
                checkMaxButtonLoading: false,
              },
              () => {
                this.convertValuesForHtsViz("ping-slash24", "asn");
                this.convertValuesForHtsViz("bgp", "asn");
                this.convertValuesForHtsViz("ucsd-nt", "asn");
                this.convertValuesForHtsViz("merit-nt", "asn");
              }
            );
          }, 500);
        }
      );
    }
    if (target === "uncheckAllAsn") {
      this.setState(
        {
          uncheckAllButtonLoading: true,
        },
        () => {
          setTimeout(() => {
            let asnSignalsTableSummaryDataProcessed =
              this.state.asnSignalsTableSummaryDataProcessed;
            asnSignalsTableSummaryDataProcessed.map((entity) => {
              entity.visibility = false;
            });
            this.setState(
              {
                asnSignalsTableSummaryDataProcessed:
                  asnSignalsTableSummaryDataProcessed,
                asnSignalsTableEntitiesChecked: 0,
                currentEntitiesChecked: 0,
                uncheckAllButtonLoading: false,
              },
              () => {
                this.convertValuesForHtsViz("ping-slash24", "asn");
                this.convertValuesForHtsViz("bgp", "asn");
                this.convertValuesForHtsViz("ucsd-nt", "asn");
                this.convertValuesForHtsViz("merit-nt", "asn");
              }
            );
          }, 500);
        }
      );
    }
  };
  // function to manage what happens when the load all entities button is clicked
  handleLoadAllEntitiesButton = (name) => {
    if (name === "regionLoadAllEntities") {
      this.setState({
        loadAllButtonEntitiesLoading: true,
      });
      let signalsTableData = combineValuesForSignalsTable(
        this.state.summaryDataMapRaw,
        this.state.regionalSignalsTableSummaryData,
        0
      );
      this.setState(
        {
          regionalSignalsTableSummaryDataProcessed:
            this.state.regionalSignalsTableSummaryDataProcessed.concat(
              signalsTableData.slice(this.initialTableLimit)
            ),
        },
        () => {
          this.setState({
            loadAllButtonEntitiesLoading: false,
            regionalRawSignalsLoadAllButtonClicked: true,
          });
        }
      );
    }

    if (name === "asnLoadAllEntities") {
      this.setState(
        {
          asnRawSignalsLoadAllButtonClicked: true,
        },
        () => {
          let signalsTableData = combineValuesForSignalsTable(
            this.state.relatedToTableSummary,
            this.state.asnSignalsTableSummaryData,
            0
          );
          this.setState(
            {
              asnSignalsTableSummaryDataProcessed:
                this.state.asnSignalsTableSummaryDataProcessed.concat(
                  signalsTableData.slice(this.initialTableLimit)
                ),
            },
            () => {
              this.setState({
                loadAllButtonEntitiesLoading: false,
              });
            }
          );
        }
      );
    }
  };
  handleAdditionalEntitiesLoading = () => {
    this.setState({
      loadAllButtonEntitiesLoading: true,
    });
  };
  // to trigger loading bars on raw signals horizon time series when a checkbox event occurs in the signals table
  handleCheckboxEventLoading = (item) => {
    let maxEntitiesPopulatedMessage = T.translate(
      "entityModal.maxEntitiesPopulatedMessage"
    );
    // Set checkbox visibility
    let signalsTableSummaryDataProcessed, indexValue;
    switch (item.entityType) {
      case "region":
        signalsTableSummaryDataProcessed =
          this.state.regionalSignalsTableSummaryDataProcessed;
        break;
      case "asn":
        signalsTableSummaryDataProcessed =
          this.state.asnSignalsTableSummaryDataProcessed;
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
        this.maxHtsLimit > this.state.currentEntitiesChecked) ||
      signalsTableSummaryDataProcessed[indexValue]["visibility"] === true
    ) {
      signalsTableSummaryDataProcessed[indexValue]["visibility"] =
        !signalsTableSummaryDataProcessed[indexValue]["visibility"];

      // set loading bars and updated table data
      switch (item.entityType) {
        case "region":
          this.setState(
            {
              additionalRawSignalRequestedPingSlash24: true,
              additionalRawSignalRequestedBgp: true,
              additionalRawSignalRequestedUcsdNt: true,
              additionalRawSignalRequestedMeritNt: true,
              regionalSignalsTableSummaryDataProcessed:
                signalsTableSummaryDataProcessed,
            },
            () => {
              setTimeout(() => {
                this.toggleEntityVisibilityInHtsViz(item, item["entityType"]);
              }, 500);
            }
          );
          break;
        case "asn":
          this.setState(
            {
              additionalRawSignalRequestedPingSlash24: true,
              additionalRawSignalRequestedBgp: true,
              additionalRawSignalRequestedUcsdNt: true,
              additionalRawSignalRequestedMeritNt: true,
              asnSignalsTableSummaryDataProcessed:
                signalsTableSummaryDataProcessed,
            },
            () => {
              setTimeout(() => {
                this.toggleEntityVisibilityInHtsViz(item, item["entityType"]);
              }, 500);
            }
          );
          break;
      }
    } else {
      this.setState({
        rawSignalsMaxEntitiesHtsError: maxEntitiesPopulatedMessage,
      });
    }
  };

  /**
   * Handles users toggling a chart legend series (on the chart itself): when a
   * user clicks in the chart legend, toggle the side checkboxes on the side to
   * match the state
   */
  handleChartLegendSelectionChange = (source) => {
    const currentSeriesVisibility = !!this.state.tsDataSeriesVisibleMap[source];
    const newSeriesVisibility = !currentSeriesVisibility;
    const newVisibility = {
      ...this.state.tsDataSeriesVisibleMap,
      [source]: newSeriesVisibility,
    };

    this.setState({ tsDataSeriesVisibleMap: newVisibility }, () => {
      this.convertValuesForXyViz();
    });
  };

  /**
   * Handles user toggling checkboxes (next to the chart, not on the chart
   * legend itself) for series: dispatch an event to simulate the user changing
   * a selection on the chart legend itself. This will call the
   * handleChartLegendSelectionChange method above to update the checkbox state
   */
  handleSelectedSignal = (source) => {
    const currentSeriesVisibility = !!this.state.tsDataSeriesVisibleMap[source];
    const newSeriesVisibility = !currentSeriesVisibility;
    const newVisibility = {
      ...this.state.tsDataSeriesVisibleMap,
      [source]: newSeriesVisibility,
    };

    this.setState({ tsDataSeriesVisibleMap: newVisibility }, () => {
      this.setSeriesVisibilityInChartLegend(source, newSeriesVisibility);
      this.convertValuesForXyViz();
    });
  };

  setSeriesVisibilityInChartLegend = (source, visible) => {
    if (!this.timeSeriesChartRef.current) {
      return;
    }

    // Find the chart series object corresponding to the changed signal
    const seriesObject = this.timeSeriesChartRef.current.chart.series.find(
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
  };

  updateSourceParams = (src) => {
    if (!this.state.sourceParams.includes(src)) {
      this.setState({
        sourceParams: [...this.state.sourceParams, src],
      });
    }
  };

  toggleView = () => {
    let tmpVisibleSeries = this.state.prevDataSeriesVisibleMap;
    this.setState(
      {
        simplifiedView: !this.state.simplifiedView,
        tsDataDisplayOutageBands: !this.state.tsDataDisplayOutageBands,
        prevDataSeriesVisibleMap: this.state.tsDataSeriesVisibleMap,
        tsDataSeriesVisibleMap: tmpVisibleSeries,
      },
      () => this.convertValuesForXyViz()
    );
  };

  handleSelectTab = (selectedKey) => {
    if (this.state.currentTab !== selectedKey) {
      this.setState({ currentTab: selectedKey });
      this.toggleView();
    }
  };

  render = () => {
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
          <title>IODA | Internet Outages for {this.state.entityName}</title>
          <meta
            name="description"
            content={`Visualizations and Alerts for ${this.state.entityName} Internet Outages Detected by IODA`}
          />
        </Helmet>
        <ControlPanel
          from={this.state.from}
          until={this.state.until}
          searchbar={() => this.populateSearchBar()}
          onTimeFrameChange={this.handleTimeFrame}
          onClose={this.handleControlPanelClose}
          title={this.state.entityName}
        />
        {this.state.displayTimeRangeError ? (
          <Error />
        ) : this.state.until - this.state.from < controlPanelTimeRangeLimit ? (
          <React.Fragment>
            {/* Share Link Modal */}
            <ShareLinkModal
              open={this.state.showShareLinkModal}
              link={window.location.href}
              hideModal={this.hideShareLinkModal}
              showModal={this.displayShareLinkModal}
              entityName={this.state.entityName}
              handleDownload={() => this.manuallyDownloadChart("image/jpeg")}
            />
            <AnnotationStudioModal
              open={this.state.showAnnotationStudioModal}
              svgString={this.state.annotationStudioSvgBaseString}
              hideModal={this.hideAnnotationStudioModal}
              chartTitle={this.getChartExportTitle()}
              chartSubtitle={this.getChartExportSubtitle()}
              exportFileName={this.getChartExportFileName()}
            />
            <div className="flex items-stretch gap-6 mb-6 entity__chart-layout">
              <div className="col-2 p-4 card entity__chart">
                <div className="flex items-center mb-3">
                  <h3 className="text-2xl mr-1">
                    {xyChartTitle}
                    {this.state.entityName}
                  </h3>
                  <Tooltip
                    className="mr-auto"
                    title={tooltipXyPlotTimeSeriesTitle}
                    text={tooltipXyPlotTimeSeriesText}
                  />

                  <Popover
                    open={this.state.displayChartSettingsPopover}
                    onOpenChange={this.handleDisplayChartSettingsPopover}
                    trigger="click"
                    placement="bottomRight"
                    overlayStyle={{
                      width: 180,
                    }}
                    content={
                      <div
                        onClick={() =>
                          this.handleDisplayChartSettingsPopover(false)
                        }
                      >
                        {!this.state.simplifiedView && (
                          <>
                            <Checkbox
                              checked={!!this.state.tsDataDisplayOutageBands}
                              onChange={(e) =>
                                this.handleDisplayAlertBands(e.target.checked)
                              }
                            >
                              {xyChartAlertToggleLabel}
                            </Checkbox>
                            <Checkbox
                              checked={!!this.state.tsDataNormalized}
                              onChange={this.changeXyChartNormalization}
                            >
                              {xyChartNormalizedToggleLabel}
                            </Checkbox>
                          </>
                        )}
                        <Button
                          className="w-full mt-2"
                          size="small"
                          onClick={this.setDefaultNavigatorTimeRange}
                        >
                          Reset Zoom
                        </Button>
                      </div>
                    }
                  >
                    <Button className="mr-3" icon={<SettingOutlined />} />
                  </Popover>
                  <Button
                    className="mr-3"
                    icon={<EditOutlined />}
                    onClick={this.showAnnotationStudioModal}
                  />
                  <Button
                    className="mr-3"
                    icon={<ShareAltOutlined />}
                    onClick={this.displayShareLinkModal}
                  />
                  <Popover
                    open={this.state.displayChartSharePopover}
                    onOpenChange={this.handleDisplayChartSharePopover}
                    trigger="click"
                    placement="bottomRight"
                    overlayStyle={{
                      maxWidth: 180,
                    }}
                    content={
                      <div
                        onClick={() =>
                          this.handleDisplayChartSharePopover(false)
                        }
                      >
                        <Button
                          className="w-full mb-2"
                          size="small"
                          onClick={this.handleCSVDownload}
                        >
                          Data CSV
                        </Button>
                        <Button
                          className="w-full mb-2"
                          size="small"
                          onClick={() =>
                            this.manuallyDownloadChart("image/jpeg")
                          }
                        >
                          Chart JPEG
                        </Button>
                        <Button
                          className="w-full mb-2"
                          size="small"
                          onClick={() =>
                            this.manuallyDownloadChart("image/png")
                          }
                        >
                          Chart PNG
                        </Button>
                        <Button
                          className="w-full"
                          size="small"
                          onClick={() =>
                            this.manuallyDownloadChart("image/svg+xml")
                          }
                        >
                          Chart SVG
                        </Button>
                      </div>
                    }
                  >
                    <Button icon={<DownloadOutlined />} />
                  </Popover>
                </div>
                {this.state.xyChartOptions ? this.renderXyChart() : <Loading />}
                <TimeStamp
                  className="mt-4"
                  from={this.state.tsDataLegendRangeFrom}
                  until={this.state.tsDataLegendRangeUntil}
                />
              </div>
              <div className="col-1 p-4 card">
                <ChartTabCard
                  type={this.props.type}
                  eventData={this.state.eventDataRaw}
                  alertsData={this.state.alertDataRaw}
                  legendHandler={this.handleSelectedSignal}
                  tsDataSeriesVisibleMap={this.state.tsDataSeriesVisibleMap}
                  updateSourceParams={this.updateSourceParams}
                  simplifiedView={this.state.simplifiedView}
                />
              </div>
            </div>
            <EntityRelated
              entityName={this.state.entityName}
              entityType={this.state.entityType}
              parentEntityName={this.state.parentEntityName}
              toggleModal={this.toggleModal}
              showMapModal={this.state.showMapModal}
              showTableModal={this.state.showTableModal}
              // to populate map
              topoData={this.state.topoData}
              topoScores={this.state.topoScores}
              bounds={this.state.bounds}
              handleEntityShapeClick={(entity) =>
                this.handleEntityShapeClick(entity)
              }
              summaryDataRaw={this.state.summaryDataRaw}
              // to populate asn summary table
              relatedToTableSummaryProcessed={
                this.state.relatedToTableSummaryProcessed
              }
              relatedToTableSummary={this.state.relatedToTableSummary}
              // handleEntityClick={(entity) => this.handleEntityClick(entity)}
              // raw signals tables for region modal
              handleSelectAndDeselectAllButtons={(event) =>
                this.handleSelectAndDeselectAllButtons(event)
              }
              regionalSignalsTableSummaryDataProcessed={
                this.state.regionalSignalsTableSummaryDataProcessed
              }
              toggleEntityVisibilityInHtsViz={(event) =>
                this.toggleEntityVisibilityInHtsViz(event, "region")
              }
              handleCheckboxEventLoading={(item) =>
                this.handleCheckboxEventLoading(item)
              }
              asnSignalsTableSummaryDataProcessed={
                this.state.asnSignalsTableSummaryDataProcessed
              }
              // Regional HTS methods
              regionalSignalsTableEntitiesChecked={
                this.state.regionalSignalsTableEntitiesChecked
              }
              asnSignalsTableEntitiesChecked={
                this.state.asnSignalsTableEntitiesChecked
              }
              initialTableLimit={this.initialTableLimit}
              rawRegionalSignalsProcessedPingSlash24={
                this.state.rawRegionalSignalsProcessedPingSlash24
              }
              rawRegionalSignalsProcessedBgp={
                this.state.rawRegionalSignalsProcessedBgp
              }
              rawRegionalSignalsProcessedUcsdNt={
                this.state.rawRegionalSignalsProcessedUcsdNt
              }
              rawRegionalSignalsProcessedMeritNt={
                this.state.rawRegionalSignalsProcessedMeritNt
              }
              rawAsnSignalsProcessedPingSlash24={
                this.state.rawAsnSignalsProcessedPingSlash24
              }
              rawAsnSignalsProcessedBgp={this.state.rawAsnSignalsProcessedBgp}
              rawAsnSignalsProcessedUcsdNt={
                this.state.rawAsnSignalsProcessedUcsdNt
              }
              rawAsnSignalsProcessedMeritNt={
                this.state.rawAsnSignalsProcessedMeritNt
              }
              summaryDataMapRaw={this.state.summaryDataMapRaw}
              rawSignalsMaxEntitiesHtsError={
                this.state.rawSignalsMaxEntitiesHtsError
              }
              // count used to determine if text to populate remaining entities beyond the initial Table load limit should display
              asnSignalsTableTotalCount={this.state.asnSignalsTableTotalCount}
              regionalSignalsTableTotalCount={
                this.state.regionalSignalsTableTotalCount
              }
              // function used to call api to load remaining entities
              handleLoadAllEntitiesButton={(event) =>
                this.handleLoadAllEntitiesButton(event)
              }
              // Used to determine if load all message should display or not
              regionalRawSignalsLoadAllButtonClicked={
                this.state.regionalRawSignalsLoadAllButtonClicked
              }
              asnRawSignalsLoadAllButtonClicked={
                this.state.asnRawSignalsLoadAllButtonClicked
              }
              // modal loading icon for load all button
              loadAllButtonEntitiesLoading={
                this.state.loadAllButtonEntitiesLoading
              }
              handleAdditionalEntitiesLoading={() =>
                this.handleAdditionalEntitiesLoading()
              }
              additionalRawSignalRequestedPingSlash24={
                this.state.additionalRawSignalRequestedPingSlash24
              }
              additionalRawSignalRequestedBgp={
                this.state.additionalRawSignalRequestedBgp
              }
              additionalRawSignalRequestedUcsdNt={
                this.state.additionalRawSignalRequestedUcsdNt
              }
              additionalRawSignalRequestedMeritNt={
                this.state.additionalRawSignalRequestedMeritNt
              }
              // used for tracking when check max/uncheck all loading icon should appear and not
              checkMaxButtonLoading={this.state.checkMaxButtonLoading}
              uncheckAllButtonLoading={this.state.uncheckAllButtonLoading}
              // used to check if there are no entities available to load (to control when loading bar disappears)
              rawRegionalSignalsRawBgpLength={
                this.state.rawRegionalSignalsRawBgp.length
              }
              rawRegionalSignalsRawPingSlash24Length={
                this.state.rawRegionalSignalsRawPingSlash24.length
              }
              rawRegionalSignalsRawUcsdNtLength={
                this.state.rawRegionalSignalsRawUcsdNt.length
              }
              rawRegionalSignalsRawMeritNtLength={
                this.state.rawRegionalSignalsRawMeritNt.length
              }
              rawAsnSignalsRawBgpLength={this.state.rawAsnSignalsRawBgp.length}
              rawAsnSignalsRawPingSlash24Length={
                this.state.rawAsnSignalsRawPingSlash24.length
              }
              rawAsnSignalsRawUcsdNtLength={
                this.state.rawAsnSignalsRawUcsdNt.length
              }
              rawAsnSignalsRawMeritNtLength={
                this.state.rawAsnSignalsRawMeritNt.length
              }
            />
          </React.Fragment>
        ) : (
          <div className="p-6 text-lg card">
            {timeDurationTooHighErrorMessage}
            {getSecondsAsErrorDurationString(
              this.state.until - this.state.from
            )}
            .
          </div>
        )}
      </div>
    );
  };
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Entity));
