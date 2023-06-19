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

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import T from "i18n-react";
import Loading from "../../components/loading/Loading";
import LoadingIcon from "images/icons/icon-loading.png";
import Tooltip from "../tooltip/Tooltip";
import TopoMap from "../map/Map";
import Table from "../table/Table";
import * as d3 from "d3-shape";
import {
  horizonChartSeriesColor,
  humanizeNumber,
  maxHtsLimit,
  secondaryColor,
  secondaryColorDark,
  secondaryColorLight,
} from "../../utils";
import HorizonTSChart from "horizon-timeseries-chart";
import Style from "react-style-tag/lib/Style";
import { Button, Modal } from "antd";

class RawSignalsModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      mounted: false,

      additionalEntitiesLoading: false,
      renderingDataPingSlash24: false,
      renderingDataBgp: false,
      renderingDataUcsdNt: false,
      renderingDataMeritNt: false,
      chartWidth: null,
    };
    this.configPingSlash24 = React.createRef();
    this.configBgp = React.createRef();
    this.configUcsdNt = React.createRef();
    this.configMeritNt = React.createRef();
    this.additionalEntitiesLoading = false;

    this.titlePingSlash24 = React.createRef();
    this.titleBgp = React.createRef();
    this.titleUcsdNt = React.createRef();
    this.titleMeritNt = React.createRef();
  }

  componentDidUpdate(prevProps) {
    if (this.props.showModal && !prevProps.showModal) {
      this.setState({ mounted: true });
    } else if (!this.props.showModal && prevProps.showModal) {
      this.setState({ mounted: false });
    }

    if (
      this.props.rawRegionalSignalsProcessedBgp !==
        prevProps.rawRegionalSignalsProcessedBgp &&
      this.configBgp.current
    ) {
      this.genChart("bgp", "region");
    }
    if (
      this.props.rawAsnSignalsProcessedBgp !==
        prevProps.rawAsnSignalsProcessedBgp &&
      this.configBgp.current
    ) {
      this.genChart("bgp", "asn");
    }

    if (
      this.configPingSlash24 &&
      this.configPingSlash24.current &&
      this.configPingSlash24.current.clientHeight === 0
    ) {
      this.setState({ renderingDataPingSlash24: true });
    }

    if (
      this.configPingSlash24 &&
      this.configPingSlash24.current &&
      this.configPingSlash24.current.clientHeight !== 0
    ) {
      this.setState({ renderingDataPingSlash24: false });
    }

    if (
      this.configBgp &&
      this.configBgp.current &&
      this.configBgp.current.clientHeight === 0
    ) {
      this.setState({ renderingDataBgp: true });
    }

    if (
      this.configBgp &&
      this.configBgp.current &&
      this.configBgp.current.clientHeight !== 0
    ) {
      this.setState({ renderingDataBgp: false });
    }

    if (
      this.configUcsdNt &&
      this.configUcsdNt.current &&
      this.configUcsdNt.current.clientHeight === 0
    ) {
      this.setState({ renderingDataUcsdNt: true });
    }

    if (
      this.configUcsdNt &&
      this.configUcsdNt.current &&
      this.configUcsdNt.current.clientHeight !== 0
    ) {
      this.setState({ renderingDataUcsdNt: false });
    }

    if (
      this.configMeritNt &&
      this.configMeritNt.current &&
      this.configMeritNt.current.clientHeight === 0
    ) {
      this.setState({ renderingDataMeritNt: true });
    }

    if (
      this.configMeritNt &&
      this.configMeritNt.current &&
      this.configMeritNt.current.clientHeight !== 0
    ) {
      this.setState({ renderingDataMeritNt: false });
    }
  }

  genChart(dataSource, entityType) {
    // set variables
    let dataSourceForCSS, rawSignalsLoadedBoolean, rawSignalsProcessedArray;
    switch (entityType) {
      case "region":
        switch (dataSource) {
          case "ping-slash24":
            if (
              this.props.rawRegionalSignalsProcessedPingSlash24 &&
              this.props.rawRegionalSignalsProcessedPingSlash24.length > 0
            ) {
              dataSourceForCSS = "pingSlash24";
              rawSignalsProcessedArray =
                this.props.rawRegionalSignalsProcessedPingSlash24;
            }
            break;
          case "bgp":
            if (
              this.props.rawRegionalSignalsProcessedBgp &&
              this.props.rawRegionalSignalsProcessedBgp.length > 0
            ) {
              dataSourceForCSS = "bgp";
              rawSignalsProcessedArray =
                this.props.rawRegionalSignalsProcessedBgp;
            }
            break;
          case "ucsd-nt":
            if (
              this.props.rawRegionalSignalsProcessedUcsdNt &&
              this.props.rawRegionalSignalsProcessedUcsdNt.length > 0
            ) {
              dataSourceForCSS = "ucsdNt";
              rawSignalsProcessedArray =
                this.props.rawRegionalSignalsProcessedUcsdNt;
            }
            break;
          case "merit-nt":
            if (
              this.props.rawRegionalSignalsProcessedMeritNt &&
              this.props.rawRegionalSignalsProcessedMeritNt.length > 0
            ) {
              dataSourceForCSS = "meritNt";
              rawSignalsProcessedArray =
                this.props.rawRegionalSignalsProcessedMeritNt;
            }
            break;
        }
        break;
      case "asn":
        switch (dataSource) {
          case "ping-slash24":
            if (
              this.props.rawAsnSignalsProcessedPingSlash24 &&
              this.props.rawAsnSignalsProcessedPingSlash24.length > 0
            ) {
              dataSourceForCSS = "pingSlash24";
              rawSignalsProcessedArray =
                this.props.rawAsnSignalsProcessedPingSlash24;
            }
            break;
          case "bgp":
            if (
              this.props.rawAsnSignalsProcessedBgp &&
              this.props.rawAsnSignalsProcessedBgp.length > 0
            ) {
              dataSourceForCSS = "bgp";
              rawSignalsProcessedArray = this.props.rawAsnSignalsProcessedBgp;
            }
            break;
          case "ucsd-nt":
            if (
              this.props.rawAsnSignalsProcessedUcsdNt &&
              this.props.rawAsnSignalsProcessedUcsdNt.length > 0
            ) {
              dataSourceForCSS = "ucsdNt";
              rawSignalsProcessedArray =
                this.props.rawAsnSignalsProcessedUcsdNt;
            }
            break;
          case "merit-nt":
            if (
              this.props.rawAsnSignalsProcessedMeritNt &&
              this.props.rawAsnSignalsProcessedMeritNt.length > 0
            ) {
              dataSourceForCSS = "meritNt";
              rawSignalsProcessedArray =
                this.props.rawAsnSignalsProcessedMeritNt;
            }
            break;
        }
        break;
    }

    if (rawSignalsProcessedArray && rawSignalsProcessedArray.length > 0) {
      function chart(width) {
        // draw viz
        const chart = HorizonTSChart()(
          document.getElementById(
            `${entityType}-horizon-chart--${dataSourceForCSS}`
          )
        );
        chart
          .data(rawSignalsProcessedArray)
          .series("entityName")
          .yNormalize(false)
          .useUtc(true)
          .use24h(false)
          // Will need to detect column width to populate height
          .width(width)
          .height(360)
          .enableZoom(false)
          .showRuler(true)
          .interpolationCurve(d3.curveStepAfter)
          .positiveColors(["white", horizonChartSeriesColor]).toolTipContent =
          ({ series, ts, val }) =>
            `${series}<br>${ts}:&nbsp;${humanizeNumber(val)}`;
      }

      if (
        dataSource === "ping-slash24" &&
        (this.configPingSlash24.current || this.state.chartWidth)
      ) {
        chart(
          this.configPingSlash24.current
            ? this.configPingSlash24.current.offsetWidth
            : this.state.chartWidth
        );
      }

      if (
        dataSource === "bgp" &&
        (this.configBgp.current || this.state.chartWidth)
      ) {
        chart(
          this.configBgp.current
            ? this.configBgp.current.offsetWidth
            : this.state.chartWidth
        );
      }

      if (
        dataSource === "ucsd-nt" &&
        (this.configUcsdNt.current || this.state.chartWidth)
      ) {
        chart(
          this.configUcsdNt.current
            ? this.configUcsdNt.current.offsetWidth
            : this.state.chartWidth
        );
      }

      if (
        dataSource === "merit-nt" &&
        (this.configMeritNt.current || this.state.chartWidth)
      ) {
        chart(
          this.configMeritNt.current
            ? this.configMeritNt.current.offsetWidth
            : this.state.chartWidth
        );
      }
    } else {
      return null;
    }
  }

  handleAdditionalEntitiesLoading(target) {
    this.setState({ additionalEntitiesLoading: true }, () => {
      setTimeout(() => {
        this.props.handleLoadAllEntitiesButton(target);
      }, 600);
    });
  }

  render() {
    if (this.props.modalLocation === "map" && !this.props.showModal) {
      return null;
    }
    if (this.props.modalLocation === "table" && !this.props.showModal) {
      return null;
    }

    const regionTitle = T.translate("entityModal.regionTitle");
    const asnTitle = T.translate("entityModal.asnTitle");
    const regionalTableTitle = T.translate("entityModal.regionalTableTitle");
    const asnTableTitle = T.translate("entityModal.asnTableTitle");
    const regionalMapTitle = T.translate("entityModal.regionalMapTitle");
    const noOutagesOnMapMessage = T.translate(
      "entityModal.noOutagesOnMapMessage"
    );
    const pingSlash24HtsLabel = T.translate("entityModal.pingSlash24HtsLabel");
    const bgpHtsLabel = T.translate("entityModal.bgpHtsLabel");
    const ucsdNtHtsLabel = T.translate("entityModal.ucsdNtHtsLabel");
    const meritNtHtsLabel = T.translate("entityModal.meritNtHtsLabel");
    const checkMaxButton = T.translate("entityModal.checkMaxButton");
    const checkMaxButtonBelow150_1 = T.translate(
      "entityModal.checkMaxButtonBelow150_1"
    );
    const checkMaxButtonBelow150_2 = T.translate(
      "entityModal.checkMaxButtonBelow150_2"
    );
    const uncheckAllButton = T.translate("entityModal.uncheckAllButton");
    const currentCountInHts1 = T.translate("entityModal.currentCountInHts1");
    const regionSingular = T.translate("entityModal.regionSingular");
    const regionPlural = T.translate("entityModal.regionPlural");
    const asnSingular = T.translate("entityModal.asnSingular");
    const asnPlural = T.translate("entityModal.asnPlural");
    const currentCountInHts2 = T.translate("entityModal.currentCountInHts2");
    const currentCountInHts3 = T.translate("entityModal.currentCountInHts3");
    const loadRemainingEntities1 = T.translate(
      "entityModal.loadRemainingEntities1"
    );
    const loadRemainingEntities2 = T.translate(
      "entityModal.loadRemainingEntities2"
    );
    const loadRemainingEntities3 = T.translate(
      "entityModal.loadRemainingEntities3"
    );
    const loadRemainingEntities4 = T.translate(
      "entityModal.loadRemainingEntities4"
    );
    const loadRemainingEntities5 = T.translate(
      "entityModal.loadRemainingEntities5"
    );
    const tooltipEntityRawSignalsHeadingTitle = T.translate(
      "tooltip.entityRawSignalsHeading.title"
    );
    const tooltipEntityRawSignalsHeadingText = T.translate(
      "tooltip.entityRawSignalsHeading.text"
    );

    const activeCSS = `display: block;`;
    const inactiveCSS = `display: none;`;

    return (
      <Modal
        open={this.props.showModal}
        onOk={() => this.props.toggleModal(this.props.modalLocation)}
        onCancel={() => this.props.toggleModal(this.props.modalLocation)}
        width={"90vw"}
        bodyStyle={{ maxHeight: "80vh", overflowY: "auto" }}
        className="modal"
        footer={null}
        centered={true}
      >
        <Style>{`
                    .renderingDataPingSlash24 {
                        ${
                          this.state.renderingDataPingSlash24
                            ? activeCSS
                            : inactiveCSS
                        }
                    }
                    .renderingDataBgp {
                        ${this.state.renderingDataBgp ? activeCSS : inactiveCSS}
                    }
                    .renderingDataUcsdNt {
                        ${
                          this.state.renderingDataUcsdNt
                            ? activeCSS
                            : inactiveCSS
                        }
                    }
                    .renderingDataMeritNt {
                        ${
                          this.state.renderingDataMeritNt
                            ? activeCSS
                            : inactiveCSS
                        }
                    }
                `}</Style>
        <div className="modal__window m-4">
          <div className="p-4 card mb-6">
            <div className="flex items-center">
              {this.props.modalLocation === "map" ? (
                <h2 className="text-2xl">
                  {regionTitle} {this.props.entityName}
                </h2>
              ) : this.props.modalLocation === "table" ? (
                <h2 className="text-2xl">
                  {asnTitle} {this.props.entityName}
                </h2>
              ) : null}
              <Tooltip
                title={tooltipEntityRawSignalsHeadingTitle}
                text={tooltipEntityRawSignalsHeadingText}
              />
            </div>
            {this.props.modalLocation === "map" ? (
              <p className="modal__hts-count">
                {currentCountInHts1}
                {this.props.regionalSignalsTableEntitiesChecked}
                {this.props.regionalSignalsTableEntitiesChecked === 1
                  ? regionSingular
                  : regionPlural}
                {currentCountInHts2}
                {regionSingular}
                {currentCountInHts3}
              </p>
            ) : (
              <p className="modal__hts-count">
                {currentCountInHts1}
                {this.props.asnSignalsTableEntitiesChecked}
                {this.props.asnSignalsTableEntitiesChecked === 1
                  ? asnSingular
                  : asnPlural}
                {currentCountInHts2}
                {asnSingular}
                {currentCountInHts3}
              </p>
            )}
          </div>
          <div className="flex gap-6 modal__content">
            <div className="col-1 mw-0">
              <div className="modal__table-container rounded card p-3 mb-6">
                <div className="flex items-center mb-3">
                  <h3 className="col text-2xl truncate">
                    {this.props.modalLocation === "map"
                      ? regionalTableTitle
                      : asnTableTitle}
                  </h3>
                  {this.props.modalLocation === "map" &&
                  this.props.regionalSignalsTableTotalCount >
                    this.props.initialTableLimit &&
                  this.props.regionalRawSignalsLoadAllButtonClicked ===
                    false ? (
                    <div className="modal__loadAll">
                      {loadRemainingEntities1}
                      {asnPlural}
                      {loadRemainingEntities2}
                      <strong>{this.props.initialTableLimit}</strong>
                      {loadRemainingEntities3}
                      <Button
                        onClick={() =>
                          this.handleAdditionalEntitiesLoading(
                            "asnLoadAllEntities"
                          )
                        }
                        size="small"
                        loading={this.state.additionalEntitiesLoading}
                      >
                        {loadRemainingEntities4}
                      </Button>
                      {loadRemainingEntities5}
                    </div>
                  ) : null}
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() =>
                        this.props.handleSelectAndDeselectAllButtons(
                          this.props.modalLocation === "map"
                            ? "checkMaxRegional"
                            : "checkMaxAsn"
                        )
                      }
                      size="small"
                      loading={this.props.checkMaxButtonLoading}
                    >
                      {this.props.modalLocation === "map"
                        ? this.props.regionalSignalsTableSummaryDataProcessed
                            .length < maxHtsLimit
                          ? `${checkMaxButtonBelow150_1}${this.props.regionalSignalsTableSummaryDataProcessed.length}${checkMaxButtonBelow150_2}`
                          : checkMaxButton
                        : this.props.asnSignalsTableSummaryDataProcessed
                            .length < maxHtsLimit
                        ? `${checkMaxButtonBelow150_1}${this.props.asnSignalsTableSummaryDataProcessed.length}${checkMaxButtonBelow150_2}`
                        : checkMaxButton}
                    </Button>
                    <Button
                      onClick={() =>
                        this.props.handleSelectAndDeselectAllButtons(
                          this.props.modalLocation === "map"
                            ? "uncheckAllRegional"
                            : "uncheckAllAsn"
                        )
                      }
                      size="small"
                      loading={this.props.uncheckAllButtonLoading}
                    >
                      {uncheckAllButton}
                    </Button>
                  </div>
                </div>
                {this.props.modalLocation === "table" &&
                this.props.asnSignalsTableTotalCount >
                  this.props.initialTableLimit &&
                this.props.asnRawSignalsLoadAllButtonClicked === false ? (
                  <div className="modal__loadAll">
                    {loadRemainingEntities1}
                    {asnPlural}
                    {loadRemainingEntities2}
                    <strong>{this.props.initialTableLimit}</strong>
                    {loadRemainingEntities3}
                    <Button
                      size="small"
                      onClick={() =>
                        this.handleAdditionalEntitiesLoading(
                          "asnLoadAllEntities"
                        )
                      }
                      loading={this.state.additionalEntitiesLoading}
                    >
                      {loadRemainingEntities4}
                    </Button>
                    {loadRemainingEntities5}
                  </div>
                ) : null}
                {this.props.rawSignalsMaxEntitiesHtsError ? (
                  <p className="modal__table-error">
                    {this.props.rawSignalsMaxEntitiesHtsError}
                  </p>
                ) : null}
                <div
                  className={
                    this.props.modalLocation === "map"
                      ? "modal__table"
                      : "modal__table modal__table--asn"
                  }
                >
                  {this.props.modalLocation === "map" ? (
                    this.props.regionalSignalsTableSummaryDataProcessed ? (
                      <Table
                        type="signal"
                        data={
                          this.props.regionalSignalsTableSummaryDataProcessed
                        }
                        totalCount={
                          this.props.regionalSignalsTableSummaryDataProcessed
                            .length
                        }
                        toggleEntityVisibilityInHtsViz={(event) =>
                          this.props.toggleEntityVisibilityInHtsViz(
                            event,
                            "region"
                          )
                        }
                        handleCheckboxEventLoading={(item) =>
                          this.props.handleCheckboxEventLoading(item)
                        }
                      />
                    ) : (
                      <Loading />
                    )
                  ) : this.props.asnSignalsTableSummaryDataProcessed &&
                    this.props.asnSignalsTableTotalCount ? (
                    <Table
                      type="signal"
                      data={this.props.asnSignalsTableSummaryDataProcessed}
                      totalCount={this.props.asnSignalsTableTotalCount}
                      entityType={
                        this.props.entityType === "asn" ? "country" : "asn"
                      }
                      toggleEntityVisibilityInHtsViz={(event) =>
                        this.props.toggleEntityVisibilityInHtsViz(event, "asn")
                      }
                      handleCheckboxEventLoading={(item) =>
                        this.props.handleCheckboxEventLoading(item)
                      }
                    />
                  ) : (
                    <Loading />
                  )}
                </div>
              </div>
              {this.props.modalLocation === "map" && this.state.mounted ? (
                <div className="modal__map-container rounded card p-3 mb-6">
                  <h3 className="heading-h3">{regionalMapTitle}</h3>
                  <div
                    className="modal__map"
                    style={{ display: "block", height: "40.5rem" }}
                  >
                    {this.props.topoData &&
                    this.props.bounds &&
                    this.props.topoScores ? (
                      <TopoMap
                        topoData={this.props.topoData}
                        bounds={this.props.bounds}
                        scores={this.props.topoScores}
                        handleEntityShapeClick={(entity) =>
                          this.props.handleEntityShapeClick(entity)
                        }
                      />
                    ) : this.props.summaryDataMapRaw &&
                      this.props.topoScores &&
                      this.props.topoScores.length === 0 ? (
                      <div className="related__no-outages">
                        <h2 className="related__no-outages-title">
                          {noOutagesOnMapMessage}
                        </h2>
                      </div>
                    ) : (
                      <Loading />
                    )}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="col-2 mw-0 rounded card p-3">
              <h3 className="heading-h3" ref={this.titlePingSlash24}>
                {pingSlash24HtsLabel}
              </h3>
              {this.props.modalLocation === "map" ? (
                <React.Fragment>
                  {this.props.rawRegionalSignalsRawPingSlash24Length !== 0 &&
                  this.props.rawRegionalSignalsProcessedPingSlash24 &&
                  this.props.rawRegionalSignalsProcessedPingSlash24.length ===
                    0 ? null : this.props
                      .rawRegionalSignalsRawPingSlash24Length === 0 &&
                    !this.props.rawRegionalSignalsProcessedPingSlash24 ? (
                    <Loading text="Retrieving Data..." />
                  ) : this.props.rawRegionalSignalsRawPingSlash24Length !== 0 &&
                    this.titlePingSlash24 &&
                    this.titlePingSlash24.current &&
                    this.titlePingSlash24.current.nextElementSibling !==
                      "div#region-horizon-chart--pingSlash24.modal__chart" ? (
                    <div className="renderingDataPingSlash24">
                      <Loading text="Rendering Data..." />
                    </div>
                  ) : null}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {this.props.rawAsnSignalsRawPingSlash24Length !== 0 &&
                  this.props.rawAsnSignalsProcessedPingSlash24 &&
                  this.props.rawAsnSignalsProcessedPingSlash24.length ===
                    0 ? null : this.props.rawAsnSignalsRawPingSlash24Length ===
                      0 && !this.props.rawAsnSignalsProcessedPingSlash24 ? (
                    <Loading text="Retrieving Data..." />
                  ) : this.props.rawAsnSignalsRawPingSlash24Length !== 0 &&
                    this.titlePingSlash24 &&
                    this.titlePingSlash24.current &&
                    this.titlePingSlash24.current.nextElementSibling !==
                      "div#asn-horizon-chart--pingSlash24.modal__chart" ? (
                    <div className="renderingDataPingSlash24">
                      <Loading text="Rendering Data..." />
                    </div>
                  ) : null}
                </React.Fragment>
              )}
              {this.props.additionalRawSignalRequestedPingSlash24 === true ? (
                <Loading />
              ) : this.props.modalLocation === "map" ? (
                <React.Fragment>
                  {this.props.rawRegionalSignalsProcessedPingSlash24 &&
                  this.props.rawRegionalSignalsProcessedPingSlash24.length >
                    0 ? (
                    <div
                      id="region-horizon-chart--pingSlash24"
                      ref={this.configPingSlash24}
                      className="modal__chart"
                    >
                      {this.genChart("ping-slash24", "region")}
                    </div>
                  ) : null}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {this.props.rawAsnSignalsProcessedPingSlash24 &&
                  this.props.rawAsnSignalsProcessedPingSlash24.length > 0 ? (
                    <div
                      id="asn-horizon-chart--pingSlash24"
                      ref={this.configPingSlash24}
                      className="modal__chart"
                    >
                      {this.genChart("ping-slash24", "asn")}
                    </div>
                  ) : null}
                </React.Fragment>
              )}
              <h3 className="heading-h3" ref={this.titleBgp}>
                {bgpHtsLabel}
              </h3>
              {this.props.modalLocation === "map" ? (
                <React.Fragment>
                  {this.props.rawRegionalSignalsRawBgpLength !== 0 &&
                  this.props.rawRegionalSignalsProcessedBgp &&
                  this.props.rawRegionalSignalsProcessedBgp.length ===
                    0 ? null : this.props.rawRegionalSignalsRawBgpLength ===
                      0 && !this.props.rawRegionalSignalsProcessedBgp ? (
                    <Loading text="Retrieving Data..." />
                  ) : this.props.rawRegionalSignalsRawBgpLength !== 0 &&
                    this.titleBgp &&
                    this.titleBgp.current &&
                    this.titleBgp.current.nextElementSibling !==
                      "div#region-horizon-chart--bgp.modal__chart" ? (
                    <div className="renderingDataBgp">
                      <Loading text="Rendering Data..." />
                    </div>
                  ) : null}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {this.props.rawAsnSignalsRawBgpLength !== 0 &&
                  this.props.rawAsnSignalsProcessedBgp &&
                  this.props.rawAsnSignalsProcessedBgp.length ===
                    0 ? null : this.props.rawAsnSignalsRawBgpLength === 0 &&
                    !this.props.rawAsnSignalsProcessedBgp ? (
                    <Loading text="Retrieving Data..." />
                  ) : this.props.rawAsnSignalsRawBgpLength !== 0 &&
                    this.titleBgp &&
                    this.titleBgp.current &&
                    this.titleBgp.current.nextElementSibling !==
                      "div#asn-horizon-chart--bgp.modal__chart" ? (
                    <div className="renderingDataBgp">
                      <Loading text="Rendering Data..." />
                    </div>
                  ) : null}
                </React.Fragment>
              )}
              {this.props.additionalRawSignalRequestedBgp === true ? (
                <Loading />
              ) : this.props.modalLocation === "map" ? (
                <React.Fragment>
                  {this.props.rawRegionalSignalsProcessedBgp &&
                  this.props.rawRegionalSignalsProcessedBgp.length > 0 ? (
                    <div
                      id="region-horizon-chart--bgp"
                      ref={this.configBgp}
                      className="modal__chart"
                    >
                      {this.genChart("bgp", "region")}
                    </div>
                  ) : null}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {this.props.rawAsnSignalsProcessedBgp &&
                  this.props.rawAsnSignalsProcessedBgp.length > 0 ? (
                    <div
                      id="asn-horizon-chart--bgp"
                      ref={this.configBgp}
                      className="modal__chart"
                    >
                      {this.genChart("bgp", "asn")}
                    </div>
                  ) : null}
                </React.Fragment>
              )}
              <h3 className="heading-h3" ref={this.titleMeritNt}>
                {meritNtHtsLabel}
              </h3>
              {this.props.modalLocation === "map" ? (
                <React.Fragment>
                  {this.props.rawRegionalSignalsRawMeritNtLength !== 0 &&
                  this.props.rawRegionalSignalsProcessedMeritNt &&
                  this.props.rawRegionalSignalsProcessedMeritNt.length ===
                    0 ? null : this.props.rawRegionalSignalsRawMeritNtLength ===
                      0 && !this.props.rawRegionalSignalsProcessedMeritNt ? (
                    <Loading text="Retrieving Data..." />
                  ) : this.props.rawRegionalSignalsRawMeritNtLength !== 0 &&
                    this.configMeritNt &&
                    this.configMeritNt.current &&
                    this.configMeritNt.current.nextElementSibling !==
                      "div#region-horizon-chart--meritNt.modal__chart" ? (
                    <div className="renderingDataMeritNt">
                      <Loading text="Rendering Data..." />
                    </div>
                  ) : null}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {this.props.rawAsnSignalsRawMeritNtLength !== 0 &&
                  this.props.rawAsnSignalsProcessedMeritNt &&
                  this.props.rawAsnSignalsProcessedMeritNt.length ===
                    0 ? null : this.props.rawAsnSignalsRawMeritNtLength === 0 &&
                    !this.props.rawAsnSignalsProcessedMeritNt ? (
                    <Loading text="Retrieving Data..." />
                  ) : this.props.rawAsnSignalsRawMeritNtLength !== 0 &&
                    this.configMeritNt &&
                    this.configMeritNt.current &&
                    this.configMeritNt.current.nextElementSibling !==
                      "div#asn-horizon-chart--meritNt.modal__chart" ? (
                    <div className="renderingDataMeritNt">
                      <Loading text="Rendering Data..." />
                    </div>
                  ) : null}
                </React.Fragment>
              )}
              {this.props.additionalRawSignalRequestedMeritNt === true ? (
                <Loading />
              ) : this.props.modalLocation === "map" ? (
                <React.Fragment>
                  {this.props.rawRegionalSignalsProcessedMeritNt &&
                  this.props.rawRegionalSignalsProcessedMeritNt.length > 0 ? (
                    <div
                      id="region-horizon-chart--meritNt"
                      ref={this.configMeritNt}
                      className="modal__chart"
                    >
                      {this.genChart("merit-nt", "region")}
                    </div>
                  ) : null}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {this.props.rawAsnSignalsProcessedMeritNt &&
                  this.props.rawAsnSignalsProcessedMeritNt.length > 0 ? (
                    <div
                      id="asn-horizon-chart--meritNt"
                      ref={this.configMeritNt}
                      className="modal__chart"
                    >
                      {this.genChart("merit-nt", "asn")}
                    </div>
                  ) : null}
                </React.Fragment>
              )}
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

RawSignalsModal.propTypes = {
  modalLocation: PropTypes.string.isRequired,
  toggleModal: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
};

export default RawSignalsModal;
