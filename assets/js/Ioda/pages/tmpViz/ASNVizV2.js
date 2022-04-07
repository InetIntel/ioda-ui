import { horizonChartSeriesColor, humanizeNumber } from "../../utils";
import HorizonTSChart from "horizon-timeseries-chart";
import React, { useState } from "react";

export const ASNVizV2 = () => {
  const [isLoading, setIsLoading] = useState(false);

  async function genChart(asnL, datasource,type) {
    if (!isLoading) {
      setIsLoading(true);
      let data = await fetch(
        `https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/${type}/${asnL}?from=${Math.floor(new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 60).getTime()/1000)}&until=${Math.floor(Date.now()/1000)}&maxPoints=null&datasource=${datasource}`
      )
        .then((response) => response.json())
        .then((data) => data);
      let rawSignalsProcessedArray = convertTsDataForHtsViz(data.data);

      if (rawSignalsProcessedArray && rawSignalsProcessedArray.length > 0) {
        function chart() {
          // draw viz
          const chart = HorizonTSChart()(
            document.getElementById(`asn-horizon-chart`)
          );
          chart
            .data(rawSignalsProcessedArray)
            .series("entityName")
            .yNormalize(false)
            .useUtc(true)
            .use24h(false)
            // Will need to detect column width to populate height
            .width(1000)
            .height(800)
            .enableZoom(false)
            .showRuler(true)
            .interpolationCurve(d3.curveStepAfter)
            .positiveColors(["white", horizonChartSeriesColor]).toolTipContent =
            ({ series, ts, val }) =>
              `${series}<br>${ts}:&nbsp;${humanizeNumber(val)}`;
        }
        chart();
        setIsLoading(false);
      } else {
          return null;
      }
    } else {
      return null;
    }
  }

  function convertTsDataForHtsViz(tsData) {
    let series = [];
    tsData.map((signal) => {
      let values = [];
      if(signal.length == 0){
        return;
      }
      signal[0].values.map((value, index) => {
        values.push(value);
        const plotPoint = {
          entityCode: signal[0].entityCode,
          entityName: signal[0].entityName,
          datasource: signal[0].datasource,
          ts: new Date(signal[0].from * 1000 + signal[0].step * 1000 * index),
          val: value,
        };
        const max = Math.max.apply(null, values);
        if (max !== 0) {
          series.push(plotPoint);
        }
      });
    });
    return series;
  }

  const generate = (e) => {
    e.preventDefault();
    genChart(e.target.ASN.value, e.target.datasource.value,e.target.type.value);
  };

  return (
    <div className="helpPage">
      <div style={{ margin: "10em" }}>
        <form onSubmit={generate}>
        <label>
            <p>Region/ASN</p>
            <select id="type">
              <option value="asn">ASN</option>
              <option value="region">Region</option>
            </select>
          </label>
          <label>
            <p>List of code:(Comma Seperated)</p>
            <input name="ASN" />
          </label>
          <label>
            <p>Datasource</p>
            <select id="datasource">
              <option value="bgp">bgp</option>
              <option value="ping-slash24">ping-slash24</option>
              <option value="merit-nt">merit-nt</option>
            </select>
          </label>
          <button type="submit">Submit</button>
        </form>
        <div id="asn-horizon-chart" className="modal__chart"></div>
        {
            isLoading && <h1>Loading...</h1>
        }
      </div>
    </div>
  );
};
