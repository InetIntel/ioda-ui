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
import React, { PureComponent } from "react";
import { Link } from "react-router-dom";
// Internationalization
import T from "i18n-react";
// Images

import image2 from "images/GTR-post/image2.png";
import image1 from "images/GTR-post/image1.png";
import image3 from "images/GTR-post/image3.png";
import image4 from "images/GTR-post/image4.png";
import image5 from "images/GTR-post/image5.png";
import image6 from "images/GTR-post/image6.png";
import PreloadImage from "react-preload-image";
import { Helmet } from "react-helmet";

class GTRIntegrated extends PureComponent {
  render() {
    const title = T.translate("iranReport2020.title");
    const authors = T.translate("iranReport2020.authors");

    return (
      <div className="report">
        <Helmet>
          <title>
            IODA Integrates Google Usage Data and Adds Enhancements to the User
            Interface
          </title>
          <meta
            name="description"
            content="An analysis of Internet outages in Iran from February 17, 2020 to April 17, 2020, covering the legislative election and the early spread of COVID-19 cases."
          />
        </Helmet>
        <div className="row list">
          <div className="col-1-of-1">
            <h1 className="section-header">
              IODA Integrates Google Usage Data and Adds Enhancements to the
              User Interface
            </h1>
            {/* <p className="reports__text">{authors}</p> */}
            <div className="nav">
              <h2>Index</h2>
              <ul className="nav__list">
                <li className="nav__list-item">
                  <Link to="/reports/GTR-integrated#overview">Overview</Link>
                </li>
                <li className="nav__list-item">
                  <Link to="/reports/GTR-integrated#gtr-signals">GTR Signals</Link>
                  <ul>
                    <li className="nav__list-item">
                      <Link to="/reports/GTR-integrated#overview">
                        A few helpful details on the GTR Signal
                      </Link>
                    </li>
                    <li className="nav__list-item">
                      <Link to="/reports/GTR-integrated#overview">
                        How to interact with the GTR signal in IODA
                      </Link>
                    </li>
                  </ul>
                </li>
                <li className="nav__list-item">
                  <Link to="/reports/GTR-integrated#overview">
                    New Simplified and Advanced Dashboard Views
                  </Link>
                  <ul>
                    <li className="nav__list-item">
                      <Link to="/reports/GTR-integrated#overview">
                        New Simplified and Advanced Dashboard Views
                      </Link>
                    </li>
                    <li className="nav__list-item">
                      <Link to="/reports/GTR-integrated#overview">
                        Several overlapping network outages on Mar 11 2020
                      </Link>
                    </li>
                    <li className="nav__list-item">
                      <Link to="/reports/GTR-integrated#overview">
                        The Advanced View
                      </Link>
                    </li>
                  </ul>
                </li>
                <li className="nav__list-item">
                  <Link to="/reports/GTR-integrated#overview">
                    IODA Translation to Farsi
                  </Link>
                </li>
                <li className="nav__list-item">
                  <Link to="/reports/GTR-integrated#overview">Gratitude</Link>
                </li>
              </ul>
              <h1 id="overview">Overview</h1>
              <p>
                The IODA team would like to share three exciting enhancements to
                the dashboard. First, we have integrated Google usage data.
                Second, we have implemented a Simplified and Advanced version of
                the dashboard. And finally, we have started the work of
                translating IODA into Farsi in partnership with the{" "}
                <a href="https://www.miaan.org/">Miaan Group</a>. Look for
                future improvements to this translation. We are excited to
                provide users with additional signals to interpret Internet
                connectivity. Please read more about the signals related to
                google usage data, our new Simplified and Advanced views, and
                the ongoing translation work below. For inquiries or feedback
                please contact the IODA team at Georgia Tech’s Internet
                Intelligence Lab at ioda-info@cc.gatech.edu.
              </p>

              <h1 id="gtr-signals">GTR Signals</h1>
              <p>
                The Internet Intelligence Lab at Georgia Tech is excited to
                announce the integration of
                <a href="http://transparencyreport.google.com">
                  {" "}
                  Google Transparency Report
                </a>{" "}
                (GTR) data into
                <a href="https://ioda.inetintel.cc.gatech.edu/dashboard">
                  {" "}
                  IODA
                </a>
                ! At the country level, IODA users can now see Internet
                connectivity signals (BGP, Active Probing, Telescope) alongside
                Google products’ usage data (Google Search, YouTube, Maps, ...).
                We are grateful to the GTR team for providing this data and to
                the<a href="https://jigsaw.google.com/"> Jigsaw team</a> for
                developing and maintaining the
                <a href="https://github.com/Jigsaw-Code/net-analysis">
                  {" "}
                  API service
                </a>
                .
              </p>
              <PreloadImage className="img-container" src={image2} lazy />
              <h1>A few helpful details on the GTR signals</h1>
              <p>
                Google product signals are sourced from the{" "}
                <a href="https://transparencyreport.google.com/">
                  Google Transparency Report
                </a>
                . Each product signal represents normalized values of the number
                of visits to that Google product and are approximately
                geolocated to the country where the visit originated. IODA
                retrieves the Google Transparency Report data through the{" "}
                <a href="https://github.com/Jigsaw-Code/net-analysis">
                  GTR API maintained by Jigsaw.
                </a>
              </p>
              <p>
                Current GTR data is only available at the country level and has
                a resolution of 1 data point per 30 minutes. IODA fetches the
                data every 15 minutes. You will notice a lag of 60-90 minutes in
                the time series.
              </p>
              <h1 id="how-to-interact-with-the-gtr-signal-in-ioda">
                How to interact with the GTR signal in IODA
              </h1>
              <PreloadImage className="img-container" src={image5} lazy />
              <p>
                By default, IODA visualizes Google Web Search usage data. If you
                are in the Advanced View you can use the Selected Signal
                checkboxes to the left of the Google products to add and remove
                signals from the chart. (Please see more on the Advanced versus
                Simplified views below.)
              </p>
              <h1 id="new-simplified-and-advanced-dashboard-views">
                New Simplified and Advanced Dashboard Views
              </h1>

              <p>
                In addition to the GTR signal integration, you will notice there
                is now a Simplified and Advanced version of the dashboard that
                users can toggle between. This a first iteration of a simplified
                view to make IODA’s dashboard more intuitive to users less
                familiar with IODA. By default, the dashboard will be in
                Simplified view. Use the toggle in the upper righthand corner to
                switch views from Simplified to Advanced.
              </p>
              <PreloadImage className="img-container" src={image4} lazy />
              <h1>The Simplified View</h1>

              <p>
                By default, users will see the Simplified view. The toggle will
                appear red and will have the word “Simplified” next to it to let
                you know you are viewing the simplified dashboard.
              </p>
              <p>
                Rundown on what you will see (and not see) in the{" "}
                <strong>Simplified</strong> view:
              </p>
              <ul className="bulleted-list">
                <li>
                  Values in the timeseries chart are normalized and the option
                  to toggle between normalized and absolute values has been
                  removed
                </li>
                <li>
                  The Alerts and Events tables have been removed and alert bands
                  have been removed along with the toggle to turn alert bands on
                  and off
                  <ul className="bulleted-list">
                    <li>
                      We find that our currently-unsophisticated alert system to
                      be distracting for our users as it still produces false
                      positives and false negatives. This feature is a work in
                      progress and should be treated as such, and thus we expose
                      it only in the Advanced view.
                    </li>
                  </ul>
                </li>
                <li>
                  The Selected Signal pane allows you to add or remove signals
                  by checking or unchecking the boxes to the left of the signal
                  name.
                  <ul>
                    <li>
                      You can still use the time series legend to add or remove
                      signals
                    </li>
                  </ul>
                </li>
                <li>
                  In the Simplified view, the GTR signal by default shows web
                  search traffic. In the advanced view, web search is still the
                  default but you can use the signal selection pane to turn
                  various GTR and IODA signals on and off.
                </li>
              </ul>
              <PreloadImage className="img-container" src={image6} lazy />
              <h1 id="the-advanced-view">The Advanced View</h1>

              <p>
                As mentioned, the Advanced view can be accessed through the
                toggle on the upper righthand corner. If you are in the Advanced
                view, you will see the word “Advanced” next to the toggle.
              </p>
              <p>
                Rundown on what you will see (and not see) in the Advanced view:
              </p>
              <ul className="bulleted-list">
                <li>
                  Signal values in the time series chart are normalized by
                  default. Use the toggle to the top right of the time series
                  chart to change signal to absolute values.
                </li>
                <li>
                  The Alerts and Events tables can be accessed by clicking the
                  “Alerts” or “Events” tab next to “Selected Signal” tab.
                </li>
                <li>
                  Use the checkboxes in the Selected Signal pane or click items
                  in the time series legend to add or remove signals from the
                  time series chart.
                </li>
                <li>
                  GTR signal by default shows web search traffic. In the
                  “Selected Signals” pane, use the arrow down to expand or
                  collapse the Google signals and add or remove other google
                  product signals by checking or unchecking the boxes.
                </li>
              </ul>
              <PreloadImage className="img-container" src={image3} lazy />
              <h1 id="ioda-translation-to-farsi">IODA Translation to Farsi</h1>

              <p>
                In partnership with the Miaan Group, the IODA team began a
                translation of the dashboard to Farsi. Translation efforts are
                ongoing. Please reach out if you would like to help support IODA
                localization.
              </p>
              <PreloadImage className="img-container" src={image1} lazy />
              <h1 id="gratitude">Gratitude</h1>

              <p>
                We would like to thank the IODA team for their hard work: Akash,
                Alberto, Zach, Shane, Rama, and Amanda. We would also like to
                thank our partners at the{" "}
                <a href="https://www.miaan.org/">Miaan Group</a> for supporting
                the Farsi translation and the GTR and Jigsaw team for making
                access to Google products’ usage data possible.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default GTRIntegrated;
