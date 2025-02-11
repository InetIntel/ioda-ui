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

import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
// Redux
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { iodaApiReducer } from "./data/DataReducer";
// Global Components
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
// Routes
import Home from "./pages/home/Home";
import Dashboard from "./pages/dashboard/Dashboard";
import Entity from "./pages/entity/Entity";
import About from "./pages/about/About";
import Help from "./pages/help/Help";
import Resources from "./pages/resources/Resources";
import Error from "./pages/error/Error";
import { ASNVizV2 } from "./pages/tmpViz/ASNVizV2";
import { initializeAnalytics } from "./utils/analytics";

initializeAnalytics();

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
        <Routes>
          <Route path="/dashboard/:entityType?" element={<Dashboard />} />
          <Route exact path="/about" element={<About />} />
          <Route exact path="/help" element={<Help />} />
          <Route exact path="/resources" element={<Resources />} />
          <Route exact path="/_tmp/asn" element={<ASNVizV2 />} />
          <Route exact path="/:entityType/:entityCode?" element={<Entity />} />
          <Route path="/" element={<Home />} />
        </Routes>
        <Footer />
      </div>
    );
  }
}

const reducers = {
  iodaApi: iodaApiReducer,
};

const store = configureStore({
  reducer: reducers,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immutableStateInvariant: false,
    })
})
const container = document.getElementById("root");
const root = createRoot(container);

// await google analytics to initialize

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
