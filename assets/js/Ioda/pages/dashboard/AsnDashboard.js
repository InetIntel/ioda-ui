// React Imports
import React, { useEffect, useState, useMemo } from "react";
// Internationalization
import T from "i18n-react";
// Data Hooks
import { getTopoAction } from "../../data/ActionTopo";
import { searchSummary, totalOutages } from "../../data/ActionOutages";
import {
    getSignalsAction,
    getEventSignalsAction,
} from "../../data/ActionSignals";
// Components
import ControlPanel from "../../components/controlPanel/ControlPanel";
import EntitySearchTypeahead from "../../components/entitySearchTypeahead/EntitySearchTypeahead";
import DashboardTab from "./DashboardTab";
import * as topojson from "topojson";
// Constants
import { country, region, asn } from "./DashboardConstants";
import { connect } from "react-redux";
// Helper Functions
import {
    convertValuesForSummaryTable,
    convertTsDataForHtsViz,
    dashboardTimeRangeLimit,
} from "../../utils";
import Loading from "../../components/loading/Loading";
import Error from "../../components/error/Error";
import { Helmet } from "react-helmet";
import {
    getNowAsUTCSeconds,
    getPreviousMinutesAsUTCSecondRange,
} from "../../utils/timeUtils";
import { getDateRangeFromUrl, hasDateRangeInUrl } from "../../utils/urlUtils";
import { Radio } from "antd";
import { useParams, useNavigate } from "react-router-dom";

const TAB_VIEW_MAP = "map";
const TAB_VIEW_TIME_SERIES = "timeSeries";

