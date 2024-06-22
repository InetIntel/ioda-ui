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
import React, { PureComponent } from "react";
import { Link } from "react-router-dom";
// Internationalization
import T from "i18n-react";
import { Helmet } from "react-helmet";

import { Alert } from "antd";
import { registerAnalyticsEvent } from "../../utils/analytics";

class Help extends PureComponent {
  render() {
    const title = T.translate("header.help");
    const text = T.translate("reports.text");
    const link1 = T.translate("reports.link1");
    const link2 = T.translate("reports.link2");
    const link3 = T.translate("reports.link3");
    const link4 = T.translate("reports.link4");
    const link5 = T.translate("reports.link5");

    const trackClickEvent = (itemName) => {
      registerAnalyticsEvent("help_click", itemName);
    }

    return (
      <div className="max-cont pb-24 help-page">
        <Helmet>
          <title>
            IODA | Screencasts, Detection Methods, Data Access, and More
          </title>
          <meta
            name="description"
            content="Learn more about IODA's datasources used, internet outage detection and scoring methods, or get help using the interface."
          />
        </Helmet>

        <div className="mb-24">
          <Alert
            showIcon
            description={
              <p className="text-2xl font-med">
                For inquiries or feedback please contact the IODA team at
                Georgia Tech's{" "}
                <a
                  className="a-fake text-color-link"
                  href="https://inetintel.notion.site/Internet-Intelligence-Research-Lab-d186184563d345bab51901129d812ed6"
                  target="_blank"
                >
                  Internet Intelligence Lab
                </a>
                : ioda-info@cc.gatech.edu.
              </p>
            }
          />
        </div>

        <div className="text-2xl">
          <div className="col-1-of-1">
            <h1 className="text-5xl font-semibold mb-6">{title}</h1>

            <hr className="my-12" />

            <h2 className="text-3xl font-semibold mb-6">Guided Resources</h2>

            <h3 className="text-2xl font-semibold">User Guide (NEW)</h3>
            <ul className="mb-6">
              <li>
                <a
                  href="https://inetintel.github.io/IODA-site-files/files/brochure2024/Download_4Pages.pdf"
                  target="_blank"
                  className="a-fake text-color-link"
                  onClick={() => trackClickEvent('user_guide_digital_pdf')}
                >
                  Digital PDF
                </a>
              </li>
              <li>
                <a
                  href="https://inetintel.github.io/IODA-site-files/files/brochure2024/Download_FullImage.png"
                  target="_blank"
                  className="a-fake text-color-link"
                  onClick={() => trackClickEvent('user_guide_digital_infographic')}
                >
                  Digital Infographic
                </a>
              </li>
              <li>
                <a
                  href="https://inetintel.github.io/IODA-site-files/files/brochure2024/Print%20-%20Letter%20-%20Inside.pdf"
                  target="_blank"
                  className="a-fake text-color-link"
                  onClick={() => trackClickEvent('user_guide_print_pdf_inside')}
                >
                  Print PDF - Inside
                </a>
              </li>
              <li>
                <a
                  href="https://inetintel.github.io/IODA-site-files/files/brochure2024/Print%20-%20Letter%20-%20Outside.pdf"
                  target="_blank"
                  className="a-fake text-color-link"
                  onClick={() => trackClickEvent('user_guide_print_pdf_outside')}
                >
                  Print PDF - Outside
                </a>
              </li>
            </ul>

            <h3 className="text-2xl font-semibold">Screencasts</h3>
            <p>
              We have created screencasts that walk you through using IODA's
              Dashboard and Explorer. The screencasts discuss the most important
              user interface elements, IODA's data sources, and show how to use
              both the Dashboard and the Explorer effectively.
            </p>
            <ul className="mb-6">
              <li>
                <a
                  href="https://advocacyassembly.org/en/courses/67"
                  target="_blank"
                  className="a-fake text-color-link"
                >
                  Shutdown Academy Course (Advocacy Assembly)
                </a>
              </li>
              <li>
                <a
                  className="a-fake text-color-link"
                  href="https://www.youtube.com/watch?v=jpOkIjAHKNc"
                >
                  Dashboard - Overview and Case Studies
                </a>
              </li>
              <li>
                <a
                  className="a-fake text-color-link"
                  href="https://www.youtube.com/watch?v=VzOv7g1Xy3k"
                >
                  Dashboard screencast
                </a>
              </li>
              <li>
                <a
                  className="a-fake text-color-link"
                  href="https://www.youtube.com/watch?v=X4vlllI2TVU"
                >
                  Explorer screencast
                </a>
              </li>
            </ul>

            <hr className="my-12" />

            <h2 className="text-3xl font-semibold mb-6">Datasources</h2>

            <h3 className="text-2xl font-semibold">BGP</h3>
            <ul className="mb-6">
              <li>
                Data is obtained by processing <em>all updates</em> from{" "}
                <em>all Route Views and RIPE RIS collectors</em>.
              </li>
              <li>
                Every 5 minutes, we calculate the number of full-feed peers that
                observe each prefix. A peer is <em>full-feed</em> if it has more
                than 400k IPv4 prefixes, and/or more than 10k IPv6 prefixes
                (i.e., suggesting that it shares its entire routing table).
              </li>
              <li>
                A prefix is <em>visible</em> if more than 50% of the full-feed
                peers observe it. We aggregate prefix visibility statistics by
                country, region and ASN.
              </li>
            </ul>

            <h3 className="text-2xl font-semibold">Active Probing</h3>
            <ul className="mb-6">
              <li>
                We use a custom implementation of the{" "}
                <a
                  className="a-fake text-color-link"
                  href="https://www.isi.edu/~johnh/PAPERS/Quan13c.html"
                >
                  Trinocular
                </a>{" "}
                technique.
              </li>
              <li>
                We probe ~4.2M /24 blocks at least once every 10 minutes (as
                opposed to 11 minutes used in the Trinocular paper).
              </li>
              <li>
                Currently the alerts IODA shows use data from a team of 20
                probers located at Georgia Tech.
              </li>
              <li>
                The trinocular measurement and inference technique labels a /24
                block as <em>up</em>, <em>down</em>, or <em>unknown</em>. In
                addition, we then aggregate <em>up</em> /24s into country,
                region and ASN statistics.
              </li>
            </ul>

            <h3 className="text-2xl font-semibold">Network Telescope</h3>
            <ul className="mb-6">
              <li>
                We analyze traffic data from the{" "}
                <a
                  className="a-fake text-color-link"
                  href="https://www.merit.edu/a-data-repository-for-cyber-security-research-and-education/"
                >
                  Merit
                </a>{" "}
                Network Telescopes.
              </li>
              <li>
                We apply{" "}
                <a
                  className="a-fake text-color-link"
                  href="http://www.caida.org/publications/papers/2014/passive_ip_space_usage_estimation/"
                >
                  anti-spoofing heuristics and noise reduction filters
                </a>{" "}
                to the raw traffic.
              </li>
              <li>
                For each packet that passes the filters, we perform geolocation
                and ASN lookups on the
                source IP address, and then compute the{" "}
                <em>number of unique source IPs per minute</em>, aggregated by
                country, region, and ASN.
              </li>
            </ul>

            <h3 className="text-2xl font-semibold">Google Product Signals</h3>
            <ul className="mb-6">
              <li>
                Google product signals are sourced from the{" "}
                <a
                  className="a-fake text-color-link"
                  href="https://transparencyreport.google.com/"
                >
                  Google Transparency Report
                </a>
                . Each product signal represents normalized values of the number
                of visits to that Google product and are approximately
                geolocated to the country where the visit originated.
              </li>
              <li>Current GTR data is only available at the country-level.</li>
              <li>
                IODA connects to the Google Transparency Report data through the{" "}
                <a
                  className="a-fake text-color-link"
                  href="https://github.com/Jigsaw-Code/net-analysis"
                >
                  GTR API maintained by Jigsaw
                </a>
                .
              </li>
              <li>
                Google provides GTR data at the resolution of 1 data point per
                30 minutes. IODA fetches the data every 15 minutes. You will
                notice a lag of 60-90 minutes in the time series.
              </li>
            </ul>

            <hr className="my-12" />

            <h2 className="text-3xl font-semibold mb-6">Outage Detection</h2>
            <ul className="mb-6">
              <li>
                For each data source (BGP, Active Probing, and Telescope), we
                currently monitor for three types of outages: country-level,
                region-level and AS-level.
              </li>
              <li>
                Detection is performed by comparing the <em>current</em> value
                for each datasource/aggregation (e.g., the number of /24
                networks visible on <em>BGP</em> and geolocated to{" "}
                <em>Italy</em>) to an <em>historical</em> value that is computed
                by finding the <em>median</em> of a sliding window of recent
                values (the length of the window varies between data sources and
                is listed below).
              </li>
              <li>
                If the <em>current</em> value is lower than a given fraction of
                the
                <em>history</em> value, an alert is generated. Each data source
                is configured with two <em>history-fraction</em> thresholds; one
                that triggers a <em>warning</em> alert, and one that triggers a{" "}
                <em>critical</em> alert. The warning and critical thresholds for
                each data source are listed below. These values are experimental
                and are based on empirical observations of the signal to noise
                ratio for each data source.
              </li>
            </ul>

            <h3 className="text-2xl font-semibold mb-6">Detection Criteria</h3>
            <h4>BGP</h4>
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

            <h4>Active Probing</h4>
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

            <h4>Telescope</h4>
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

            <hr className="my-12" />

            <h2 className="text-3xl font-semibold mb-6">
              Outage Severity Scores
            </h2>

            <h3 className="text-2xl font-semibold">Alert Area</h3>
            <p className="mb-6">
              To quantify the <em>severity</em> of an outage, we use a concept
              we call
              <em>Alert Area</em>, which takes into account both the magnitude
              of the outage and the duration of the outage. The alert area is
              computed by multiplying the relative drop (i.e.{" "}
              <em>((history - current) / history) * 100</em>) by the length of
              the outage (in minutes). All alert tables in IODA show Alert Area
              values as per-datasource outage severity scores.
            </p>

            <h3 className="text-2xl font-semibold">Overall Score</h3>
            <p className="mb-6">
              While we perform outage detection on a per-datasource basis, we
              use multiple datasources to gain confidence about an outage. To do
              this, we compute an <em>Overall Score</em> by <em>multiplying</em>{" "}
              the
              <em>Alert Area</em> scores for each data source that triggered an
              alert. We multiply Alert Area scores together (rather than summing
              them) to give weight to outages that have been detected through
              multiple datasources.
            </p>
            <p className="mb-24">
              <b>Caveat:</b> While the "Overall Score" values given in the alert
              tables reflect a multiplication of the total alert area for each
              data source, the "Overall Score" value shown in the "Outage
              Severity Levels" visualizations is instead the sum of the overall
              score values for each minute in the time window. That is, an
              overall score is computed for each minute by multiplying together
              the alert areas for that minute, and then these per-minute overall
              scores are summed to give the total shown when hovering over a
              country or region.
            </p>

            <hr className="my-12" />

            <h2 className="text-3xl font-semibold mb-6">
              Repositories and Data Access
            </h2>
            <p className="mb-6">
              IODA is entirely based on open-source software. The following is
              the list of repositories of the various software components and
              libraries used by IODA:
            </p>

            <h3 className="text-2xl font-semibold">Software Repositories</h3>
            <ul className="mb-6">
              <li>
                <b>IODA UI: </b>
                <a
                  href="https://github.com/InetIntel/ioda-ui"
                  className="a-fake text-color-link"
                  target="_blank"
                >
                  https://github.com/InetIntel/ioda-ui
                </a>
              </li>
              <li>
                <b>IODA API: </b>
                <a
                  href="https://github.com/InetIntel/ioda-api"
                  className="a-fake text-color-link"
                  target="_blank"
                >
                  https://github.com/InetIntel/ioda-api
                </a>
              </li>
              <li>
                <b>BGPStream: </b>
                <a
                  href="https://bgpstream.caida.org"
                  className="a-fake text-color-link"
                  target="_blank"
                >
                  https://bgpstream.caida.org
                </a>
              </li>

              <li>
                <b>BGPView: </b>
                <a
                  href="https://bgpstream.caida.org"
                  className="a-fake text-color-link"
                  target="_blank"
                >
                  https://github.com/InetIntel/bgpview
                </a>
                <ul>
                  <li>
                    Library for efficient (re-)construction, transport and
                    analysis of BGP routing tables
                  </li>
                </ul>
              </li>

              <li>
                <b>Libipmeta: </b>
                <a
                  href="https://github.com/InetIntel/libipmeta"
                  className="a-fake text-color-link"
                  target="_blank"
                >
                  https://github.com/InetIntel/libipmeta
                </a>
                <ul>
                  <li>IP metadata querying library</li>
                </ul>
              </li>

              <li>
                <b>Trinarkular: </b>
                <a
                  href="https://github.com/CAIDA/trinarkular"
                  className="a-fake text-color-link"
                  target="_blank"
                >
                  https://github.com/CAIDA/trinarkular
                </a>
                <ul>
                  <li>
                    IODA's interpretation and implementation of the Trinocular
                    methodology described at{" "}
                    <a
                      href="https://dl.acm.org/doi/10.1145/2534169.2486017"
                      className="a-fake text-color-link"
                      target="_blank"
                    >
                      https://dl.acm.org/doi/10.1145/2534169.2486017
                    </a>
                  </li>
                </ul>
              </li>

              <li>
                <b>Corsaro3: </b>
                <a
                  href="https://github.com/InetIntel/corsaro3"
                  className="a-fake text-color-link"
                  target="_blank"
                >
                  https://github.com/InetIntel/corsaro3
                </a>{" "}
                <ul>
                  <li>Used to generate the telescope signals</li>
                </ul>
              </li>

              <li>
                <b>Watchtower Sentry: </b>
                <a
                  href="https://github.com/InetIntel/watchtower-sentry"
                  className="a-fake text-color-link"
                  target="_blank"
                >
                  https://github.com/InetIntel/watchtower-sentry
                </a>{" "}
                <ul>
                  <li>
                    Anomaly detection for real time and historical time series
                    data
                  </li>
                </ul>
              </li>

              <li>
                <b>Watchtower Alert: </b>
                <a
                  href="https://github.com/InetIntel/watchtower-alert"
                  className="a-fake text-color-link"
                  target="_blank"
                >
                  https://github.com/InetIntel/watchtower-alert
                </a>{" "}
                <ul>
                  <li>Alerting component of the watchtower framework</li>
                </ul>
              </li>

              <li>
                <b>Chocolatine: </b>
                <a
                  href="https://github.com/InetIntel/chocolatine"
                  className="a-fake text-color-link"
                  target="_blank"
                >
                  {" "}
                  https://github.com/InetIntel/chocolatine
                </a>{" "}
                <ul>
                  <li>S-ARIMA based anomaly detection</li>
                </ul>
              </li>

              <li>
                <b>IODA GTR: </b>
                <a
                  href="https://github.com/InetIntel/ioda-gtr"
                  className="a-fake text-color-link"
                  target="_blank"
                >
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
                <a
                  href="https://github.com/CAIDA/telegraf-friendlytagger"
                  className="a-fake text-color-link"
                  target="_blank"
                >
                  https://github.com/CAIDA/telegraf-friendlytagger
                </a>{" "}
                <ul>
                  <li>
                    Telegraf plugin for augmenting time series metadata with
                    human readable names
                  </li>
                </ul>
              </li>

              <li>
                <b>Libtimeseries: </b>
                <a
                  href="https://github.com/CAIDA/libtimeseries"
                  className="a-fake text-color-link"
                  target="_blank"
                >
                  https://github.com/CAIDA/libtimeseries
                </a>
                <ul>
                  <li>Time series abstraction library</li>
                </ul>
              </li>
            </ul>

            <p className="mb-6">
              In addition, IODA relies on various external open source projects
              such as Apache Kafka, InfluxDB, Telegraf, and Docker Engine.
            </p>

            <h3 className="text-2xl font-semibold">Data</h3>
            <ul className="mb-24">
              <li>
                <a
                  href="https://api.ioda.inetintel.cc.gatech.edu/v2/"
                  className="a-fake text-color-link"
                  target="_blank"
                >
                  https://api.ioda.inetintel.cc.gatech.edu/v2/
                </a>
                <ul>
                  <li>
                    The IODA APIs which allow retrieval of all outage event and
                    time series data
                  </li>
                </ul>
              </li>

              <li>
                <a
                  href="https://github.com/CAIDA/ioda-geo-polygons/"
                  className="a-fake text-color-link"
                  target="_blank"
                >
                  https://github.com/CAIDA/ioda-geo-polygons/
                </a>
                <ul>
                  <li>
                    Collection of GeoJSON and TopoJSON datasets developed as
                    part of the IODA project during its time at CAIDA
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default Help;
