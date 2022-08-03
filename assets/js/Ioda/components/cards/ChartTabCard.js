import React from "react";
import Table from "../table/Table";
import Loading from "../loading/Loading";
import Tooltip from "../tooltip/Tooltip";
import Tabs from "../tabs/Tabs";
import T from "i18n-react";
import ChartLegendCard from "./ChartLegendCard";


class ChartTabCard extends React.Component {

  constructor(props){
    super(props);
    this.state = {currentTab : 1}
    this.clicky.bind(this);
    this.handleSelectTab = this.handleSelectTab.bind(this);
  }

  handleSelectTab(selectedKey) {
    this.setState({currentTab:selectedKey})
  };

  clicky = () => {
    this.props.legendHandler("bgp")
  }
  
render(){
  return (
    <div className="overview__table-config">
      <div className="tabs">
        <Tabs
          tabOptions={["Chart Legend","Alert", "Event"]}
          activeTab={this.state.currentTab}
          handleSelectTab={this.handleSelectTab}
        />
      </div>

      <div
        style={this.state.currentTab === 1 ? { display: "block" } : { display: "none" }}
      >
        <ChartLegendCard legendHandler={this.props.legendHandler} checkedMap={this.props.tsDataSeriesVisibleMap}/>
      </div>

      <div
        style={this.state.currentTab === 2 ? { display: "block" } : { display: "none" }}
      >
        {this.props.alertDataProcessed ? (
          <Table
            type="alert"
            data={this.props.alertDataProcessed}
            totalCount={this.props.alertDataProcessed.length}
          />
        ) : (
          <Loading />
        )}
      </div>
      <div
        style={this.state.currentTab === 3 ? { display: "block" } : { display: "none" }}
      >
        {this.props.eventDataProcessed ? (
          <Table
            type={"event"}
            data={this.props.eventDataProcessed}
            totalCount={this.props.eventDataProcessed.length}
          />
        ) : (
          <Loading />
        )}
      </div>
    </div>
  );
        }
};

export default ChartTabCard;