const Dashboard = (props) => {
    const {
        summary,
        eventSignals,
        navigate,
        searchSummaryAction,
        totalOutagesAction,
        entityType,
    } = props;

    const title = useMemo(() => T.translate("entity.pageTitle"), []);

    const tabs = useMemo(() => ({
        country: country.type,
        region: region.type,
        asn: asn.type,
    }), []);

    const countryTab = useMemo(() => T.translate("dashboard.countryTabTitle"), []);
    const regionTab = useMemo(() => T.translate("dashboard.regionTabTitle"), []);
    const asnTab = useMemo(() => T.translate("dashboard.asnTabTitle"), []);
    const apiQueryLimit = 170;

    const { urlFromDate, urlUntilDate } = useMemo(() => getDateRangeFromUrl(), []);

    // const entityType = "asn";
    // Control Panel
    const [from, setFrom] = useState(urlFromDate ?? getPreviousMinutesAsUTCSecondRange(24 * 60).start);
    const [until, setUntil] = useState(urlUntilDate ?? getNowAsUTCSeconds());
    // Tabs
    const [activeTabType, setActiveTabType] = useState(entityType);
    //Tab View Changer Button
    const [tabCurrentView, setTabCurrentView] =
        useState(entityType === asn.type ? TAB_VIEW_TIME_SERIES : TAB_VIEW_MAP);
    // Map Data
    const [topoData, setTopoData] = useState(null);
    const [topoScores, setTopoScores] = useState(null);
    // Summary Table
    const [summaryDataRaw, setSummaryDataRaw] = useState(null);
    const [summaryDataProcessed, setSummaryDataProcessed] = useState([]);
    // Determine when data is available for table so multiple calls to populate the table aren't made
    const [genSummaryTableDataProcessed, setGenSummaryTableDataProcessed] = useState(false);
    const [totalOutagesCount, setTotalOutagesCount] = useState(0);

    // Summary Table Pagination
    const [apiPageNumber, setApiPageNumber] = useState(0);
    // Event Data for Time Series
    const [eventDataRaw, setEventDataRaw] = useState([]);
    const [eventDataProcessed, setEventDataProcessed] = useState([]);
    const [eventOrderByAttr, setEventOrderByAttr] = useState("score");
    const [eventOrderByOrder, setEventOrderByOrder] = useState("desc");
    const [eventEndpointCalled, setEventEndpointCalled] = useState(false);

    const [displayDashboardTimeRangeError, setDisplayDashboardTimeRangeError] = useState(false);


    useEffect(() => {
        const timeDiff = until - from;
        if (timeDiff <= 0) {
            setDisplayDashboardTimeRangeError(true);
        }
    }, []);

    useEffect(() => {
        if(activeTabType) {
            if (activeTabType !== asn.type) {
                getDataTopo(activeTabType);
            }
            getDataOutageSummary(activeTabType);
            getTotalOutages(activeTabType);
        }
    }, [activeTabType]);

    useEffect(() => {
        if(summary){
            setSummaryDataRaw(summary);
        }
    }, [summary]);

    useEffect(() => {
        if(!summaryDataRaw) return;
        getMapScores();
        _convertValuesForSummaryTable();
        if (activeTabType === asn.type) {
            getDataEvents(activeTabType);
        }
        if (!eventEndpointCalled) {
            setEventEndpointCalled(true);
        }
    }, [summaryDataRaw, activeTabType, eventEndpointCalled]);

    useEffect(() => {
        if (props.totalOutages) {
            setTotalOutagesCount(props.totalOutages.length);
        }
    }, [props.totalOutages]);

    useEffect(() => {
        if (eventSignals) {
            setEventDataRaw((prevEventDataRaw) => [...prevEventDataRaw, eventSignals]);
        }
    }, [eventSignals]);

    useEffect(() => {
        if(eventDataRaw) {
            convertValuesForHtsViz();
        }
    }, [eventDataRaw]);

    // Control Panel
    // manage the date selected in the input
    function handleTimeFrame({_from, _until}) {
        if (from === _from && until === _until) {
            return;
        }

        setFrom(_from);
        setUntil(_until);
        setSummaryDataRaw(null);
        setTopoData(null);
        setSummaryDataProcessed([]);
        setTabCurrentView("map");
        setEventDataRaw([]);
        setEventDataProcessed([]);
        setDisplayDashboardTimeRangeError(false);
        // Get topo and outage data to repopulate map and table
        getDataTopo(activeTabType);
        getDataOutageSummary(activeTabType);
        getTotalOutages(activeTabType);
        navigate(`/dashboard?from=${_from}&until=${_until}`);
    }

    // Tabbing
    // Function to map active tab to state and manage url
    function handleSelectTab(selectedTab) {
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
        setActiveTabType(activeTabType);
        // Trigger Data Update for new tab
        setTabCurrentView(activeTabType === asn.type ? TAB_VIEW_TIME_SERIES : TAB_VIEW_MAP)
        setTopoData(null)
        setTopoScores(null)
        setSummaryDataRaw(null)
        setGenSummaryTableDataProcessed(false)
        setEventDataRaw([])
        setEventDataProcessed(null)
        setEventEndpointCalled(false)

        if (hasDateRangeInUrl()) {
            navigate(`${url}/?from=${from}&until=${until}`);
        } else {
            navigate(url);
        }
    }

    function handleTabChangeViewButton() {
        if (tabCurrentView === "map") {
            setTabCurrentView("timeSeries");
            getDataEvents(activeTabType);
        } else if (tabCurrentView === "timeSeries") {
            setTabCurrentView("map");
        }
    }

    // Outage Data
    // Make API call to retrieve summary data to populate on map
    function getDataOutageSummary(entityType) {
        if (until - from >= dashboardTimeRangeLimit) {
            return;
        }

        const includeMetadata = true;
        const entityCode = null;

        searchSummaryAction(
            from,
            until,
            entityType,
            entityCode,
            apiQueryLimit,
            apiPageNumber,
            includeMetadata
        );
    }

    function getTotalOutages(entityType) {
        totalOutagesAction(
            from,
            until,
            entityType
        );
    }

    // Map
    function getMapScores() {
        if (topoData && summaryDataRaw) {
            let _topoData = topoData;
            let scores = [];

            // get Topographic info for a country if it has outages
            summaryDataRaw.map((outage) => {
                let topoItemIndex;
                activeTabType === country.type
                    ? (topoItemIndex = topoData.features.findIndex(
                        (topoItem) => topoItem.properties.usercode === outage.entity.code
                    ))
                    : activeTabType === region.type
                        ? (topoItemIndex = topoData.features.findIndex(
                            (topoItem) => topoItem.properties.name === outage.entity.name
                        ))
                        : null;

                if (topoItemIndex > 0) {
                    let item = _topoData.features[topoItemIndex];
                    item.properties.score = outage.scores.overall;
                    _topoData.features[topoItemIndex] = item;

                    // Used to determine coloring on map objects
                    scores.push(outage.scores.overall);
                    scores.sort((a, b) => a - b);
                }
            });
            setTopoScores(scores);
        }
    }
    // Make API call to retrieve topographic data
    function getDataTopo(entityType) {
        let topologyObjectName =
            entityType === "country"
                ? "ne_10m_admin_0.countries"
                : "ne_10m_admin_1.regions";
        getTopoAction(entityType)
            .then((data) =>
                topojson.feature(
                    data[entityType].topology,
                    data[entityType].topology.objects[topologyObjectName]
                )
            )
            .then((data) => {
                setTopoData(data)
            })
    }

    // function to manage when a user clicks a country in the map
    function handleEntityShapeClick(entity) {
        // Use usercode for country, id for other types
        const entityCode =
            activeTabType === country.type
                ? entity.properties.usercode
                : entity.properties.id;
        let path = `/${activeTabType}/${entityCode}`;

        if (hasDateRangeInUrl()) {
            path = `${path}/?from=${from}&until=${until}`;
        }

        navigate(path);
    }

    // Event Time Series
    function getDataEvents(entityType) {
        let attr = eventOrderByAttr;
        let order = eventOrderByOrder;
        let entities = summaryDataRaw
            .map((entity) => {
                // some entities don't return a code to be used in an api call, seem to default to '??' in that event
                if (entity.entity.code !== "??") {
                    return entity.entity.code;
                }
            })
            .toString();
        props.getEventSignalsAction(
            entityType,
            entities,
            from,
            until,
            attr,
            order
        );
    }

    function convertValuesForHtsViz() {
        let eventDataProcessed = [];
        // Create visualization-friendly data objects
        eventDataRaw.map((entity) => {
            let series;
            series = convertTsDataForHtsViz(entity);
            eventDataProcessed = eventDataProcessed.concat(series);
        });
        // Add data objects to state for each data source
        setEventDataProcessed(eventDataProcessed);
    }

    // Define what happens when user clicks suggested search result entry
    function handleResultClick (entity) {
        if (!entity) return;
        if (!entity.url) return;
        console.log(entity)
        // navigate(`/${entity.type}/${entity.code}`);
        navigate(`/${entity.url}`)
    }

    // Function that returns search bar passed into control panel
    function populateSearchBar () {
        return (
            <EntitySearchTypeahead
                placeholder={T.translate("controlPanel.searchBarPlaceholder")}
                onSelect={(entity) => handleResultClick(entity)}
            />
        );
    }

    // Summary Table
    function _convertValuesForSummaryTable() {
        if(!summaryDataRaw) return;
        let summaryData = convertValuesForSummaryTable(summaryDataRaw);
        if (apiPageNumber === 0) {
            setSummaryDataProcessed(summaryData);
            setGenSummaryTableDataProcessed(true);
        }
        if (apiPageNumber > 0) {
            setSummaryDataProcessed(summaryDataProcessed.concat(summaryData));
        }
    }

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
                onTimeFrameChange={handleTimeFrame}
                searchbar={populateSearchBar}
                from={from}
                until={until}
                title={title}
                entityType="asn"
                onSelect={(entity) => handleResultClick(entity)}
            />
            <div className="w-full mb-6">
                <Radio.Group
                    onChange={(e) => handleSelectTab(e?.target?.value)}
                    value={activeTabType}
                    className="mb-8"
                >
                    <Radio.Button value={country.type}>{countryTab}</Radio.Button>
                    <Radio.Button value={region.type}>{regionTab}</Radio.Button>
                    <Radio.Button value={asn.type}>{asnTab}</Radio.Button>
                </Radio.Group>

                {activeTabType !== asn.type ? (
                    (topoData && topoScores) ||
                    until - from > dashboardTimeRangeLimit ? (
                        <DashboardTab
                            type={activeTabType}
                            handleTabChangeViewButton={handleTabChangeViewButton}
                            tabCurrentView={tabCurrentView}
                            from={from}
                            until={until}
                            // display error text if from value is higher than until value
                            displayTimeRangeError={displayDashboardTimeRangeError}
                            // to populate summary table
                            summaryDataProcessed={summaryDataProcessed}
                            totalOutages={totalOutagesCount}
                            activeTabType={activeTabType}
                            genSummaryTableDataProcessed={genSummaryTableDataProcessed}
                            // to populate horizon time series table
                            eventDataProcessed={eventDataProcessed}
                            // to populate map
                            topoData={topoData}
                            topoScores={topoScores}
                            handleEntityShapeClick={handleEntityShapeClick}
                            summaryDataRaw={summaryDataRaw}
                        />
                    ) : displayDashboardTimeRangeError ? (
                        <Error />
                    ) : (
                        <Loading />
                    )
                ) : eventDataProcessed ||
                until - from > dashboardTimeRangeLimit ? (
                    <DashboardTab
                        type={activeTabType}
                        handleTabChangeViewButton={handleTabChangeViewButton}
                        tabCurrentView={tabCurrentView}
                        from={from}
                        until={until}
                        // display error text if from value is higher than until value
                        displayTimeRangeError={displayDashboardTimeRangeError}
                        // to populate summary table
                        summaryDataProcessed={summaryDataProcessed}
                        totalOutages={totalOutagesCount}
                        activeTabType={activeTabType}
                        genSummaryTableDataProcessed={genSummaryTableDataProcessed}
                        // to populate horizon time series table
                        eventDataProcessed={eventDataProcessed}
                    />
                ) : displayDashboardTimeRangeError ? (
                    <Error />
                ) : (
                    <Loading />
                )}
            </div>
        </div>
    );
}

// TODO: Migrate file fully to functional component
const DashboardFn = (props) => {
    const { entityType, tab } = useParams();
    const navigate = useNavigate();

    return (
        <Dashboard
            {...props}
            tab={tab}
            entityType="asn"
            navigate={navigate}
        />
    );
};

const mapStateToProps = (state) => {
    return {
        summary: state.iodaApi.summary,
        topoData: state.iodaApi.topo,
        totalOutages: state.iodaApi.summaryTotalCount,
        signals: state.iodaApi.signals,
        eventSignals: state.iodaApi.eventSignals,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
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

export default connect(mapStateToProps, mapDispatchToProps)(DashboardFn);
