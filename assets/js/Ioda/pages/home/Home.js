/*
 * This software is Copyright (c) 2013 The Regents of the University of
 * California. All Rights Reserved. Permission to copy, modify, and distribute this
 * software and its documentation for academic research and education purposes,
 * without fee, and without a written agreement is hereby granted, provided that
 * the above copyright notice, this paragraph and the following three paragraphs
 * appear in all copies. Permission to make use of this software for other than
 * academic research and education purposes may be obtained by contacting:
 *
 * Office of Innovation and Commercialization
 * 9500 Gilman Drive, Mail Code 0910
 * University of California
 * La Jolla, CA 92093-0910
 * (858) 534-5815
 * invent@ucsd.edu
 *
 * This software program and documentation are copyrighted by The Regents of the
 * University of California. The software program and documentation are supplied
 * "as is", without any accompanying services from The Regents. The Regents does
 * not warrant that the operation of the program will be uninterrupted or
 * error-free. The end-user understands that the program was developed for research
 * purposes and is advised not to rely exclusively on the program for any reason.
 *
 * IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY FOR
 * DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST
 * PROFITS, ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH
 * DAMAGE. THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE PROVIDED HEREUNDER IS ON AN "AS
 * IS" BASIS, AND THE UNIVERSITY OF CALIFORNIA HAS NO OBLIGATIONS TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 */

