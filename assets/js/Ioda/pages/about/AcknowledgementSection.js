import React, {Fragment} from "react";
import { Typography, Row, Col, Card } from "antd";

const {  Text } = Typography;


//Images
import comcast from "images/acknowledgements/comcast.svg";
import dhs from "images/acknowledgements/dhs.svg";
import isoc from "images/acknowledgements/ISOC.png";
import nersc from "images/acknowledgements/nersc.png";
import nsf from "images/acknowledgements/nsf.svg";
import otf from "images/acknowledgements/otf.png";
import sdsc from "images/acknowledgements/sdsc.svg";
import ucsd from "images/acknowledgements/ucsd.svg";
import usdos from "images/acknowledgements/usdos.png";
import xsedeBlack from "images/acknowledgements/xsede-black.png";
import caida from "images/logos/caida.png";
import gatechTso from "images/acknowledgements/gatech-coc.png";
import alcock from "images/acknowledgements/alcock.png";
import ipinfo from "images/acknowledgements/ipinfo.svg";


const data = [
    {
        logo: nsf,
        logoHref: "https://www.caida.org/funding/ioda/",
        children: `The development of this platform at UC San Diego was supported by NSF grant CNS-1228994 [Detection and Analysis of Large-scale Internet Infrastructure Outages (IODA)].`,
    },
    {
        logo: dhs,
        logoHref: "https://www.dhs.gov",
        children: `The development of this platform at UC San Diego was also supported by Department of Homeland Security Science and Technology Directorate (DHS S&T) contract 70RSAT18CB0000015 [IODA-NP: Multi-source Realtime Detection of Macroscopic Internet Connectivity Disruption], and DHS S&T cooperative agreement FA8750-12-2-0326 [Supporting Research and Development of Security Technologies through Network and Security Data Collection].`,
    },
    {
        logo: otf,
        logoHref:
            "https://www.opentech.fund/results/supported-projects/internet-outage-detection-and-analysis/",
        children: `This platform was also supported by the Open Technology Fund under contract number 1002-2018-027.`,
    },
    {
        logo: isoc,
        logoHref: "https://insights.internetsociety.org/",
        children: `Additional funding to support this platform was generously provided by a grant from the Internet Society.`,
    },
    {
        logo: comcast,
        logoHref: "https://innovationfund.comcast.com/",
        children:
            "Additional funding to work on visualization interfaces was generously provided by a Comcast research grant.",
    },
    {
        logo: nersc,
        logoHref: "https://www.nersc.gov",
        children:
            "Storage resources for the UCSD Network Telescope were supported by NERSC, a DOE Office of Science User Facility supported by the Office of Science of the U.S. Department of Energy under Contract No. DE-AC02-05CH11231.",
    },
    {
        logo: xsedeBlack,
        logoHref: "https://www.xsede.org",
        children:
            "Computational resources were supported by National Science Foundation grant number ACI-1053575.",
    },
    {
        logo: sdsc,
        logoHref: "https://www.sdsc.edu",
        children:
            "This project was originally developed at CAIDA, San Diego Supercomputer Center, UC San Diego.",
    },
    {
        logo: ucsd,
        logoHref: "https://www.ucsd.edu",
        children: "This project was originally developed at CAIDA, UC San Diego.",
    },
    {
        logo: usdos,
        logoHref: "https://www.state.gov",
        children: (
            <Fragment>
                This platform was/is supported by the{" "}
                <a
                    className="a-fake text-color-link"
                    href="https://www.state.gov/bureaus-offices/under-secretary-for-civilian-security-democracy-and-human-rights/bureau-of-democracy-human-rights-and-labor/"
                >
                    U.S. Department of State, Bureau of Democracy, Human Rights, and Labor
                </a>{" "}
                (2020, 2023-2024) and{" "}
                <a
                    className="a-fake text-color-link"
                    href="https://www.state.gov/bureaus-offices/under-secretary-for-political-affairs/bureau-of-near-eastern-affairs/"
                >
                    Bureau of Near Eastern Affairs
                </a>{" "}
                (2021-2022).
            </Fragment>
        ),
    },
    {
        logo: caida,
        logoHref: "https://www.caida.org",
        children: (
            <Fragment>
                This project was originally developed at{" "}
                <a className="a-fake text-color-link" href="https://www.caida.org">
                    CAIDA
                </a>
                , UC San Diego.
            </Fragment>
        ),
    },
    {
        logo: gatechTso,
        logoHref: "https://support.cc.gatech.edu/",
        children: (
            <Fragment>
                The{" "}
                <a
                    className="a-fake text-color-link"
                    href="https://support.cc.gatech.edu/"
                >
                    Technology Services Organization (TSO)
                </a>{" "}
                at Georgia Tech's College of Computing provides and manages computing
                infrastructure for this project.
            </Fragment>
        ),
    },
    {
        logo: alcock,
        logoHref: "https://www.alcock.co.nz/",
        children:
            "Alcock Network Intelligence is subcontracted to assist with the development, deployment and maintenance of the software for the IODA project.",
    },
    {
        logo: ipinfo,
        logoHref: "https://ipinfo.io/",
        children:
            "IPInfo provides the IP Geolocation data that is used to associate measurements with their corresponding countries and regions.",
    },
];

const AcknowledgementSection = () => {
    return (
        <div style={{marginLeft: "20px", marginRight: "20px", padding: "50px 0px", textAlign: "center", backgroundColor: "#fbfbfb"}}>

            <Text style={{position: 'relative', fontSize: "20px", color: "#FBBF24", fontWeight: "bold", margin: "20px", padding: "20px"}}>
                Acknowledgements
            </Text>

            <Row gutter={[16, 16]} style={{ marginTop: "40px", marginRight: '40px', marginLeft: '40px'}}>
                {data.map(({logo, logoHref, children}, index) => (
                    <Col key={index} xs={24} sm={12} md={8} lg={6}>
                            <Card
                                hoverable
                                style={{
                                    height: 450,
                                    padding: '20px',
                                    display: 'flex',
                                    flexDirection: "column",
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                cover={
                                    <img
                                        alt=""
                                        src={logo}
                                        style={{
                                            height: 100,
                                            objectFit: "contain",
                                            padding: "10px",
                                        }}
                                    />
                                }
                                onClick={() => window.open(logoHref, '_blank')}
                            >
                                <Card.Meta
                                    description={children}
                                    style={{
                                        textAlign: "center",
                                        overflow: "hidden", // Prevent overflow of content
                                        textOverflow: "ellipsis",
                                    }}
                                />
                            </Card>
                    </Col>
                ))}
            </Row>
            </div>
    );
};

export default AcknowledgementSection;