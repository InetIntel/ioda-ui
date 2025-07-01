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
// import React from "react";
// import { Checkbox, Collapse } from "antd";
// import { gtrColor, legend } from "../../utils";
// import { debounce } from "lodash";
// import { useParams } from "react-router-dom";
// import Tooltip from "../tooltip/Tooltip";
// import T from "i18n-react";

// const ChartLegendCard = ({
//   legendHandler,
//   checkedMap,
//   updateSourceParams,
//   simplifiedView,
// }) => {
//   const { entityType } = useParams();
//   const handleChange = (source) => {
//     legendHandler(source);
//     if (source.includes("gtr.")) {
//       updateSourceParams(source.split(".")[1]);
//     }
//   };

//   const isCountryView = entityType === "country";

//   const handleChangeDebounced = debounce(handleChange, 180);

//   const googleSeries = legend.filter((item) => item.key.includes("gtr"));
//   const selectedGoogleSeries = googleSeries.filter(
//     (item) => !!checkedMap[item.key]
//   );

//   // The expandable checkbox for Google is checked if all Google series are
//   // checked, or not checked if none are checked. We use null to signify that
//   // the checkbox is in an indeterminate state.
//   const googleExpandableChecked =
//     googleSeries.length === selectedGoogleSeries.length
//       ? true
//       : selectedGoogleSeries.length === 0
//       ? false
//       : null;

//   const tooltipGoogleLegendText = T.translate("tooltip.googleLegend.text");

//   const tooltipGoogleLegendTitle = T.translate("tooltip.googleLegend.title");

//   return (
//     <>
//       {legend
//         .filter(
//           (item) => !item.key.includes(".") && checkedMap[item.key] != null
//         )
//         .map((item) => (
//           <div key={item.key} style={{ display: "flex", alignItems: "center" }}>
//             <Checkbox
//               className="ioda-checkbox mb-2"
//               checked={checkedMap[item.key]}
//               onChange={() => handleChangeDebounced(item.key)}
//               name={item.key}
//               style={{
//                 "--background-color": item.color,
//                 "--border-color": item.color,
//               }}
//             >
//               {item.title}
//             </Checkbox>
//             <Tooltip
//               title={item.tooltip.title}
//               customCode={
//                 <>
//                   {item.tooltip.text}{" "}
//                   <a
//                     href={item.tooltip.link}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     style={{ color: "#fa8c16" }}
//                   >
//                     Learn More.
//                   </a>
//                 </>
//               }
//             />
//           </div>
//         ))}

//       {simplifiedView && !isCountryView && (
//         <div style={{ display: "flex", alignItems: "center" }}>
//           <Checkbox
//             key="gtr.WEB_SEARCH"
//             className="ioda-checkbox mb-2"
//             checked={checkedMap["gtr.WEB_SEARCH"]}
//             onChange={() => handleChangeDebounced("gtr.WEB_SEARCH")}
//             style={{
//               "--background-color": gtrColor,
//               "--border-color": gtrColor,
//             }}
//           >
//             Google (Search)
//           </Checkbox>
//           {/* <Tooltip
//             title={tooltipGoogleLegendTitle}
//             text={tooltipGoogleLegendText}
//           /> */}
//           <Tooltip
//             title={tooltipGoogleLegendTitle}
//             customCode={
//               <>
//                 {tooltipGoogleLegendText}{" "}
//                 <a
//                   href={"/resources?search=google&tab=glossary"}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   style={{ color: "#fa8c16" }}
//                 >
//                   Learn More.
//                 </a>
//               </>
//             }
//           />
//         </div>
//       )}

//       {!simplifiedView && isCountryView && (
//         <Collapse rootClassName="mt-4" expandIconPosition="end">
//           <Collapse.Panel
//             header={
//               <div style={{ display: "flex", alignItems: "center" }}>
//                 <Checkbox
//                   indeterminate={googleExpandableChecked === null}
//                   onChange={() => {}}
//                   checked={googleExpandableChecked}
//                 >
//                   Google ({selectedGoogleSeries.length})
//                 </Checkbox>
//                 <Tooltip
//                   title={tooltipGoogleLegendTitle}
//                   text={tooltipGoogleLegendText}
//                 />
//               </div>
//             }
//             key="1"
//           >
//             {googleSeries.map((item) => (
//               <div key={item.key}>
//                 <Checkbox
//                   className="ioda-checkbox mb-2"
//                   checked={!!checkedMap[item.key]}
//                   onChange={() => handleChangeDebounced(item.key)}
//                   style={{
//                     "--background-color": item.color,
//                     "--border-color": item.color,
//                   }}
//                 >
//                   {item.title}
//                 </Checkbox>
//               </div>
//             ))}
//           </Collapse.Panel>
//         </Collapse>
//       )}
//     </>
//   );
// };

// export default React.memo(ChartLegendCard);

import React, { useState, useEffect } from "react";
import { Cascader, Tag } from "antd";
import { useParams } from "react-router-dom";
import { gtrColor, legend } from "../../utils";
import Tooltip from "../tooltip/Tooltip";
import T from "i18n-react";