// React Imports
import React, { Component } from "react";
import { useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { Helmet } from "react-helmet";
// Internationalization
import T from "i18n-react";
// Data Hooks
import { getTopoAction } from "../../data/ActionTopo";
import { searchSummary } from "../../data/ActionOutages";

// Components
import '@idotj/mastodon-embed-timeline/dist/mastodon-timeline.min.css';
import * as MastodonTimeline from "@idotj/mastodon-embed-timeline";
import TopoMap from "../../components/map/Map";
import * as topojson from "topojson";

import Loading from "../../components/loading/Loading";
import {
  MIN_IN_DAY,
  getPreviousMinutesAsUTCSecondRange,
} from "../../utils/timeUtils";
import { getSavedLanguagePreference } from "../../utils/storage";
import { Button } from "antd";
import { DesktopOutlined } from "@ant-design/icons";

// Partner Logos
import otfLogo from "images/logos/otf.png";
import dhsLogo from "images/logos/dhs.svg";
import comcastLogo from "images/logos/comcast.svg";
import nsfLogo from "images/logos/nsf.svg";
import isocLogo from "images/logos/isoc.svg";
import dosLogo from "images/logos/dos.png";
import PartnerCard from "./PartnerCard";
import EntitySearchTypeahead from "../../components/entitySearchTypeahead/EntitySearchTypeahead";
import { getDateRangeFromUrl } from "../../utils/urlUtils";
import BlueskyIodaFeed from "../../components/widget/BlueskyIodaFeed";


class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      searchTerm: null,
      lastFetched: 0,
      topoData: null,
      topoScores: null,
      outageSummaryData: null,
    };
  }

  componentDidMount() {
    this.setState({ mounted: true }, () => {
      // Get topo and outage data to populate map
      this.getDataTopo();
      this.getDataOutageSummary();
    });
  }

  componentWillUnmount() {
    this.setState({ mounted: false });
  }

  componentDidUpdate(prevProps) {
    // After API call for outage summary data completes, pass summary data to map function for data merging
    if (this.props.summary !== prevProps.summary) {
      this.setState(
        {
          outageSummaryData: this.props.summary,
        },
        this.getMapScores
      );
    }
  }

  // Define what happens when user clicks suggested search result entry
  handleResultClick = (entity) => {
    if (!entity) return;
    const { navigate } = this.props;
    navigate(`/${entity.type}/${entity.code}`);
  };

  // Map: Make API call to retrieve summary data to populate on map
  getDataOutageSummary = () => {
    if (!this.state.mounted) {
      return;
    }

    const { start, end } = getPreviousMinutesAsUTCSecondRange(MIN_IN_DAY);
    const entityType = "country";
    this.props.searchSummaryAction(start, end, entityType);
  };

  // Make API call to retrieve topographic data
  getDataTopo = () => {
    if (!this.state.mounted) {
      return;
    }

    const entityType = "country";
    getTopoAction(entityType)
      .then((data) =>
        topojson.feature(
          data[entityType].topology,
          data[entityType].topology.objects["ne_10m_admin_0.countries"]
        )
      )
      .then((data) => this.setState({ topoData: data }, this.getMapScores));
  };

  // Compile Scores to be used within the map
  getMapScores = () => {
    if (this.state.topoData && this.state.outageSummaryData) {
      let topoData = this.state.topoData;
      let scores = [];

      // get Topographic info for a country if it has outages
      this.state.outageSummaryData.map((outage) => {
        let topoItemIndex = this.state.topoData.features.findIndex(
          (topoItem) => topoItem.properties.usercode === outage.entity.code
        );

        if (topoItemIndex > 0) {
          let item = topoData.features[topoItemIndex];
          item.properties.score = outage.scores.overall;
          topoData.features[topoItemIndex] = item;

          // Used to determine coloring on map objects
          scores.push(outage.scores.overall);
          scores.sort((a, b) => {
            return a - b;
          });
        }
      });
      this.setState({ topoScores: scores });
    }
  };

  // function to manage when a user clicks a country in the map
  handleEntityShapeClick = (entity) => {
    const { navigate } = this.props;
    const { urlFromDate, urlUntilDate } = getDateRangeFromUrl();
    navigate(
      urlFromDate && urlUntilDate
        ? `/country/${entity.properties.usercode}?from=${urlFromDate}&until=${urlUntilDate}`
        : `/country/${entity.properties.usercode}`
    );
  };

  render() {
    const searchBarTitle = T.translate("home.searchBarTitle");
    const searchBarPlaceholder = T.translate("home.searchBarPlaceholder");
    const searchBarDashboardText = T.translate("home.searchBarDashboardText");
    const searchBarDashboardLink = T.translate("home.searchBarDashboardLink");
    const recentOutages = T.translate("home.recentOutages");
    const twitterWidgetTitle = T.translate("home.twitterWidgetTitle");
    const aboutButtonText = T.translate("home.aboutButtonText");
    const partnersSectionTitle = T.translate("home.partnersSectionTitle");
    const recentOutageTimeFrame = T.translate("home.mapTimeFrame");

    return (
      <div className="home">
        <Helmet>
          <title>
            IODA | Monitor Macroscopic Internet Outages in Near Real-Time
          </title>
          <meta
            name="description"
            content="IODA monitors the Internet in near real-time to identify macroscopic Internet outages affecting the edge of the network on a country, regional, or ASN/ISP level"
          />
        </Helmet>

        {/* Searchbar section */}
        <div className="max-cont text-center home__search">
          <div className="text-5xl font-semibold home__search-title">
            {searchBarTitle}
          </div>
          <div className="px-12">
            <EntitySearchTypeahead
              className="my-8"
              placeholder={searchBarPlaceholder}
              onSelect={(entity) => this.handleResultClick(entity)}
              size={"large"}
            />
            <Button
              size="large"
              type="primary"
              href="/dashboard"
              className="mx-auto w-min"
            >
              {searchBarDashboardText} {searchBarDashboardLink}
            </Button>
          </div>
        </div>

        {/* Map / Twitter Feed Side-by-side */}
        <div className="max-cont row items-stretch home__recent-outages">
          <div className="flex-column home__recent-outages__map-outer">
            <div className="text-5xl font-semibold mb-6">
              {recentOutages} ({recentOutageTimeFrame})
            </div>
            {!(this.state.topoData && this.state.outageSummaryData) && (
              <Loading />
            )}
            {this.state.topoData && (
              <div className="map__content">
                <TopoMap
                  topoData={this.state.topoData}
                  scores={this.state.topoScores ?? null}
                  handleEntityShapeClick={this.handleEntityShapeClick}
                  entityType="country"
                />
              </div>
            )}
          </div>
          <div className="home__recent-outages__twitter-outer">
            <div className="text-5xl font-semibold mb-6">
              {twitterWidgetTitle}
            </div>
            <div className="card twitter-embed">
              {/*<TwitterTimelineEmbed*/}
              {/*  sourceType="profile"*/}
              {/*  screenName="IODA_live"*/}
              {/*  options={{ id: "profile:IODA_live", height: "500" }}*/}
              {/*  lang={getSavedLanguagePreference()}*/}
              {/*  noBorders={true}*/}
              {/*/>*/}
              {/*<div id="mt-container" className="mt-container mt-container-seamless">*/}
              {/*<div className="mt-body" role="feed">*/}
              {/*  <div className="mt-loading-spinner"></div>*/}
              {/*</div>*/}
              {/*</div>*/}
                <BlueskyIodaFeed did='did:plc:3xessr3vu336mxean6zvfyjq' />

            </div>
          </div>
        </div>

        {/* About */}
        <div className="max-cont">
          <div className="home__about">
            <div className="home__about-cont">
              <T.p className="about__text text-3xl mb-12" text="home.about" />
              <Button
                icon={<DesktopOutlined />}
                size="large"
                href="/dashboard"
                className="mx-auto w-min"
              >
                {aboutButtonText}
              </Button>
            </div>
          </div>
        </div>

        {/* Methodology */}
        <div className="max-cont mt-10">
          <div className="home__methodology">
            <div className="text-5xl font-semibold mb-6">Methodology</div>
            <div className="text-2xl mb-8">
              IODA combines information from three data sources, establishes the
              relevance of an event and generates alerts. The outage events and
              the corresponding signals obtained through automated analysis are
              displayed on dashboards and interactive graphs that allow the user
              to further inspect the data. See the{" "}
              <a
                className="a-fake text-color-link"
                href="http://www.caida.org/projects/ioda/"
              >
                IODA project page
              </a>{" "}
              for scientific references and for more information about our
              methodology.
            </div>
            <div className="home__methodology__options">
              <div className="home__methodology__options__card">
                <div className="text-3xl font-medium mb-6">
                  Global Internet routing (BGP)
                </div>
                <div className="text-2xl">
                  We use data from ~500 monitors participating in the RouteViews
                  and RIPE RIS projects to establish which network blocks are
                  reachable based on the Internet control plane.
                </div>
              </div>
              <div className="home__methodology__options__card">
                <div className="text-3xl font-medium mb-6">
                  Internet Background Radiation
                </div>
                <div className="text-2xl">
                  We process unsolicited traffic reaching the Merit Network
                  Telescope monitoring a large unutilized IPv4 address block.
                </div>
              </div>
              <div className="home__methodology__options__card">
                <div className="text-3xl font-medium mb-6">Active Probing</div>
                <div className="text-2xl">
                  We continuously probe a large fraction of the (routable) IPv4
                  address space from Georgia Tech servers and use a{" "}
                  <a
                    className="a-fake text-color-link"
                    href="https://www.isi.edu/~johnh/PAPERS/Quan13c.html"
                  >
                    methodology developed by University of Southern California
                  </a>{" "}
                  to infer when a /24 block is affected by a network outage.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partners */}
        <div className="max-cont p-12 mt-10 mb-24">
          <div className="text-5xl font-semibold mb-6">
            {partnersSectionTitle}
          </div>
          <div className="partners-grid">
            <PartnerCard
              logo={nsfLogo}
              logoHref="https://www.caida.org/funding/ioda/"
            >
              {T.translate("home.nsf")}
            </PartnerCard>

            <PartnerCard logo={dhsLogo} logoHref="http://www.dhs.gov/">
              {T.translate("home.dhs")}
            </PartnerCard>

            <PartnerCard
              logo={otfLogo}
              logoHref="https://www.opentech.fund/results/supported-projects/internet-outage-detection-and-analysis/"
            >
              {T.translate("home.otf")}
            </PartnerCard>

            <PartnerCard
              logo={comcastLogo}
              logoHref="https://innovationfund.comcast.com/"
            >
              {T.translate("home.comcast")}
            </PartnerCard>

            <PartnerCard
              logo={isocLogo}
              logoHref="https://insights.internetsociety.org/"
            >
              {T.translate("home.isoc")}
            </PartnerCard>

            <PartnerCard logo={dosLogo} logoHref="https://www.state.gov">
              <T.span text={"home.dos1"} />
              <a
                className="a-fake text-color-link"
                href="https://www.state.gov/bureaus-offices/under-secretary-for-political-affairs/bureau-of-near-eastern-affairs/"
              >
                <T.span text={"home.dos2"} />
              </a>
              <T.span text={"home.dos3"} />
              <a
                className="a-fake text-color-link"
                href="https://www.state.gov/bureaus-offices/under-secretary-for-civilian-security-democracy-and-human-rights/bureau-of-democracy-human-rights-and-labor/"
              >
                <T.span text={"home.dos4"} />
              </a>
              <T.span text={"home.dos5"} />
            </PartnerCard>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    summary: state.iodaApi.summary,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    searchSummaryAction: (
      from,
      until,
      entityType,
      entityCode = null,
      limit = null,
      page = null
    ) => {
      searchSummary(dispatch, from, until, entityType, entityCode, limit, page);
    },
  };
};

// TODO: Migrate file fully to functional component
const HomeFn = (props) => {
  const navigate = useNavigate();

  return <Home {...props} navigate={navigate} />;
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeFn);
