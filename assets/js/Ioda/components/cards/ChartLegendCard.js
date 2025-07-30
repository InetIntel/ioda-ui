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
import { Checkbox, Collapse } from "antd";
import { gtrColor, legend } from "../../utils";
import { debounce } from "lodash";
import { useParams } from "react-router-dom";
import Tooltip from "../tooltip/Tooltip";
import T from "i18n-react";

const ChartLegendCard = ({
  legendHandler,
  checkedMap,
  updateSourceParams,
  simplifiedView,
}) => {
  const { entityType } = useParams();
  const handleChange = (source) => {
    legendHandler(source);
    if (source.includes("gtr.")) {
      updateSourceParams(source.split(".")[1]);
    }
  };

  const isCountryView = entityType === "country";

  const handleChangeDebounced = debounce(handleChange, 180);

  const googleSeries = legend.filter((item) => item.key.includes("gtr"));
  const selectedGoogleSeries = googleSeries.filter(
    (item) => !!checkedMap[item.key]
  );

  // The expandable checkbox for Google is checked if all Google series are
  // checked, or not checked if none are checked. We use null to signify that
  // the checkbox is in an indeterminate state.
  const googleExpandableChecked =
    googleSeries.length === selectedGoogleSeries.length
      ? true
      : selectedGoogleSeries.length === 0
      ? false
      : null;

  const tooltipGoogleLegendText = T.translate("tooltip.googleLegend.text");

  const tooltipGoogleLegendTitle = T.translate("tooltip.googleLegend.title");

  return (
    <>
      {legend
        .filter(
          (item) => !item.key.includes(".") && checkedMap[item.key] != null
        )
        .map((item) => (
          <div key={item.key} style={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              className="ioda-checkbox mb-2"
              checked={checkedMap[item.key]}
              onChange={() => handleChangeDebounced(item.key)}
              name={item.key}
              style={{
                "--background-color": item.color,
                "--border-color": item.color,
              }}
            >
              {item.title}
            </Checkbox>
            <Tooltip
              title={item.tooltip.title}
              customCode={
                <>
                  {item.tooltip.text}{" "}
                  <a
                    href={item.tooltip.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#fa8c16" }}
                  >
                    Learn More.
                  </a>
                </>
              }
            />
          </div>
        ))}

      {simplifiedView && !isCountryView && (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Checkbox
            key="gtr.WEB_SEARCH"
            className="ioda-checkbox mb-2"
            checked={checkedMap["gtr.WEB_SEARCH"]}
            onChange={() => handleChangeDebounced("gtr.WEB_SEARCH")}
            style={{
              "--background-color": gtrColor,
              "--border-color": gtrColor,
            }}
          >
            Google (Search)
          </Checkbox>
          {/* <Tooltip
            title={tooltipGoogleLegendTitle}
            text={tooltipGoogleLegendText}
          /> */}
          <Tooltip
            title={tooltipGoogleLegendTitle}
            customCode={
              <>
                {tooltipGoogleLegendText}{" "}
                <a
                  href={"/resources?search=google&tab=glossary"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#fa8c16" }}
                >
                  Learn More.
                </a>
              </>
            }
          />
        </div>
      )}

      {!simplifiedView && isCountryView && (
        <Collapse rootClassName="mt-4" expandIconPosition="end">
          <Collapse.Panel
            header={
              <div style={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                  indeterminate={googleExpandableChecked === null}
                  onChange={() => {}}
                  checked={googleExpandableChecked}
                >
                  Google ({selectedGoogleSeries.length})
                </Checkbox>
                <Tooltip
                  title={tooltipGoogleLegendTitle}
                  text={tooltipGoogleLegendText}
                />
              </div>
            }
            key="1"
          >
            {googleSeries.map((item) => (
              <div key={item.key}>
                <Checkbox
                  className="ioda-checkbox mb-2"
                  checked={!!checkedMap[item.key]}
                  onChange={() => handleChangeDebounced(item.key)}
                  style={{
                    "--background-color": item.color,
                    "--border-color": item.color,
                  }}
                >
                  {item.title}
                </Checkbox>
              </div>
            ))}
          </Collapse.Panel>
        </Collapse>
      )}
    </>
  );
};

export default React.memo(ChartLegendCard);
