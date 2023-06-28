import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
// These must be the first lines in src/index.js
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

// global CSS styles exported from sass scripts
import "css/style.css";
// Internationalization Files
import "./constants/strings";
// React imports
import React, { Component } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import GA4React from "ga-4-react";
// Redux
import { Provider } from "react-redux";
import { createStore, applyMiddleware, combineReducers } from "redux";
import thunk from "redux-thunk";
import { iodaApiReducer } from "./data/DataReducer";
// Global Components
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
// Routes
import Home from "./pages/home/Home";
import Dashboard from "./pages/dashboard/Dashboard";
import Entity from "./pages/entity/Entity";
import Reports from "./pages/reports/Reports";
import ProjectInfo from "./pages/projectinfo/ProjectInfo";
import Help from "./pages/help/Help";
import IranReport2020 from "./pages/reports/IranReport2020";
import ChartShare from "./pages/tests/ChartShare";
import Error from "./pages/error/Error";
import TestAPI from "./pages/tests/TestAPI";
import { ASNVizV2 } from "./pages/tmpViz/ASNVizV2";
import GTRIntegrated from "./pages/reports/GTRIntegrated";

const ga4react = new GA4React("G-XD5MWMBCF9");
ga4react.initialize().then(
  (ga4) => {
    ga4.pageview("path");
    ga4.gtag("event", "pageview", "path");
  },
  (err) => {
    console.error(err);
  }
);
ga4react.initialize();

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
    };
  }

  static getDerivedStateFromError(errorObject) {
    // Update state so the next render will show the fallback UI.
    return { error: errorObject };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="app">
          <Header />
          <Error error={this.state.error} />
          <Footer />
        </div>
      );
    }
    return (
      <div className="app">
        <Header />
        <Switch>
          {/*<Route path='/test' component={TestAPI}/>*/}
          <Route path="/chart/:entityType/:entityCode" component={ChartShare} />
          <Route path="/dashboard/:entityType?" component={Dashboard} />
          <Route exact path="/reports" component={Reports} />
          <Route exact path="/project" component={ProjectInfo} />
          <Route exact path="/help" component={Help} />
          <Route exact path="/_tmp/asn" component={ASNVizV2} />
          <Route path="/reports/2020-iran-report" component={IranReport2020} />
          <Route path="/reports/GTR-integrated" component={GTRIntegrated} />
          <Route exact path="/:entityType/:entityCode" component={Entity} />
          <Route path="/" component={Home} />
        </Switch>
        <Footer />
      </div>
    );
  }
}

const reducers = {
  iodaApi: iodaApiReducer,
};
const rootReducer = combineReducers(reducers);
const store = createStore(rootReducer, applyMiddleware(thunk));

// await google analytics to initialize

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
);