const ChartLegendCard = ({
  legendHandler,
  checkedMap,
  updateSourceParams,
  simplifiedView,
}) => {
  const { entityType } = useParams();
  const isCountryView = entityType === "country";

  const baseItems = legend.filter(
    (item) => !item.key.includes(".") && checkedMap[item.key] != null
  );
  const allGoogleSeries = legend.filter((item) => item.key.startsWith("gtr."));
  const googleLeaves = !simplifiedView && isCountryView ? allGoogleSeries : [];

  const cascaderOptions = [
    ...baseItems.map((item) => {
      const tip = item.tooltip;
      return {
        value: item.key,
        // label: item.title,
        tooltip: item.tooltip,
        label: (
          <span style={{ display: "inline-flex", alignItems: "center" }}>
            <span style={{ marginRight: 4 }}>{item.title}</span>
            <Tooltip
              title={tip.title}
              customCode={
                <>
                  {tip.text}{" "}
                  {tip.link && (
                    <a
                      href={tip.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#fa8c16" }}
                    >
                      Learn More.
                    </a>
                  )}
                </>
              }
            />
          </span>
        ),
      };
    }),
    ...(googleLeaves.length
      ? [
          {
            value: "google",
            label: `Google (${googleLeaves.length})`,
            children: googleLeaves.map((item) => ({
              value: item.key,
              label: item.title,
            })),
          },
        ]
      : []),
  ];

  const [selectedPaths, setSelectedPaths] = useState([]);
  useEffect(() => {
    const init = [];
    baseItems.forEach((item) => {
      if (checkedMap[item.key]) init.push([item.key]);
    });
    googleLeaves.forEach((item) => {
      if (checkedMap[item.key]) init.push(["google", item.key]);
    });
    setSelectedPaths(init);
  }, [checkedMap, simplifiedView, isCountryView]);

  const fullTagText = {};
  const colorMap = {};
  baseItems.forEach((item) => {
    fullTagText[item.key] = item.title;
    colorMap[item.key] = item.color;
  });
  googleLeaves.forEach((item) => {
    fullTagText["google__RC_CASCADER_SPLIT__" + item.key] =
      `Google (${item.title})`;
    colorMap["google__RC_CASCADER_SPLIT__" + item.key] = item.color;
  });
  console.log("fullTagText:", fullTagText);
  console.log("colorMap:", colorMap);

  const onCascaderChange = (newPaths) => {
    const newLeaves = newPaths.map((p) => p[p.length - 1]);
    baseItems.forEach((item) => {
      const was = !!checkedMap[item.key];
      const now = newLeaves.includes(item.key);
      if (was !== now) legendHandler(item.key);
    });
    googleLeaves.forEach((item) => {
      const was = !!checkedMap[item.key];
      const now = newLeaves.includes(item.key);
      if (was !== now) {
        legendHandler(item.key);
        updateSourceParams(item.key.split(".")[1]);
      }
    });
    setSelectedPaths(newPaths);
  };

  return (
    // <Cascader
    //   options={cascaderOptions}
    //   value={selectedPaths}
    //   onChange={onCascaderChange}
    //   multiple
    //   placeholder="Select series…"
    //   maxTagCount="responsive"
    //   style={{ width: "100%" }}
    //   tagRender={({ label, value, closable, onClose }) => {
    //     const color = colorMap[value] || "#999";
    //     console.log("Value:", value);
    //     return (
    //       <Tag
    //         closable={closable}
    //         onClose={onClose}
    //         style={{
    //           backgroundColor: `${color}33`,
    //           borderColor: color,
    //           color: "#000",
    //           fontWeight: 500,
    //         }}
    //       >
    //         {fullTagText[value] || label}
    //       </Tag>
    //     );
    //   }}
    //   // displayRender={(labels, selectedOptions) => {
    //   //   const lastOpt = selectedOptions[selectedOptions.length - 1];
    //   //   return fullTagText[lastOpt.value] ?? labels.join(" / ");
    //   // }}
    // />
    <Cascader
      className="custom-tag-spacing"
      options={cascaderOptions}
      value={selectedPaths}
      onChange={onCascaderChange}
      multiple
      placeholder="Select series…"
      // maxTagCount="responsive"
      style={{
        width: "73%",
      }}
      tagRender={({ label, value, closable, onClose }) => {
        const color = colorMap[value] || "#999";
        const tooltipKey = value.includes("__RC_CASCADER_SPLIT__")
          ? value.split("__RC_CASCADER_SPLIT__")[1]
          : value;
        const tooltipData = legend.find(
          (item) => item.key === tooltipKey
        )?.tooltip;
        console.log("tooltipdata", tooltipData);

        return (
          <Tag
            closable={closable}
            onClose={onClose}
            style={{
              display: "inline-flex",
              alignItems: "center",
              backgroundColor: `${color}33`,
              borderColor: color,
              color: "#000",
              fontWeight: 500,
            }}
          >
            {fullTagText[value] || label}{" "}
            {/* <Tooltip
              title={tooltipData?.title}
              customCode={
                <>
                  {tooltipData?.text}{" "}
                  {tooltipData?.link && (
                    <a
                      href={tooltipData.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#fa8c16" }}
                    >
                      Learn More.
                    </a>
                  )}
                </>
              }
            /> */}
          </Tag>
        );
      }}
      dropdownRender={(menu) => <div>{menu}</div>}
    />
  );
};

export default React.memo(ChartLegendCard);
