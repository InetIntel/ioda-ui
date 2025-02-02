import React from "react";
import { Typography, Row, Col, Card } from "antd";
//Images
import osp from "images/about/os.png";
import outage from "images/about/outage.png";
import cflag from "images/about/cflag.png";
import location from "images/about/location.png";
import bdw from "images/about/bandwidth.png";

const { Title, Text } = Typography;

const missionData = [
    {
        icon: osp,
        text: "With its open-source dashboard, IODA tracks the severity of Internet disruptions, from minor to major outages.",
    },
    {
        icon: outage,
        text: "IODA monitors outages occurring in countries, subnational regions, and networks over time.",
    },
    {
        icon: cflag,
        text: "IODA's Country-level data shows drops and recovery of Internet connectivity across entire nations.",
    },
    {
        icon: location,
        text: "IODA captures connectivity at subnational granularity & provides unprecedented visibility into disruptions.",
    },
    {
        icon: bdw,
        text: "Network level data tracks disruptions within individual ISPs or network providers.",
    },
];

const MissionSection = () => {
    return (
        <div style={{  padding: "10px 0px", textAlign: "center"}}>
            {/* Mission Header */}
            <Text style={{ fontSize: "20px", color: "#FBBF24", fontWeight: "bold", width: "60%"}}>
                OUR MISSION
            </Text>
            <Title
                level={2}
                style={{
                    fontSize: "28px",
                    fontWeight: 500,
                    color: "#1F2937",
                    margin: "16px 0",
                }}
            >
                To provide{" "}
                <span style={{ color: "#F59E0B", fontWeight: "bold" }}>open-source</span>,{" "}
                <span style={{ color: "#F59E0B", fontWeight: "bold" }}>trusted</span>, and
                granular measurement data on global Internet connectivity.
            </Title>

            {/* Mission Cards */}
            <Row gutter={[16, 16]} justify="center" style={{ marginTop: "30px" }}>
                {missionData.map((item, index) => (
                    <Col xs={24} sm={12} md={8} lg={4} key={index}>
                        <Card
                            style={{
                                borderRadius: "8px",
                                backgroundColor: "#FAFAFA",
                                height: "200px",
                            }}
                            bodyStyle={{ padding: "16px", textAlign: "center" }}
                        >
                            <div style={{marginBottom: "16px"}}><img
                                src={item.icon}
                                alt="icon"
                                style={{width: "40px", height: "40px"}}
                            /></div>
                            <Text style={{fontSize: "14px", color: "#3c434c"}}>{item.text}</Text>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default MissionSection;
