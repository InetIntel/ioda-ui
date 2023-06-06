// React Imports
import React, { Component } from "react";
// Internationalization
import T from "i18n-react";
// Data Hooks
import { searchEntities } from "../../data/ActionEntities";
import { getTopoAction } from "../../data/ActionTopo";
import { searchSummary, totalOutages } from "../../data/ActionOutages";
import {
  getSignalsAction,
  getEventSignalsAction,
} from "../../data/ActionSignals";
// Components
import ControlPanel from "../../components/controlPanel/ControlPanel";
import { Searchbar } from "caida-components-library";
import Tabs from "../../components/tabs/Tabs";
import DashboardTab from "./DashboardTab";
import * as topojson from "topojson";
// Constants
import { tabOptions, country, region, asn } from "./DashboardConstants";
import { connect } from "react-redux";
// Helper Functions
import {
  convertValuesForSummaryTable,
  convertTsDataForHtsViz,
  dateRangeToSeconds,
  dashboardTimeRangeLimit,
  convertTimeToSecondsForURL,
} from "../../utils";
import Loading from "../../components/loading/Loading";
import Error from "../../components/error/Error";
import { Helmet } from "react-helmet";
import {
  getNowAsUTCSeconds,
  getPreviousMinutesAsUTCSecondRange,
} from "../../utils/timeUtils";
import { getDateRangeFromUrl } from "../../utils/urlUtils";
import { withRouter } from "react-router-dom";
import { Radio } from "antd";

