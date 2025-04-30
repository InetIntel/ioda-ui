/*
 * This source code is Copyright (c) 2021 Georgia Tech Research
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
import React, { Fragment } from "react";
import { Typography, Row, Col, Card } from "antd";
const { Text } = Typography;

const text_resources = [
  {
    title: "Data Sources",
    content: (
      <>
        <h4 id="bgp" style={{ scrollMarginTop: "80px" }}>
          BGP:
        </h4>{" "}
        <ul>
          <li>
            Data is obtained by processing <em>all updates</em> from{" "}
            <em>all Route Views</em> and RIPE RIS collectors.
          </li>
          <li>
            Every 5 minutes, we calculate the number of full-feed peers that
            observe each prefix. A peer is <em>full-feed</em> if it has more
            than 400k IPv4 prefixes, and/or more than 10k IPv6 prefixes (i.e.,
            suggesting that it shares its entire routing table).
          </li>
          <li>
            A prefix is <em>visible</em> if more than 50% of the full-feed peers
            observe it. We aggregate prefix visibility statistics by country,
            region, and ASN.
          </li>
        </ul>
        <h4 id="active-probing" style={{ scrollMarginTop: "80px" }}>
          Active Probing:
        </h4>{" "}
        <ul>
          <li>
            We use a custom implementation of the{" "}
            <a href="https://www.isi.edu/~johnh/PAPERS/Quan13c.html">
              Trinocular
            </a>{" "}
            technique.
          </li>
          <li>
            We probe ~4.2M /24 blocks at least once every 10 minutes (as opposed
            to 11 minutes used in the Trinocular paper).
          </li>
          <li>
            Currently, the alerts IODA shows use data from a team of 20 probers
            located at Georgia Tech.
          </li>
          <li>
            The Trinocular measurement and inference technique labels a /24
            block as <em>up</em>, <em>down</em>, or <em>unknown</em>. In
            addition, we then aggregate <em>up</em> /24s into country, region,
            and ASN statistics.
          </li>
        </ul>
        <h4 id="network-telescope" style={{ scrollMarginTop: "80px" }}>
          Network Telescope:
        </h4>{" "}
        <ul>
          <li>
            We analyze traffic data from the{" "}
            <a href="https://www.merit.edu/a-data-repository-for-cyber-security-research-and-education/">
              Merit
            </a>{" "}
            Network Telescopes.
          </li>
          <li>
            We apply{" "}
            <a href="http://www.caida.org/publications/papers/2014/passive_ip_space_usage_estimation/">
              anti-spoofing heuristics and noise reduction filters
            </a>{" "}
            to the raw traffic.
          </li>
          <li>
            For each packet that passes the filters, we perform geolocation and
            ASN lookups on the source IP address, and then compute the{" "}
            <em>number of unique source IPs per minute</em>, aggregated by
            country, region, and ASN.
          </li>
        </ul>
        <h4 id="google-signals" style={{ scrollMarginTop: "80px" }}>
          Google Product Signals:
        </h4>{" "}
        <ul>
          <li>
            Google product signals are sourced from the{" "}
            <a href="https://transparencyreport.google.com/">
              Google Transparency Report
            </a>
            . Each product signal represents normalized values of the number of
            visits to that Google product and is approximately geolocated to the
            country where the visit originated.
          </li>
          <li>Current GTR data is only available at the country level.</li>
          <li>
            IODA connects to the Google Transparency Report data through the{" "}
            <a href="https://github.com/Jigsaw-Code/net-analysis">
              GTR API maintained by Jigsaw
            </a>
            .
          </li>
          <li>
            Google provides GTR data at the resolution of 1 data point per 30
            minutes. IODA fetches the data every 15 minutes. You will notice a
            lag of 60-90 minutes in the time series.
          </li>
        </ul>
      </>
    ),
    tab: "glossary",
  },
  {
    title: "Outage Detection",
    content: (
      <>
        <ul>
          <li>
            For each data source (BGP, Active Probing, and Telescope), we
            currently monitor for three types of outages: country-level,
            region-level and AS-level.
          </li>
          <li>
            Detection is performed by comparing the <em>current</em> value for
            each datasource/aggregation (e.g., the number of /24 networks
            visible on <em>BGP</em> and geolocated to <em>Italy</em>) to an{" "}
            <em>historical</em> value that is computed by finding the{" "}
            <em>median</em> of a sliding window of recent values (the length of
            the window varies between data sources and is listed below).
          </li>
          <li>
            If the <em>current</em> value is lower than a given fraction of the
            <em>history</em> value, an alert is generated. Each data source is
            configured with two <em>history-fraction</em> thresholds; one that
            triggers a <em>warning</em> alert, and one that triggers a{" "}
            <em>critical</em> alert. The warning and critical thresholds for
            each data source are listed below. These values are experimental and
            are based on empirical observations of the signal to noise ratio for
            each data source.
          </li>
        </ul>

        <h4 className="text-2xl font-semibold mb-6">Detection Criteria</h4>
        <h5>BGP</h5>
        <ul className="mb-6">
          <li>
            <b>Metric:</b> # /24 blocks (visible by &gt; 50% of peers)
          </li>
          <li>
            <b>History Sliding Window Length:</b> 24 hours
          </li>
          <li>
            <b>Thresholds:</b>
            <ul>
              <li>
                <b>Warning:</b> 99%
              </li>
              <li>
                <b>Critical:</b> 50%
              </li>
            </ul>
          </li>
        </ul>

        <h5>Active Probing</h5>
        <ul className="mb-6">
          <li>
            <b>Metric:</b> # /24 blocks up
          </li>
          <li>
            <b>History Sliding Window Length:</b> 7 days
          </li>
          <li>
            <b>Thresholds:</b>
            <ul>
              <li>
                <b>Warning:</b> 80%
              </li>
              <li>
                <b>Critical:</b> 50%
              </li>
            </ul>
          </li>
        </ul>

        <h5>Telescope</h5>
        <ul className="mb-6">
          <li>
            <b>Metric:</b> # unique source IP addresses
          </li>
          <li>
            <b>History Sliding Window Length:</b> 7 days
          </li>
          <li>
            <b>Thresholds:</b>
            <ul>
              <li>
                <b>Warning:</b> 25%
              </li>
              <li>
                <b>Critical:</b> 10%
              </li>
            </ul>
          </li>
        </ul>

        <h4>Outage Severity Scores</h4>

        <h5>Alert Area</h5>
        <p>
          To quantify the <strong>severity</strong> of an outage, we use a
          concept we call <em>Alert Area</em>, which takes into account both the
          magnitude of the outage and the duration of the outage. The alert area
          is computed by multiplying the relative drop (i.e.,{" "}
          <code>((history - current) / history) * 100</code>) by the length of
          the outage (in minutes). All alert tables in IODA show Alert Area
          values as per-datasource outage severity scores.
        </p>

        <h5>Overall Score</h5>
        <p>
          While we perform outage detection on a per-datasource basis, we use
          multiple datasources to gain confidence about an outage. To do this,
          we compute an <em>Overall Score</em> by <em>multiplying</em> the{" "}
          <em>Alert Area</em> scores for each data source that triggered an
          alert. We multiply Alert Area scores together (rather than summing
          them) to give weight to outages that have been detected through
          multiple datasources.
        </p>

        <p>
          <strong>Caveat:</strong> While the "Overall Score" values given in the
          alert tables reflect a multiplication of the total alert area for each
          data source, the "Overall Score" value shown in the "Outage Severity
          Levels" visualizations is instead the sum of the overall score values
          for each minute in the time window. That is, an overall score is
          computed for each minute by multiplying together the alert areas for
          that minute, and then these per-minute overall scores are summed to
          give the total shown when hovering over a country or region.
        </p>
      </>
    ),
    tab: "glossary",
  },
  {
    title: "Repositories",
    content: (
      <>
        <p>
          IODA is entirely based on open-source software. The following is the
          list of repositories of the various software components and libraries
          used by IODA:
        </p>
        <h4>Software Repositories</h4>
        <ul>
          <li>
            <b>IODA UI: </b>
            <a href="https://github.com/InetIntel/ioda-ui">
              https://github.com/InetIntel/ioda-ui
            </a>
          </li>
          <li>
            <b>IODA API: </b>
            <a href="https://github.com/InetIntel/ioda-api">
              https://github.com/InetIntel/ioda-api
            </a>
          </li>
          <li>
            <b>BGPStream: </b>
            <a href="https://bgpstream.caida.org">
              https://bgpstream.caida.org
            </a>
          </li>
          <li>
            <b>BGPView: </b>
            <a href="https://bgpstream.caida.org">
              https://github.com/InetIntel/bgpview
            </a>
            <ul>
              <li>
                Library for efficient (re-)construction, transport and analysis
                of BGP routing tables
              </li>
            </ul>
          </li>
          <li>
            <b>Libipmeta: </b>
            <a href="https://github.com/InetIntel/libipmeta">
              https://github.com/InetIntel/libipmeta
            </a>
            <ul>
              <li>IP metadata querying library</li>
            </ul>
          </li>
          <li>
            <b>Trinarkular: </b>
            <a href="https://github.com/CAIDA/trinarkular">
              https://github.com/CAIDA/trinarkular
            </a>
            <ul>
              <li>
                IODA's interpretation and implementation of the Trinocular
                methodology described at{" "}
                <a href="https://dl.acm.org/doi/10.1145/2534169.2486017">
                  https://dl.acm.org/doi/10.1145/2534169.2486017
                </a>
              </li>
            </ul>
          </li>
          <li>
            <b>Corsaro3: </b>
            <a href="https://github.com/InetIntel/corsaro3">
              https://github.com/InetIntel/corsaro3
            </a>{" "}
            <ul>
              <li>Used to generate the telescope signals</li>
            </ul>
          </li>
          <li>
            <b>Watchtower Sentry: </b>
            <a href="https://github.com/InetIntel/watchtower-sentry">
              https://github.com/InetIntel/watchtower-sentry
            </a>{" "}
            <ul>
              <li>
                Anomaly detection for real time and historical time series data
              </li>
            </ul>
          </li>
          <li>
            <b>Watchtower Alert: </b>
            <a href="https://github.com/InetIntel/watchtower-alert">
              https://github.com/InetIntel/watchtower-alert
            </a>{" "}
            <ul>
              <li>Alerting component of the watchtower framework</li>
            </ul>
          </li>
          <li>
            <b>Chocolatine: </b>
            <a href="https://github.com/InetIntel/chocolatine">
              {" "}
              https://github.com/InetIntel/chocolatine
            </a>{" "}
            <ul>
              <li>S-ARIMA based anomaly detection</li>
            </ul>
          </li>
          <li>
            <b>IODA GTR: </b>
            <a href="https://github.com/InetIntel/ioda-gtr">
              https://github.com/InetIntel/ioda-gtr
            </a>
            <ul>
              <li>
                Used to fetch the Google Transparency Report data from the
                public API
              </li>
            </ul>
          </li>
          <li>
            <b>Telegraf Friendly Tagger: </b>
            <a href="https://github.com/CAIDA/telegraf-friendlytagger">
              https://github.com/CAIDA/telegraf-friendlytagger
            </a>{" "}
            <ul>
              <li>
                Telegraf plugin for augmenting time series metadata with human
                readable names
              </li>
            </ul>
          </li>
          <li>
            <b>Libtimeseries: </b>
            <a href="https://github.com/CAIDA/libtimeseries">
              https://github.com/CAIDA/libtimeseries
            </a>
            <ul>
              <li>Time series abstraction library</li>
            </ul>
          </li>
        </ul>
        <p>
          In addition, IODA relies on various external open source projects such
          as Apache Kafka, InfluxDB, Telegraf, and Docker Engine.
        </p>
      </>
    ),
    tab: "repo",
  },
  {
    title: "Data",
    content: (
      <>
        {" "}
        <ul>
          <li>
            <a href="https://api.ioda.inetintel.cc.gatech.edu/v2/">
              https://api.ioda.inetintel.cc.gatech.edu/v2/
            </a>
            <ul>
              <li>
                The IODA APIs which allow retrieval of all outage event and time
                series data
              </li>
            </ul>
          </li>
          <li>
            <a href="https://github.com/CAIDA/ioda-geo-polygons/">
              https://github.com/CAIDA/ioda-geo-polygons/
            </a>
            <ul>
              <li>
                Collection of GeoJSON and TopoJSON datasets developed as part of
                the IODA project during its time at CAIDA
              </li>
            </ul>
          </li>
        </ul>
      </>
    ),
    tab: "repo",
  },
];

export default text_resources;
