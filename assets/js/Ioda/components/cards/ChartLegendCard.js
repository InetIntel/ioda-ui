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
import React, { useEffect, useState } from "react";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { gtrColor, legend } from "../../utils";
// import { NULL } from "node-sass";

const ChartLegendCard = ({
  legendHandler,
  checkedMap,
  updateSourceParams,
  simplifiedView,
}) => {

  const [googleLegendSelected, setGoogleLegendSelected] = useState(true);

  const handleChange = (event) => {
    legendHandler(event.target.name);
    if (event.target.name.includes("gtr.")) {
      updateSourceParams(event.target.name.split(".")[1]);
    }
  };

  useEffect(()=>{
    let status = false;
    for(const k in checkedMap) {
      if(k.includes(".") ){
          status = status || checkedMap[k];
      }
    }
    setGoogleLegendSelected(status);
  },[checkedMap])

  return (
    <FormGroup>
      {legend
        .filter((item) => !item.key.includes("."))
        .map(
          (item) =>
            checkedMap[item.key] != undefined && (
              <FormControlLabel
                key={item.key}
                control={
                  <Checkbox
                    checked={checkedMap[item.key]}
                    onChange={handleChange}
                    name={item.key}
                    style={{
                      transform: "scale(1.5)",
                      paddingBottom: "1em",
                      color: item.color,
                    }}
                  />
                }
                label={<Typography variant="h5">{item.title}</Typography>}
              />
            )
        )}
      {simplifiedView ? (
        <FormControlLabel
          key={"gtr.WEB_SEARCH"}
          control={
            <Checkbox
              checked={checkedMap["gtr.WEB_SEARCH"]}
              onChange={handleChange}
              name={"gtr.WEB_SEARCH"}
              style={{
                transform: "scale(1.5)",
                paddingBottom: "1em",
                color: gtrColor,
              }}
            />
          }
          label={<Typography variant="h5">Google (Search)</Typography>}
        />
      ) : (
        <Accordion elevation={0}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon style={{ transform: "scale(1.5)" }} />}
            aria-label="Expand"
            aria-controls="additional-actions1-content"
            id="additional-actions1-header"
            style={{ paddingLeft: "0", margin: "0" }}
          >
            <FormControlLabel
            key="google-dropdown"
            label={<Typography variant="h5">Google</Typography>}
            control={
              <Checkbox
              indeterminate={googleLegendSelected}
              checked={false}
              style={{
                transform: "scale(1.5)",
                paddingBottom: "1em",
                color: gtrColor,
              }}
              />
            }
            />
          </AccordionSummary>
          <AccordionDetails style={{ flexDirection: "column" }}>
            {legend
              .filter((item) => item.key.includes("gtr"))
              .map((item) => (
                <FormControlLabel
                  key={item.key}
                  control={
                    <Checkbox
                      checked={
                        checkedMap[item.key] ? checkedMap[item.key] : false
                      }
                      onChange={handleChange}
                      name={item.key}
                      style={{
                        transform: "scale(1.5)",
                        paddingBottom: "1em",
                        color: item.color,
                      }}
                    />
                  }
                  label={<Typography variant="h5">{item.title}</Typography>}
                />
              ))}
          </AccordionDetails>
        </Accordion>
      )}
    </FormGroup>
  );
};

export default ChartLegendCard;
