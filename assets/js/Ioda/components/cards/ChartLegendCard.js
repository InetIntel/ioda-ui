import React from "react";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { legend } from "../../utils";
// import { NULL } from "node-sass";

const ChartLegendCard = ({ legendHandler, checkedMap }) => {
  const handleChange = (event) => {
    legendHandler(event.target.name);
  };

  return (
    <FormGroup>
      {console.log(checkedMap)}
      {legend.map((item) => (
        checkedMap[item.key] != undefined &&
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
        
      ))}

      <Accordion elevation={0}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon style={{ transform: "scale(1.5)" }} />}
          aria-label="Expand"
          aria-controls="additional-actions1-content"
          id="additional-actions1-header"
          style={{ paddingLeft: "0", margin: "0" }}
        >
          <FormControlLabel
            aria-label="Acknowledge"
            control={
              <Checkbox
                style={{
                  transform: "scale(1.5)",
                  paddingBottom: "1em",
                  color: "pink",
                  margin: "0",
                }}
              />
            }
            label={<Typography variant="h5">Google</Typography>}
          />
        </AccordionSummary>
        <AccordionDetails>
          <FormControlLabel
            key="Map"
            control={
              <Checkbox
                checked={false}
                onChange={handleChange}
                name="Map"
                style={{
                  transform: "scale(1.5)",
                  paddingBottom: "1em",
                  color: "pink",
                }}
              />
            }
            label={<Typography variant="h5">Map</Typography>}
          />
          <FormControlLabel
            key="Gmail"
            control={
              <Checkbox
                checked={false}
                onChange={handleChange}
                name="Gmail"
                style={{
                  transform: "scale(1.5)",
                  paddingBottom: "1em",
                  color: "pink",
                }}
              />
            }
            label={<Typography variant="h5">Gmail</Typography>}
          />
        </AccordionDetails>
      </Accordion>
    </FormGroup>
  );
};

export default ChartLegendCard;
