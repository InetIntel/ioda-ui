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

import React from "react";
import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import T from "i18n-react";
import Loading from "../../components/loading/Loading";
import Tooltip from "../tooltip/Tooltip";
import TopoMap from "../map/Map";
import Table from "../table/Table";
import * as d3 from "d3-shape";
import {
  horizonChartSeriesColor,
  humanizeNumber,
  legend,
  maxHtsLimit,
} from "../../utils";
import HorizonTSChart from "horizon-timeseries-chart";
import { Style } from "react-style-tag";
import {Button, Modal, Switch} from "antd";
import { CloseOutlined } from "@ant-design/icons";

const RawSignalsModal = (props) => {

  const {
    showModal,
    rawRegionalSignalsProcessedBgp,
    rawAsnSignalsProcessedBgp,
    rawRegionalSignalsProcessedPingSlash24,
    rawRegionalSignalsProcessedUcsdNt,
    rawRegionalSignalsProcessedMeritNt,
    rawAsnSignalsProcessedPingSlash24,
    rawAsnSignalsProcessedUcsdNt,
    rawAsnSignalsProcessedMeritNt,
    handleLoadAllEntitiesButton,
    modalLocation,
    toggleModal,
    regionalSignalsTableEntitiesChecked,
    asnSignalsTableEntitiesChecked,
    regionalSignalsTableTotalCount,
    regionalRawSignalsLoadAllButtonClicked,
    initialTableLimit,
    handleSelectAndDeselectAllButtons,
    checkMaxButtonLoading,
    regionalSignalsTableSummaryDataProcessed,
    asnSignalsTableSummaryDataProcessed,
    asnSignalsTableTotalCount,
    asnRawSignalsLoadAllButtonClicked,
    rawSignalsMaxEntitiesHtsError,
    toggleEntityVisibilityInHtsViz,
    handleCheckboxEventLoading,
    entityType,
    topoData, bounds, topoScores,
    handleEntityShapeClick,
    summaryDataMapRaw,
    rawRegionalSignalsRawPingSlash24Length,
    rawAsnSignalsRawPingSlash24Length,
    additionalRawSignalRequestedPingSlash24,
    rawRegionalSignalsRawBgpLength,
    rawRegionalSignalsRawMeritNtLength,
    rawAsnSignalsRawMeritNtLength,
    additionalRawSignalRequestedMeritNt,
    additionalRawSignalRequestedBgp,
    handleGlobalAsnSignals,
    handleGlobalRegionalAsnSignals,
    entityName,
    rawAsnSignalsRawBgpLength,
    uncheckAllButtonLoading,
    parentEntityName,
    isLoading,
    globalSwitch,
    globalRegionalAsnConnectivity
  } = props;

  const [additionalEntitiesLoading, setAdditionalEntitiesLoading] = useState(false);
  const [renderingDataPingSlash24, setRenderingDataPingSlash24] = useState(false);
  const [renderingDataBgp, setRenderingDataBgp] = useState(false);
  const [renderingDataMeritNt, setRenderingDataMeritNt] = useState(false);
  const [chartWidth, setChartWidth] = useState(null);

  let configPingSlash24 = useRef(null);
  let configBgp = useRef(null);
  let configMeritNt =useRef(null);


  let titlePingSlash24 = useRef(null);
  let titleBgp = useRef(null);
  let titleMeritNt = useRef(null);

  const [isDisabled, setIsDisabled] = useState(false);
  const updatedAsnSignalsTableSummaryDataProcessed = (asnSignalsTableSummaryDataProcessed ?? []).map(summary => ({
    ...summary,
    ipCount: (summary.ipCount === "NaN" || summary.ipCount === "") ? "Unknown" : summary.ipCount,
  }));

  useEffect(() => {
    if(configPingSlash24.current && rawRegionalSignalsProcessedPingSlash24) {
      try {
        genChart("ping-slash24", "region");
      } catch(error) {
        console.log("Error rendering ping-slash4 region chart")
      }
    }
    if(configPingSlash24.current && rawAsnSignalsProcessedPingSlash24) {
      try {
        genChart("ping-slash24", "asn");
      } catch(error) {
        console.log("Error rendering ping-slash4 asn chart")
      }
    }
  }, [rawRegionalSignalsProcessedPingSlash24, rawAsnSignalsProcessedPingSlash24, configPingSlash24])

  // BGP
  useEffect(() => {
    if(configBgp.current && rawRegionalSignalsProcessedBgp) {
      try{
        genChart("bgp", "region");''
      } catch (error) {
        console.log("Error rendering bgp region chart", error);
      }
    }
    if(configBgp.current && rawAsnSignalsProcessedBgp) {
      try {
        genChart("bgp", "asn");
      } catch(error) {
        console.log("Error rendering bgp asn chart", error)
      }
    }
  }, [rawRegionalSignalsProcessedBgp, rawAsnSignalsProcessedBgp, configBgp]);

  // Merit-nt
  useEffect(() => {
    if(configMeritNt.current && rawAsnSignalsProcessedMeritNt) {
      try {
        genChart("merit-nt", "asn");
      } catch(error) {
        console.log("Error rendering merit-nt region chart")
      }
    }

    if(configMeritNt.current && rawRegionalSignalsProcessedMeritNt) {
      try {
        genChart("merit-nt", "region");
      } catch (error) {
        console.log("Error rendering merit-nt region chart")
      }
    }
  }, [rawAsnSignalsProcessedMeritNt, rawRegionalSignalsProcessedMeritNt, configMeritNt]);

  const genChart = (dataSource, entityType) => {
    // set variables
    console.log("Generating chart with datasource and entityType", dataSource, entityType);
    let dataSourceForCSS, rawSignalsProcessedArray;
    switch (entityType) {
      case "region":
        switch (dataSource) {
          case "ping-slash24":
            if (
                rawRegionalSignalsProcessedPingSlash24 &&
                rawRegionalSignalsProcessedPingSlash24?.length > 0
            ) {
              dataSourceForCSS = "pingSlash24";
              rawSignalsProcessedArray = rawRegionalSignalsProcessedPingSlash24;
            }
            break;
          case "bgp":
            if (
                rawRegionalSignalsProcessedBgp &&
                rawRegionalSignalsProcessedBgp?.length > 0
            ) {
              dataSourceForCSS = "bgp";
              rawSignalsProcessedArray =
                  rawRegionalSignalsProcessedBgp;
            }
            break;
          case "merit-nt":
            if (
                rawRegionalSignalsProcessedMeritNt &&
                rawRegionalSignalsProcessedMeritNt?.length > 0
            ) {
              dataSourceForCSS = "meritNt";
              rawSignalsProcessedArray =
                  rawRegionalSignalsProcessedMeritNt;
            }
            break;
        }
        break;
      case "asn":
        switch (dataSource) {
          case "ping-slash24":
            if (
                rawAsnSignalsProcessedPingSlash24 &&
                rawAsnSignalsProcessedPingSlash24.length > 0
            ) {
              dataSourceForCSS = "pingSlash24";
              rawSignalsProcessedArray =
                  rawAsnSignalsProcessedPingSlash24;
            }
            break;
          case "bgp":
            if (
                rawAsnSignalsProcessedBgp &&
                rawAsnSignalsProcessedBgp.length > 0
            ) {
              dataSourceForCSS = "bgp";
              rawSignalsProcessedArray = rawAsnSignalsProcessedBgp;
            }
            break;
          case "merit-nt":
            if (
                rawAsnSignalsProcessedMeritNt &&
                rawAsnSignalsProcessedMeritNt.length > 0
            ) {
              dataSourceForCSS = "meritNt";
              rawSignalsProcessedArray =
                  rawAsnSignalsProcessedMeritNt;
            }
            break;
        }
        break;
    }
    if (rawSignalsProcessedArray && rawSignalsProcessedArray.length > 0) {
      const chart = (width) => {
        // draw viz
        const chart = HorizonTSChart()(
            document.getElementById(
                `${entityType}-horizon-chart--${dataSourceForCSS}`
            )
        );

        const color =
            legend.find((item) => item.key === dataSource).color ??
            horizonChartSeriesColor;

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
            .positiveColors(["white", color]).toolTipContent = ({
                                                                  series,
                                                                  ts,
                                                                  val,
                                                                }) => `${series}<br>${ts}:&nbsp;${humanizeNumber(val)}`;
      }

      if (
          dataSource === "ping-slash24" &&
          (configPingSlash24.current || chartWidth)
      ) {
        chart(
            configPingSlash24.current
                ? configPingSlash24.current.offsetWidth
                : chartWidth
        );
      }

      if (
          dataSource === "bgp" &&
          (configBgp.current || chartWidth)
      ) {
        chart(
            configBgp.current
                ? configBgp.current.offsetWidth
                : chartWidth
        );
      }

      if (
          dataSource === "merit-nt" &&
          (configMeritNt.current || chartWidth)
      ) {
        chart(
            configMeritNt.current
                ? configMeritNt.current.offsetWidth
                : chartWidth
        );
      }
    } else {
      return null;
    }
  }

  const handleAdditionalEntitiesLoading = (target) => {
    setAdditionalEntitiesLoading(true);
    setTimeout(() => {
      handleLoadAllEntitiesButton(target);
    }, 600);
  }

  const handleRegionalAsnConnectivity = () => {
    // setGlobalRegionalAsnConnectivity(connectivity => !connectivity);
    handleGlobalRegionalAsnSignals();
  }



  const regionTitle = T.translate("entityModal.regionTitle");
  const asnTitle = T.translate("entityModal.asnTitle");
  const countryTitle = T.translate("entityModal.countryTitle");
  const regionalTableTitle = T.translate("entityModal.regionalTableTitle");
  const asnTableTitle = T.translate("entityModal.asnTableTitle");
  const regionalMapTitle = T.translate("entityModal.regionalMapTitle");
  const noOutagesOnMapMessage = T.translate(
      "entityModal.noOutagesOnMapMessage"
  );
  const pingSlash24HtsLabel = T.translate("entityModal.pingSlash24HtsLabel");
  const bgpHtsLabel = T.translate("entityModal.bgpHtsLabel");
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

  const tooltipEntityAsnConnectivityTitle = T.translate(
      "tooltip.tooltipEntityAsnConnectivity.title"
  );

  const tooltipEntityAsnConnectivityText = T.translate(
      "tooltip.tooltipEntityAsnConnectivity.text"
  );

  const activeCSS = `display: block;`;
  const inactiveCSS = `display: none;`;

  if (!showModal) {
    return null;
  }

  const modeStatus = globalSwitch ? "Global ASN connectivity" : "Local ASN connectivity";
  const connectivityASNStatus = globalRegionalAsnConnectivity ? "Global ASN connectivity" : "Local ASN connectivity";

  return (
      <Modal
          open={showModal}
          onOk={() => toggleModal(modalLocation)}
          onCancel={() => toggleModal(modalLocation)}
          width={"90vw"}
          bodyStyle={{ maxHeight: "80vh", overflowY: "auto" }}
          className="modal"
          footer={null}
          centered={true}
          closeIcon={<></>}
      >
        <Style>{`
                    .renderingDataPingSlash24 {
                        ${
            renderingDataPingSlash24
                ? activeCSS
                : inactiveCSS
        }
                    }
                    .renderingDataBgp {
                        ${renderingDataBgp ? activeCSS : inactiveCSS}
                    }
                    .renderingDataMeritNt {
                        ${
            renderingDataMeritNt
                ? activeCSS
                : inactiveCSS
        }
                    }
                `}
        </Style>
        <div className="modal__window m-4">
          <div className="p-4 card mb-6">
            <div className="flex items-center">
              {modalLocation === "map" ? (
                  <h2 className="text-2xl">
                    {regionTitle} {parentEntityName}
                  </h2>
              ) : modalLocation === "table" ?
                  (entityType === "region" ?
                      <h2 className="text-2xl">
                        {asnTitle} {entityName}
                      </h2>
                   : entityType === 'asn' ?
                              <h2 className="text-2xl">
                                {countryTitle} {entityName}
                              </h2>
                              :
                              <h2 className="text-2xl">
                                {asnTitle} {parentEntityName}
                              </h2>
                      ) : null}
              <Tooltip
                  title={tooltipEntityRawSignalsHeadingTitle}
                  text={tooltipEntityRawSignalsHeadingText}
              />
              <div className="col"></div>
              <Button
                  type="primary"
                  className="ml-auto"
                  icon={<CloseOutlined/>}
                  onClick={() => toggleModal(modalLocation)}
              />
            </div>
            {modalLocation === "map" ? (
                <p className="modal__hts-count">
                  {currentCountInHts1}
                  {regionalSignalsTableEntitiesChecked}
                  {regionalSignalsTableEntitiesChecked === 1
                      ? regionSingular
                      : regionPlural}
                  {currentCountInHts2}
                  {regionSingular}
                  {currentCountInHts3}
                </p>
            ) : (
                <p className="modal__hts-count">
                  {currentCountInHts1}
                  {asnSignalsTableEntitiesChecked}
                  {asnSignalsTableEntitiesChecked === 1
                      ? asnSingular
                      : asnPlural}
                  {currentCountInHts2}
                  {asnSingular}
                  {currentCountInHts3}
                </p>
            )}
          </div>
          {/* Show local/global connectivity for ASN signals */}
          {/* Raw regional signals */}
          { modalLocation === "map" && entityType === "asn" &&
              <div className="row items-center">
            <Switch
                className="mr-3"
                checked={globalRegionalAsnConnectivity}
                onChange={handleRegionalAsnConnectivity}
            />
            <span className="text-lg">{connectivityASNStatus}</span>
                <Tooltip
                    title={tooltipEntityAsnConnectivityTitle}
                    text={tooltipEntityAsnConnectivityText}
                />
          </div>
        }
          { modalLocation === "table" && entityType !== "asn" &&
              <div className="row items-center">
                <Switch
                    className="mr-3"
                    checked={globalSwitch}
                    onChange={handleGlobalAsnSignals}
                    disabled={isDisabled}
                />
                <span className="text-lg">{modeStatus}</span>
                <Tooltip
                    title={tooltipEntityAsnConnectivityTitle}
                    text={tooltipEntityAsnConnectivityText}
                />
              </div>
          }
          <div className="flex gap-6 modal__content">
            <div className="col-1 mw-0">
              <div className="modal__table-container rounded card p-3 mb-6">
                <div className="flex items-center mb-3">
                  <h3 className="col text-2xl">
                    {modalLocation === "map"
                        ? regionalTableTitle
                        : asnTableTitle}
                  </h3>
                  {modalLocation === "map" &&
                  regionalSignalsTableTotalCount >
                  initialTableLimit &&
                  regionalRawSignalsLoadAllButtonClicked ===
                  false ? (
                      <div className="modal__loadAll">
                        {loadRemainingEntities1}
                        {asnPlural}
                        {loadRemainingEntities2}
                        <strong>{initialTableLimit}</strong>
                        {loadRemainingEntities3}
                        <Button
                            onClick={() =>
                                handleAdditionalEntitiesLoading(
                                    "asnLoadAllEntities"
                                )
                            }
                            size="small"
                            loading={additionalEntitiesLoading}
                        >
                          {loadRemainingEntities4}
                        </Button>
                        {loadRemainingEntities5}
                      </div>
                  ) : null}
                  <div className="flex items-center gap-3">
                    <Button
                        onClick={() =>
                            handleSelectAndDeselectAllButtons(
                                modalLocation === "map"
                                    ? "checkMaxRegional"
                                    : "checkMaxAsn"
                            )
                        }
                        size="small"
                        loading={checkMaxButtonLoading}
                    >
                      {modalLocation === "map"
                          ? regionalSignalsTableSummaryDataProcessed?.length < maxHtsLimit
                              ? `${checkMaxButtonBelow150_1}${regionalSignalsTableSummaryDataProcessed.length}${checkMaxButtonBelow150_2}`
                              : checkMaxButton
                          : asnSignalsTableSummaryDataProcessed?.length < maxHtsLimit
                              ? `${checkMaxButtonBelow150_1}${asnSignalsTableSummaryDataProcessed.length}${checkMaxButtonBelow150_2}`
                              : checkMaxButton}
                    </Button>
                    <Button
                        onClick={() =>
                            handleSelectAndDeselectAllButtons(
                                modalLocation === "map"
                                    ? "uncheckAllRegional"
                                    : "uncheckAllAsn"
                            )
                        }
                        size="small"
                        loading={uncheckAllButtonLoading}
                    >
                      {uncheckAllButton}
                    </Button>
                  </div>
                </div>
                {modalLocation === "table" &&
                asnSignalsTableTotalCount >
                initialTableLimit &&
                asnRawSignalsLoadAllButtonClicked === false ? (
                    <div className="modal__loadAll">
                      {loadRemainingEntities1}
                      {asnPlural}
                      {loadRemainingEntities2}
                      <strong>{initialTableLimit}</strong>
                      {loadRemainingEntities3}
                      <Button
                          size="small"
                          onClick={() =>
                              handleAdditionalEntitiesLoading(
                                  "asnLoadAllEntities"
                              )
                          }
                          loading={additionalEntitiesLoading}
                      >
                        {loadRemainingEntities4}
                      </Button>
                      {loadRemainingEntities5}
                    </div>
                ) : null}
                {rawSignalsMaxEntitiesHtsError ? (
                    <p className="modal__table-error">
                      {rawSignalsMaxEntitiesHtsError}
                    </p>
                ) : null}
                <div
                    className={
                      modalLocation === "map"
                          ? "modal__table"
                          : "modal__table modal__table--asn"
                    }
                >
                  {modalLocation === "map" ? (
                      regionalSignalsTableSummaryDataProcessed ? (
                          <Table
                              type="signal"
                              data={
                                regionalSignalsTableSummaryDataProcessed
                              }
                              totalCount={
                                regionalSignalsTableSummaryDataProcessed?.length
                              }
                              toggleEntityVisibilityInHtsViz={(event) =>
                                  toggleEntityVisibilityInHtsViz(
                                      event,
                                      "region"
                                  )
                              }
                              handleCheckboxEventLoading={(item) =>
                                  handleCheckboxEventLoading(item)
                              }
                          />
                      ) : (
                          <Loading/>
                      )
                  ) : asnSignalsTableSummaryDataProcessed &&
                  asnSignalsTableTotalCount ? (
                      <Table
                          type="signal"
                          data={updatedAsnSignalsTableSummaryDataProcessed}
                          totalCount={asnSignalsTableTotalCount}
                          entityType={
                            entityType === "asn" ? "country" : "asn"
                          }
                          toggleEntityVisibilityInHtsViz={(event) =>
                              toggleEntityVisibilityInHtsViz(event, "asn")
                          }
                          handleCheckboxEventLoading={(item) =>
                              handleCheckboxEventLoading(item)
                          }
                      />
                  ) : (
                      <Loading/>
                  )}
                </div>
              </div>
              {modalLocation === "map" && showModal ? (
                  <div className="modal__map-container rounded card p-3 mb-6">
                    <h3 className="heading-h3">{regionalMapTitle}</h3>
                    <div
                        className="modal__map"
                        style={{display: "block", height: "40.5rem"}}
                    >
                      {topoData &&
                      bounds &&
                      topoScores ? (
                          <TopoMap
                              topoData={topoData}
                              bounds={bounds}
                              scores={topoScores}
                              handleEntityShapeClick={(entity) =>
                                  handleEntityShapeClick(entity)
                              }
                              entityType="region"
                              hideLegend
                          />
                      ) : summaryDataMapRaw &&
                      topoScores &&
                      topoScores.length === 0 ? (
                          <div className="related__no-outages">
                            <h2 className="related__no-outages-title">
                              {noOutagesOnMapMessage}
                            </h2>
                          </div>
                      ) : (
                          <Loading/>
                      )}
                    </div>
                  </div>
              ) : null}
            </div>
            <div className="col-2 mw-0 rounded card p-3">
              <h3 className="heading-h3" ref={titlePingSlash24}>
                {pingSlash24HtsLabel}
              </h3>
              {modalLocation === "map" ? (
                  <>

                  {(() => {
                    if(isLoading) {
                      return <div className="dataSwitchingState">
                        <Loading text="Retrieving Data..."/>
                      </div>
                    }

                    if (rawRegionalSignalsRawPingSlash24Length === undefined ||
                        rawRegionalSignalsRawPingSlash24Length === 0 ||
                        rawRegionalSignalsProcessedPingSlash24 === undefined
                    ) {
                      return (
                          <div className="dataInitState">
                            <Loading text="Retrieving Data..." />
                          </div>
                      );
                    }

                    if (rawRegionalSignalsRawPingSlash24Length > 0 &&
                        (!rawRegionalSignalsProcessedPingSlash24 ||
                            rawRegionalSignalsProcessedPingSlash24.length === 0)) {
                      return (
                          <div className="retrievingDataPingSlash24">
                            <Loading text="Processing Data..." />
                          </div>
                      );
                    }

                    if (rawRegionalSignalsRawPingSlash24Length > 0 &&
                        rawRegionalSignalsProcessedPingSlash24?.length > 0 &&
                        titlePingSlash24?.current &&
                        titlePingSlash24.current.nextElementSibling !== "div#region-horizon-chart--pingSlash24.modal__chart") {
                      return (
                          <div className="renderingDataPingSlash24">
                            <Loading text="Rendering Data..." />
                          </div>
                      );
                    }

                    return null;
                  })()}
                  </>
              ) : (
                  <>
                    {(() => {
                      if (rawAsnSignalsRawPingSlash24Length === undefined || rawAsnSignalsRawPingSlash24Length === 0 || rawAsnSignalsProcessedPingSlash24 === undefined) {
                        return (
                            <div className="dataInitState">
                              <Loading text="Retrieving Data..."/>
                            </div>
                        );
                      }

                      if (rawAsnSignalsRawPingSlash24Length > 0 &&
                          (!rawAsnSignalsProcessedPingSlash24 || rawAsnSignalsProcessedPingSlash24.length === 0)) {
                        return (
                            <div className="retrievingDataBgp">
                              <Loading text="Retrieving Data..."/>
                            </div>
                        );
                      }

                      if (rawAsnSignalsRawPingSlash24Length > 0 &&
                          rawAsnSignalsProcessedPingSlash24 &&
                          rawAsnSignalsProcessedPingSlash24.length > 0 &&
                          titlePingSlash24 &&
                          titlePingSlash24.current &&
                          titlePingSlash24.current.nextElementSibling !== "div#asn-horizon-chart--pingSlash24.modal__chart") {
                        // console.log("Length found and also data")
                        return (
                            <div className="renderingDataPingSlash24">
                              <Loading text="Rendering Data..."/>
                            </div>
                        );
                      }

                      return null;
                    })()}
                  </>
              )}
              {additionalRawSignalRequestedPingSlash24 === true ? (
                  <Loading/>
              ) : modalLocation === "map" ? (
                  <>
                    {rawRegionalSignalsProcessedPingSlash24 &&
                    rawRegionalSignalsProcessedPingSlash24.length >
                    0 ? (
                        <div
                            id="region-horizon-chart--pingSlash24"
                            ref={configPingSlash24}
                            className="modal__chart"
                        >
                          {/*{genChart("ping-slash24", "region")}*/}
                        </div>
                    ) : null}
                  </>
              ) : (
                  <>
                    {rawAsnSignalsProcessedPingSlash24 &&
                    rawAsnSignalsProcessedPingSlash24.length > 0 ? (
                        <div
                            id="asn-horizon-chart--pingSlash24"
                            ref={configPingSlash24}
                            className="modal__chart"
                        >
                          {/*{genChart("ping-slash24", "asn")}*/}
                        </div>
                    ) : null}
                  </>
              )}
              <h3 className="heading-h3" ref={titleBgp}>
                {bgpHtsLabel}
              </h3>
              {modalLocation === "map" ? (
                  <>
                    {(() => {
                      if(isLoading) {
                        return <div className="dataSwitchingState">
                          <Loading text="Retrieving Data..."/>
                        </div>
                      }
                      if (rawRegionalSignalsRawBgpLength === undefined ||
                          rawRegionalSignalsRawBgpLength === 0 ||
                          rawRegionalSignalsProcessedBgp === undefined) {
                        return (
                            <div className="dataInitState">
                              <Loading text="Retrieving Data..." />
                            </div>
                        );
                      }

                      if (rawRegionalSignalsRawBgpLength > 0 &&
                          (!rawRegionalSignalsProcessedBgp ||
                              rawRegionalSignalsProcessedBgp.length === 0)) {
                        return (
                            <div className="renderingDataBgp">
                              <Loading text="Processing Data..." />
                            </div>
                        );
                      }

                      if (rawRegionalSignalsRawBgpLength > 0 &&
                          rawRegionalSignalsProcessedBgp?.length > 0 &&
                          titlePingSlash24?.current &&
                          titlePingSlash24.current.nextElementSibling !== "div#region-horizon-chart--bgp.modal__chart") {
                        return (
                            <div className="renderingDataBgp">
                              <Loading text="Rendering Data..." />
                            </div>
                        );
                      }

                      return null;
                    })()}
                  </>
              ) : (
                  <>
                    {(() => {
                      if(isLoading) {
                        return <div className="dataSwitchingState">
                          <Loading text="Retrieving Data..."/>
                        </div>
                      }
                      if (rawAsnSignalsRawBgpLength === undefined || rawAsnSignalsRawBgpLength === 0 || rawAsnSignalsProcessedBgp === undefined) {
                        return (
                            <div className="dataInitState">
                              <Loading text="Retrieving Data..."/>
                            </div>
                        );
                      }

                      if (rawAsnSignalsRawBgpLength > 0 &&
                          (!rawAsnSignalsProcessedBgp || rawAsnSignalsProcessedBgp.length === 0)) {
                        return (
                            <div className="retrievingDataBgp">
                              <Loading text="Retrieving Data..."/>
                            </div>
                        );
                      }

                      if (rawAsnSignalsRawBgpLength > 0 &&
                          rawAsnSignalsProcessedBgp &&
                          rawAsnSignalsProcessedBgp.length > 0 &&
                          titleBgp &&
                          titleBgp.current &&
                          titleBgp.current.nextElementSibling !== "div#asn-horizon-chart--bgp.modal__chart") {
                        return (
                            <div className="renderingDataBgp">
                              <Loading text="Rendering Data..."/>
                            </div>
                        );
                      }

                      return null;
                    })()}
                  </>
              )}
              {additionalRawSignalRequestedBgp === true ? (
                  <Loading/>
              ) : modalLocation === "map" ? (
                  <>
                    {rawRegionalSignalsProcessedBgp &&
                    rawRegionalSignalsProcessedBgp.length > 0 ? (
                        <div
                            id="region-horizon-chart--bgp"
                            ref={configBgp}
                            className="modal__chart"
                        >
                          {/*{genChart("bgp", "region")}*/}
                        </div>
                    ) : null}
                  </>
              ) : (
                  <>
                    {rawAsnSignalsProcessedBgp &&
                    rawAsnSignalsProcessedBgp.length > 0 ? (
                        <div
                            id="asn-horizon-chart--bgp"
                            ref={configBgp}
                            className="modal__chart"
                        >
                          {/*{genChart("bgp", "asn")}*/}
                        </div>
                    ) : null}
                  </>
              )}
              <h3 className="heading-h3" ref={titleMeritNt}>
                {meritNtHtsLabel}
              </h3>
              {modalLocation === "map" ? (
                  <>
                    {(() => {
                      if(isLoading) {
                        return <div className="dataSwitchingState">
                          <Loading text="Retrieving Data..."/>
                        </div>
                      }
                      if (rawRegionalSignalsRawMeritNtLength === undefined ||
                          rawRegionalSignalsRawMeritNtLength === 0 ||
                          rawRegionalSignalsProcessedMeritNt === undefined) {
                        return (
                            <div className="dataInitState">
                              <Loading text="Retrieving Data..." />
                            </div>
                        );
                      }

                      if (rawRegionalSignalsRawMeritNtLength > 0 &&
                          (!rawRegionalSignalsProcessedBgp ||
                              rawRegionalSignalsProcessedMeritNt.length === 0)) {
                        return (
                            <div className="renderingDataMeritNt">
                              <Loading text="Processing Data..." />
                            </div>
                        );
                      }

                      if (rawRegionalSignalsRawMeritNtLength > 0 &&
                          rawRegionalSignalsProcessedMeritNt?.length > 0 &&
                          titlePingSlash24?.current &&
                          titlePingSlash24.current.nextElementSibling !== "div#region-horizon-chart--meritNt.modal__chart") {
                        return (
                            <div className="renderingDataMeritNt">
                              <Loading text="Rendering Data..." />
                            </div>
                        );
                      }

                      return null;
                    })()}
                  </>
              ) : (
                  <>
                    {(() => {
                      if(isLoading) {
                        return <div className="dataSwitchingState">
                          <Loading text="Retrieving Data..."/>
                        </div>
                      }
                      if (rawAsnSignalsRawMeritNtLength === undefined || rawAsnSignalsRawMeritNtLength === 0 || rawAsnSignalsProcessedMeritNt === undefined) {
                        return (
                            <div className="dataInitState">
                              <Loading text="Retrieving Data..."/>
                            </div>
                        );
                      }

                      if (rawAsnSignalsRawMeritNtLength > 0 &&
                          (!rawAsnSignalsProcessedMeritNt || rawAsnSignalsProcessedMeritNt.length === 0)) {
                        return (
                            <div className="renderingDataMeritNt">
                              <Loading text="Retrieving Data..."/>
                            </div>
                        );
                      }

                      if (rawAsnSignalsRawMeritNtLength > 0 &&
                          rawAsnSignalsProcessedMeritNt &&
                          rawAsnSignalsProcessedMeritNt.length > 0 &&
                          titleMeritNt &&
                          titleMeritNt.current &&
                          titleMeritNt.current.nextElementSibling !== "div#asn-horizon-chart--meritNt.modal__chart") {
                        return (
                            <div className="renderingDataMeritNt">
                              <Loading text="Rendering Data..."/>
                            </div>
                        );
                      }

                      return null;
                    })()}
                  </>
              )}
              {additionalRawSignalRequestedMeritNt === true ? (
                  <Loading/>
              ) : modalLocation === "map" ? (
                  <>
                    {rawRegionalSignalsProcessedMeritNt &&
                    rawRegionalSignalsProcessedMeritNt.length > 0 ? (
                        <div
                            id="region-horizon-chart--meritNt"
                            ref={configMeritNt}
                            className="modal__chart"
                        >
                          {genChart("merit-nt", "region")}
                        </div>
                    ) : null}
                  </>
              ) : (
                  <>
                    {rawAsnSignalsProcessedMeritNt &&
                    rawAsnSignalsProcessedMeritNt.length > 0 ? (
                        <div
                            id="asn-horizon-chart--meritNt"
                            ref={configMeritNt}
                            className="modal__chart"
                        >
                          {/*{genChart("merit-nt", "asn")}*/}
                        </div>
                    ) : null}
                  </>
              )}
            </div>
          </div>
        </div>
      </Modal>
  );
}

RawSignalsModal.propTypes = {
  modalLocation: PropTypes.string.isRequired,
  toggleModal: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
};

export default React.memo(RawSignalsModal);