const TAB_VIEW_MAP = "map";
const TAB_VIEW_TIME_SERIES = "timeSeries";

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.tabs = {
      country: country.type,
      region: region.type,
      asn: asn.type,
    };

    this.countryTab = T.translate("dashboard.countryTabTitle");
    this.regionTab = T.translate("dashboard.regionTabTitle");
    this.asnTab = T.translate("dashboard.asnTabTitle");
    this.apiQueryLimit = 170;

    const { urlFromDate, urlUntilDate } = getDateRangeFromUrl();

    const urlEntityType = props?.match?.params?.entityType;

    const entityType = this.tabs[urlEntityType] ? urlEntityType : country.type;

    this.state = {
      mounted: false,
      // Control Panel
      from: urlFromDate ?? getPreviousMinutesAsUTCSecondRange(24 * 60).start,
      until: urlUntilDate ?? getNowAsUTCSeconds(),
      // Tabs
      activeTabType: entityType,
      //Tab View Changer Button
      tabCurrentView:
        entityType === asn.type ? TAB_VIEW_TIME_SERIES : TAB_VIEW_MAP,
      // Search Bar
      suggestedSearchResults: null,
      searchTerm: null,
      // Map Data
      topoData: null,
      topoScores: null,
      // Summary Table
      summaryDataRaw: null,
      summaryDataProcessed: [],
      // Determine when data is available for table so multiple calls to populate the table aren't made
      genSummaryTableDataProcessed: false,
      totalOutages: 0,
      // Summary Table Pagination
      apiPageNumber: 0,
      // Event Data for Time Series
      eventDataRaw: [],
      eventDataProcessed: [],
      eventOrderByAttr: "score",
      eventOrderByOrder: "desc",
      eventEndpointCalled: false,
      totalEventCount: 0,
    };
  }

  componentDidMount() {
    // trigger api calls with valid date ranges
    const timeDiff = this.state.until - this.state.from;
    if (timeDiff <= 0) {
      this.setState({
        displayDashboardTimeRangeError: true,
      });
    } else if (timeDiff < dashboardTimeRangeLimit) {
      this.setState({ mounted: true }, () => {
        // Set initial tab to load
        this.handleSelectTab(this.tabs[this.state.activeTabType]);
        // Get topo and outage data to populate map and table
        if (this.state.activeTabType !== asn.type) {
          this.getDataTopo(this.state.activeTabType);
        }
        this.getDataOutageSummary(this.state.activeTabType);
        this.getTotalOutages(this.state.activeTabType);
      });
    }
  }

  componentWillUnmount() {
    this.setState({
      mounted: false,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    // A check to prevent repetitive selection of the same tab
    if (this.props.match.params.tab !== prevProps.match.params.tab) {
      this.handleSelectTab(this.tabs[prevProps.match.params.tab]);
    }

    // Update visualizations when tabs are changed
    if (
      this.state.activeTabType &&
      this.state.activeTabType !== prevState.activeTabType
    ) {
      // Get updated topo and outage data to populate map, no topo for asns
      this.state.activeTabType !== asn.type
        ? this.getDataTopo(this.state.activeTabType)
        : null;
      this.getDataOutageSummary(this.state.activeTabType);
      this.getTotalOutages(this.state.activeTabType);
    }

    // After API call for suggested search results completes, update suggestedSearchResults state with fresh data
    if (
      this.props.suggestedSearchResults !== prevProps.suggestedSearchResults
    ) {
      this.setState({
        suggestedSearchResults: this.props.suggestedSearchResults,
      });
    }

    // After API call for outage summary data completes, pass summary data to map function for data merging
    if (this.props.summary !== prevProps.summary) {
      this.setState({ summaryDataRaw: this.props.summary }, () => {
        this.getMapScores();
        this.convertValuesForSummaryTable();
        if (this.state.activeTabType === asn.type) {
          this.getDataEvents(this.state.activeTabType);
        }

        if (!this.state.eventEndpointCalled) {
          this.setState(
            { eventEndpointCalled: !this.state.eventEndpointCalled },
            () => {
              const totalEventCount = this.state.summaryDataRaw.reduce(
                (acc, item) => acc + item.event_cnt,
                0
              );
              //Get total event count to reference with event data
              this.setState({ totalEventCount });
            }
          );
        }
      });
    }

    // After API call for total outages summary data completes, pass total count to table to populate in UI
    if (this.props.totalOutages !== prevProps.totalOutages) {
      this.setState({
        totalOutages: this.props.totalOutages.length,
      });
    }

    // Make API call for data to populate time series stacked horizon view
    if (this.props.eventSignals !== prevProps.eventSignals) {
      let newEventData = this.props.eventSignals;
      this.setState(
        (prevState) => ({
          eventDataRaw: [...prevState.eventDataRaw, newEventData],
        }),
        () => {
          this.convertValuesForHtsViz();
        }
      );
    }
  }

  // Control Panel
  // manage the date selected in the input
  handleTimeFrame = ({ from, until }) => {
    if (this.state.from === from && this.state.until === until) {
      return;
    }
    const { history } = this.props;

    this.setState(
      {
        from,
        until,
        summaryDataRaw: null,
        topoData: null,
        summaryDataProcessed: [],
        tabCurrentView: "map",
        eventDataRaw: [],
        eventDataProcessed: [],
        displayDashboardTimeRangeError: false,
      },
      () => {
        // Get topo and outage data to repopulate map and table
        this.getDataTopo(this.state.activeTabType);
        this.getDataOutageSummary(this.state.activeTabType);
        this.getTotalOutages(this.state.activeTabType);
      }
    );
    history.push(`/dashboard?from=${from}&until=${until}`);
  };

  // Tabbing
  // Function to map active tab to state and manage url
  handleSelectTab = (selectedTab) => {
    const { history } = this.props;
    // use tab property to determine active tab by index
    let activeTabType, url;
    if (selectedTab === asn.type) {
      activeTabType = asn.type;
      url = asn.url;
    } else if (selectedTab === region.type) {
      activeTabType = region.type;
      url = region.url;
    } else if (selectedTab === country.type) {
      activeTabType = country.type;
      url = country.url;
    } else {
      return;
    }

    // set new tab
    this.setState({
      activeTabType: activeTabType,
      // Trigger Data Update for new tab
      tabCurrentView:
        activeTabType === asn.type ? TAB_VIEW_TIME_SERIES : TAB_VIEW_MAP,
      topoData: null,
      topoScores: null,
      summaryDataRaw: null,
      genSummaryTableDataProcessed: false,
      eventDataRaw: [],
      eventDataProcessed: null,
      eventEndpointCalled: false,
      totalEventCount: 0,
    });

    if (window.location.search) {
      history.push(`${url}/?from=${this.state.from}&until=${this.state.until}`);
    } else {
      history.push(url);
    }
  };

  handleTabChangeViewButton = () => {
    if (this.state.tabCurrentView === "map") {
      this.setState({ tabCurrentView: "timeSeries" }, () => {
        this.getDataEvents(this.state.activeTabType);
      });
    } else if (this.state.tabCurrentView === "timeSeries") {
      this.setState({ tabCurrentView: "map" });
    }
  };

  // Outage Data
  // Make API call to retrieve summary data to populate on map
  getDataOutageSummary = (entityType) => {
    if (!this.state.mounted) {
      return;
    } else if (this.state.until - this.state.from >= dashboardTimeRangeLimit) {
      return;
    }

    const includeMetadata = true;
    const entityCode = null;

    this.props.searchSummaryAction(
      this.state.from,
      this.state.until,
      entityType,
      entityCode,
      this.apiQueryLimit,
      this.state.apiPageNumber,
      includeMetadata
    );
  };

  getTotalOutages = (entityType) => {
    if (!this.state.mounted) {
      return;
    }

    this.props.totalOutagesAction(
      this.state.from,
      this.state.until,
      entityType
    );
  };

  // Map
  getMapScores = () => {
    if (this.state.topoData && this.state.summaryDataRaw) {
      let topoData = this.state.topoData;
      let scores = [];

      // get Topographic info for a country if it has outages
      this.state.summaryDataRaw.map((outage) => {
        let topoItemIndex;
        this.state.activeTabType === country.type
          ? (topoItemIndex = this.state.topoData.features.findIndex(
              (topoItem) => topoItem.properties.usercode === outage.entity.code
            ))
          : this.state.activeTabType === region.type
          ? (topoItemIndex = this.state.topoData.features.findIndex(
              (topoItem) => topoItem.properties.name === outage.entity.name
            ))
          : null;

        if (topoItemIndex > 0) {
          let item = topoData.features[topoItemIndex];
          item.properties.score = outage.scores.overall;
          topoData.features[topoItemIndex] = item;

          // Used to determine coloring on map objects
          scores.push(outage.scores.overall);
          scores.sort((a, b) => a - b);
        }
      });
      this.setState({ topoScores: scores });
    }
  };
  // Make API call to retrieve topographic data
  getDataTopo = (entityType) => {
    let topologyObjectName =
      entityType == "country"
        ? "ne_10m_admin_0.countries.v3.1.0"
        : "ne_10m_admin_1.regions.v3.0.0";
    if (this.state.mounted) {
      getTopoAction(entityType)
        .then((data) =>
          topojson.feature(
            data[entityType].topology,
            data[entityType].topology.objects[topologyObjectName]
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
  // function to manage when a user clicks a country in the map
  handleEntityShapeClick = (entity) => {
    const { history } = this.props;

    // Use usercode for country, id for other types
    const entityCode =
      this.state.activeTabType === country.type
        ? entity.properties.usercode
        : entity.properties.id;
    let path = `/${this.state.activeTabType}/${entityCode}`;

    if (window.location.search) {
      path = `${path}/?from=${this.state.from}&until=${this.state.until}`;
    }

    history.push(path);
  };

  // Event Time Series
  getDataEvents(entityType) {
    let until = this.state.until;
    let from = this.state.from;
    let attr = this.state.eventOrderByAttr;
    let order = this.state.eventOrderByOrder;
    let entities = this.state.summaryDataRaw
      .map((entity) => {
        // some entities don't return a code to be used in an api call, seem to default to '??' in that event
        if (entity.entity.code !== "??") {
          return entity.entity.code;
        }
      })
      .toString();
    this.props.getEventSignalsAction(
      entityType,
      entities,
      from,
      until,
      attr,
      order
    );
  }
  convertValuesForHtsViz() {
    let eventDataProcessed = [];
    // Create visualization-friendly data objects
    this.state.eventDataRaw.map((entity) => {
      let series;
      series = convertTsDataForHtsViz(entity);
      eventDataProcessed = eventDataProcessed.concat(series);
    });
    // Add data objects to state for each data source
    this.setState({
      eventDataProcessed: eventDataProcessed,
    });
  }

  // Search bar
  // get data for search results that populate in suggested search list
  getDataSuggestedSearchResults(searchTerm) {
    if (this.state.mounted) {
      // Set searchTerm to the value of nextProps, nextProps refers to the current search string value in the field.
      this.setState({ searchTerm: searchTerm });
      // Make api call
      this.props.searchEntitiesAction(searchTerm, 11);
    }
  }
  // Define what happens when user clicks suggested search result entry
  handleResultClick = (query) => {
    const { history } = this.props;
    let entity;
    typeof query === "object" && query !== null
      ? (entity = this.state.suggestedSearchResults.filter((result) => {
          return result.name === query.name;
        }))
      : (entity = this.state.suggestedSearchResults.filter((result) => {
          return result.name === query;
        }));
    entity = entity[0];
    history.push(`/${entity.type}/${entity.code}`);
  };

  // Reset search bar with search term value when a selection is made, no customizations needed here.
  handleQueryUpdate = (query) => {
    this.forceUpdate();
    this.setState({
      searchTerm: query,
    });
  };

  // Function that returns search bar passed into control panel
  populateSearchBar() {
    return (
      <Searchbar
        placeholder={T.translate("controlPanel.searchBarPlaceholder")}
        getData={this.getDataSuggestedSearchResults.bind(this)}
        itemPropertyName={"name"}
        handleResultClick={(event) => this.handleResultClick(event)}
        searchResults={this.state.suggestedSearchResults}
        handleQueryUpdate={this.handleQueryUpdate}
      />
    );
  }

  // Summary Table
  convertValuesForSummaryTable() {
    let summaryData = convertValuesForSummaryTable(this.state.summaryDataRaw);
    if (this.state.apiPageNumber === 0) {
      this.setState({
        summaryDataProcessed: summaryData,
        genSummaryTableDataProcessed: true,
      });
    }
    if (this.state.apiPageNumber > 0) {
      this.setState({
        summaryDataProcessed:
          this.state.summaryDataProcessed.concat(summaryData),
      });
    }
  }

  render() {
    const { activeTabType } = this.state;
    const title = T.translate("entity.pageTitle");
    return (
      <div className="w-full max-cont dashboard">
        <Helmet>
          <title>IODA | Dashboard for Monitoring Internet Outages</title>
          <meta
            name="description"
            content="Visualizations and Alerts Showing Country-, Region-, and ASN/ISP-level Internet Outages Detected by IODA"
          />
        </Helmet>
        <ControlPanel
          onTimeFrameChange={this.handleTimeFrame}
          searchbar={() => this.populateSearchBar()}
          from={this.state.from}
          until={this.state.until}
          title={title}
        />
        <div className="row tabs">
          <div className="col-1-of-1">
            <Radio.Group
              onChange={(e) => this.handleSelectTab(e?.target?.value)}
              value={activeTabType}
              style={{ marginBottom: 8 }}
            >
              <Radio.Button value={country.type}>
                {this.countryTab}
              </Radio.Button>
              <Radio.Button value={region.type}>{this.regionTab}</Radio.Button>
              <Radio.Button value={asn.type}>{this.asnTab}</Radio.Button>
            </Radio.Group>

            {activeTabType !== asn.type ? (
              (this.state.topoData && this.state.topoScores) ||
              this.state.until - this.state.from > dashboardTimeRangeLimit ? (
                <DashboardTab
                  type={this.state.activeTabType}
                  handleTabChangeViewButton={() =>
                    this.handleTabChangeViewButton()
                  }
                  tabCurrentView={this.state.tabCurrentView}
                  from={this.state.from}
                  until={this.state.until}
                  // display error text if from value is higher than until value
                  displayTimeRangeError={
                    this.state.displayDashboardTimeRangeError
                  }
                  // to populate summary table
                  summaryDataProcessed={this.state.summaryDataProcessed}
                  totalOutages={this.state.totalOutages}
                  activeTabType={this.state.activeTabType}
                  genSummaryTableDataProcessed={
                    this.state.genSummaryTableDataProcessed
                  }
                  // to populate horizon time series table
                  eventDataProcessed={this.state.eventDataProcessed}
                  // to populate map
                  topoData={this.state.topoData}
                  topoScores={this.state.topoScores}
                  handleEntityShapeClick={this.handleEntityShapeClick}
                  summaryDataRaw={this.state.summaryDataRaw}
                />
              ) : this.state.displayTimeRangeError ? (
                <Error />
              ) : (
                <Loading />
              )
            ) : this.state.eventDataProcessed ||
              this.state.until - this.state.from > dashboardTimeRangeLimit ? (
              <DashboardTab
                type={this.state.activeTabType}
                handleTabChangeViewButton={this.handleTabChangeViewButton}
                tabCurrentView={this.state.tabCurrentView}
                from={this.state.from}
                until={this.state.until}
                // display error text if from value is higher than until value
                displayTimeRangeError={
                  this.state.displayDashboardTimeRangeError
                }
                // to populate summary table
                summaryDataProcessed={this.state.summaryDataProcessed}
                totalOutages={this.state.totalOutages}
                activeTabType={this.state.activeTabType}
                genSummaryTableDataProcessed={
                  this.state.genSummaryTableDataProcessed
                }
                // to populate horizon time series table
                eventDataProcessed={this.state.eventDataProcessed}
              />
            ) : this.state.displayDashboardTimeRangeError ? (
              <Error />
            ) : (
              <Loading />
            )}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    suggestedSearchResults: state.iodaApi.entities,
    summary: state.iodaApi.summary,
    topoData: state.iodaApi.topo,
    totalOutages: state.iodaApi.summaryTotalCount,
    signals: state.iodaApi.signals,
    eventSignals: state.iodaApi.eventSignals,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    searchEntitiesAction: (searchQuery, limit = 15) => {
      searchEntities(dispatch, searchQuery, limit);
    },
    searchSummaryAction: (
      from,
      until,
      entityType,
      entityCode = null,
      limit,
      page,
      includeMetaData
    ) => {
      searchSummary(
        dispatch,
        from,
        until,
        entityType,
        entityCode,
        limit,
        page,
        includeMetaData
      );
    },
    totalOutagesAction: (from, until, entityType) => {
      totalOutages(dispatch, from, until, entityType);
    },
    getSignalsAction: (
      entityType,
      entityCode,
      from,
      until,
      datasource = null,
      maxPoints = null
    ) => {
      getSignalsAction(
        dispatch,
        entityType,
        entityCode,
        from,
        until,
        datasource,
        maxPoints
      );
    },
    getEventSignalsAction: (
      entityType,
      entityCode,
      from,
      until,
      datasource = null,
      maxPoints = null
    ) => {
      getEventSignalsAction(
        dispatch,
        entityType,
        entityCode,
        from,
        until,
        datasource,
        maxPoints
      );
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Dashboard));
