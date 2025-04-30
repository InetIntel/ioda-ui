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

import React, { useState } from "react";
import { Link } from "react-router-dom";
import T from "i18n-react";
import iodaLogo from "images/logos/ioda-logo.svg";

import { Select, Tooltip, Switch, Button, Drawer } from "antd";
import {
  getSavedAdvancedModePreference,
  getSavedLanguagePreference,
  saveAdvancedModePreference,
  saveLanguagePreference,
} from "../../utils/storage";
import { CloseOutlined, MenuOutlined } from "@ant-design/icons";

const languageOptions = [
  { value: "en", label: "English" },
  { value: "fa", label: "Farsi" },
];

const Header = () => {
  const [language, setLanguage] = useState(getSavedLanguagePreference());
  const [advancedMode, setAdvancedMode] = useState(
    getSavedAdvancedModePreference()
  );
  const [showDrawer, setShowDrawer] = useState(false);


  // const setShowDrawer = (showDrawer) => {
  //   this.setState({ showDrawer });
  // };

  const toggleDrawerMenu = () => {
    setShowDrawer(!showDrawer);
  };

  const handleLanguageChange = (language) => {
    setLanguage(language);
    saveLanguagePreference(language);
    window.location.reload();
  };

  const handleModeChange = (isAdvancedMode) => {
    setAdvancedMode(advancedMode);
    saveAdvancedModePreference(isAdvancedMode);
    window.location.reload();
  };

  const dashboard = T.translate("header.dashboard");
  const reports = T.translate("header.reports");
  const about = T.translate("header.about");
  const help = T.translate("header.help");
  const resources = T.translate("header.resources");
  const iodaLogoAltText = T.translate("header.iodaLogoAltText");
  const api = T.translate("header.api");
  const viewToggleHelp = T.translate("header.viewToggleHelp");

  const modeStatus = advancedMode ? "Advanced" : "Simple";

  return (
    <div className="header">
      <div className="header__container p-6 max-cont row items-center">
        <div className="header__logo mr-auto">
          <Link to="/">
            <img src={iodaLogo} alt={iodaLogoAltText} width="97" />
          </Link>
        </div>
        <div className="header__item">
          <Link to="/dashboard" className="a-fake">
            {dashboard}
          </Link>
        </div>
        <div className="header__item">
          <a
            href="https://api.ioda.inetintel.cc.gatech.edu/v2/"
            className="a-fake"
          >
            {api}
          </a>
        </div>

        <div className="header__item">
          <Link to="/about" className="a-fake">
            {about}
          </Link>
        </div>

        <div className="header__item">
          <a href="/reports" className="a-fake">
            {reports}
          </a>
        </div>

        <div className="header__item">
          <Link to="/resources" className="a-fake">
            {resources}
          </Link>
        </div>

        <div className="header__item">
          <Select
            value={language}
            style={{ width: 100 }}
            className="ml-md"
            onChange={handleLanguageChange}
            options={languageOptions}
            popupClassName="header__language-select"
          />
        </div>

        <div className="header__item">
          <Tooltip title={viewToggleHelp}>
            <div className="row items-center">
              <Switch
                className="mr-3"
                checked={advancedMode}
                onChange={handleModeChange}
              />
              <span className="text-lg">{modeStatus}</span>
            </div>
          </Tooltip>
        </div>

        <div className="header__drawer-icon">
          <Button icon={<MenuOutlined />} onClick={toggleDrawerMenu} />
        </div>
      </div>

      {/* DRAWER MENU */}
      <Drawer
        placement="right"
        onClose={() => setShowDrawer(false)}
        open={showDrawer}
        className="header__drawer-body"
        closeIcon={
          <CloseOutlined style={{ fontSize: "16px", color: "#fff" }} />
        }
        extra={
          <Link to="/" onClick={() => setShowDrawer(false)}>
            <img src={iodaLogo} alt={iodaLogoAltText} width="97" height="35" />
          </Link>
        }
        width={320}
      >
        <div className="header__drawer-item">
          <Link
            to="/dashboard"
            className="a-fake"
            onClick={() => setShowDrawer(false)}
          >
            {dashboard}
          </Link>
        </div>
        <div className="header__drawer-item">
          <a
            href="https://api.ioda.inetintel.cc.gatech.edu/v2/"
            className="a-fake"
          >
            {api}
          </a>
        </div>

        <div className="header__drawer-item">
          <Link
            to="/about"
            className="a-fake"
            onClick={() => setShowDrawer(false)}
          >
            {about}
          </Link>
        </div>

        <div className="header__drawer-item">
          <a href="/reports" className="a-fake">
            {reports}
          </a>
        </div>

        <div className="header__drawer-item">
          <Link
            to="/help"
            className="a-fake"
            onClick={() => setShowDrawer(false)}
          >
            {help}
          </Link>
        </div>

        <div className="header__drawer-item">
          <Link
            to="/resources"
            className="a-fake"
            onClick={() => setShowDrawer(false)}
          >
            {resources}
          </Link>
        </div>

        <div
          className="header__drawer-item mt-6 pt-6"
          style={{ borderTop: "1px solid gray" }}
        >
          <Select
            value={language}
            style={{ width: 100 }}
            className="ml-md"
            onChange={handleLanguageChange}
            options={languageOptions}
          />
        </div>

        <div className="header__drawer-item">
          <Tooltip title={viewToggleHelp}>
            <div className="ml-6 row items-center">
              <Switch
                className="mr-3"
                checked={advancedMode}
                onChange={handleModeChange}
              />
              <span>{modeStatus}</span>
            </div>
          </Tooltip>
        </div>
      </Drawer>
    </div>
  );
};

export default Header;
