/*
 * This source code is Copyright (c) 2021 Georgia Tech Research
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

// React Imports
import React, { PureComponent, Fragment } from "react";
import { Typography, Card, Row, Col } from "antd";
const { Title, Paragraph, Layout, Content } = Typography;

// Internationalization
import T from "i18n-react";
import { Helmet } from "react-helmet";

// Images
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
import worldmap from "images/about/world-map-background.png";
import worldMapBackground from 'images/about/world-map-background.png';


import PartnerCard from "../home/PartnerCard";
import { Alert } from "antd";

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

const About = () => {

    const title = T.translate("about.title");
    const acknowledgementsTitle = T.translate("header.acknowledgements");
    const text = T.translate("about.text");
    const labLink = T.translate("about.link1"); // TODO rename
  console.log(worldMapBackground)

    return (
        <div className="max-cont project-info">
          <Helmet>
            <title>IODA | About</title>
            <meta
                name="description"
                content="More detailed information about the IODA project."
            />
          </Helmet>

          {/*<div className="mb-24">*/}
          {/*  <div className="ioda-container" style={{backgroundImage: `url(${worldMapBackground})`}}>*/}
          {/*      /!*<div className="ioda-header">*!/*/}
          {/*        /!*<Title level={1} style={{ position:'absolute', fontSize: '5em' }} >Measuring and Detecting Internet Outages Worldwide in Real-Time</Title>*!/*/}
          {/*        /!*<Paragraph>*!/*/}
          {/*        /!*  Users across the globe rely on IODA to track and monitor Internet connectivity. IODA also provides a*!/*/}
          {/*        /!*  valuable open-data source for the technical research community that inspires collaboration and spurs*!/*/}
          {/*        /!*  researchers to publish scientific literature in the Internet measurement space.*!/*/}
          {/*        /!*</Paragraph>*!/*/}
          {/*      /!*</div>*!/*/}
          {/*  </div>*/}
          {/*</div>*/}
          <div className="ioda-container">
            <img src={worldmap} alt="World Map" className="background-image"/>
            <div className="overlay-text">
              {/*<h2>Measuring and Detecting Internet Outages</h2>*/}
              {/*<p>*/}
              {/*  Users across the globe rely on IODA to track and monitor internet connectivity. IODA also provides a*/}
              {/*  valuable open-data source for the technical research community that inspires collaboration and spurs*/}
              {/*  researchers to publish scientific literature in the internet measurement space.*/}
              {/*</p>*/}
              <Title level={1} style={{ position:'absolute', fontSize: '5em' }} >Measuring and Detecting Internet Outages Worldwide in Real-Time</Title>
                <Paragraph>
                Users across the globe rely on IODA to track and monitor Internet connectivity. IODA also provides a
                 valuable open-data source for the technical research community that inspires collaboration and spurs
                researchers to publish scientific literature in the Internet measurement space.
              </Paragraph>
            </div>
          </div>


          {/*Header Section*/}
          {/*<div style={{ textAlign: "center", padding: "50px", backgroundColor: "#f9f9f9" }}>*/}
          {/*  <div style={{ background: `url(${worldMapBackground}) no-repeat center`, backgroundSize: "cover", height: "650px", marginBottom: "20px" }}></div>*/}
          {/*  <div style={{ position: "relative", zIndex: 2 }}>*/}
          {/*    <Title level={2}>Measuring and Detecting Internet Outages Worldwide in Real-Time</Title>*/}
          {/*    <Paragraph>*/}
          {/*      Users across the globe rely on IODA to track and monitor Internet connectivity. IODA also provides a valuable open-data source for the technical research community that inspires collaboration and spurs researchers to publish scientific literature in the Internet measurement space.*/}
          {/*    </Paragraph>*/}
          {/*  </div>*/}
          {/*</div>*/}


          {/* Mission Section */}
          {/*<div style={{textAlign: "center", padding: "50px", backgroundColor: "#fff"}}>*/}
          {/*  <Title level={3}>OUR MISSION</Title>*/}
          {/*  <Paragraph>*/}
          {/*    To provide <span style={{color: "orange", fontWeight: "bold"}}>open-source</span>, <span*/}
          {/*      style={{color: "orange", fontWeight: "bold"}}>trusted</span>, and granular measurement data on global*/}
          {/*    Internet connectivity.*/}
          {/*  </Paragraph>*/}

          {/*  /!* Cards Section *!/*/}
          {/*  <Row gutter={[16, 16]} justify="center">*/}
          {/*    <Col xs={24} sm={12} md={8} lg={6}>*/}
          {/*      <Card bordered={false} style={{textAlign: "center", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"}}>*/}
          {/*        <Title level={4}>🏠</Title>*/}
          {/*        <Paragraph>*/}
          {/*          With its open-source dashboard, IODA tracks the severity of Internet disruptions, from minor to*/}
          {/*          major outages.*/}
          {/*        </Paragraph>*/}
          {/*      </Card>*/}
          {/*    </Col>*/}
          {/*    <Col xs={24} sm={12} md={8} lg={6}>*/}
          {/*      <Card bordered={false} style={{textAlign: "center", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"}}>*/}
          {/*        <Title level={4}>📡</Title>*/}
          {/*        <Paragraph>*/}
          {/*          IODA monitors outages occurring in countries, subnational regions, and networks over time.*/}
          {/*        </Paragraph>*/}
          {/*      </Card>*/}
          {/*    </Col>*/}
          {/*    <Col xs={24} sm={12} md={8} lg={6}>*/}
          {/*      <Card bordered={false} style={{textAlign: "center", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"}}>*/}
          {/*        <Title level={4}>🏴</Title>*/}
          {/*        <Paragraph>*/}
          {/*          IODA's Country-level data shows drops and recovery of Internet connectivity across entire nations.*/}
          {/*        </Paragraph>*/}
          {/*      </Card>*/}
          {/*    </Col>*/}
          {/*    <Col xs={24} sm={12} md={8} lg={6}>*/}
          {/*      <Card bordered={false} style={{textAlign: "center", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"}}>*/}
          {/*        <Title level={4}>📍</Title>*/}
          {/*        <Paragraph>*/}
          {/*          IODA captures connectivity at subnational granularity & provides unprecedented visibility into*/}
          {/*          disruptions.*/}
          {/*        </Paragraph>*/}
          {/*      </Card>*/}
          {/*    </Col>*/}
          {/*    <Col xs={24} sm={12} md={8} lg={6}>*/}
          {/*      <Card bordered={false} style={{textAlign: "center", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"}}>*/}
          {/*        <Title level={4}>💻</Title>*/}
          {/*        <Paragraph>*/}
          {/*          Network level data tracks disruptions within individual ISPs or network providers.*/}
          {/*        </Paragraph>*/}
          {/*      </Card>*/}
          {/*    </Col>*/}
          {/*  </Row>*/}
          {/*</div>*/}


          {/*/!* Project Info *!/*/}
          {/*<div className="mb-24">*/}
          {/*  <h1 className="text-5xl font-semibold mb-6">{title}</h1>*/}
          {/*  <p className="text-2xl">*/}
          {/*    {text}{" "}*/}
          {/*    <a*/}
          {/*        className="a-fake text-color-link"*/}
          {/*        href="https://www.caida.org/projects/ioda/"*/}
          {/*        target="_blank"*/}
          {/*    >*/}
          {/*      {labLink}*/}
          {/*    </a>*/}
          {/*    .*/}
          {/*  </p>*/}
          {/*</div>*/}

          {/* Acknowledgements */}
          <div className="mb-24">
            <h1 className="text-5xl font-semibold mb-6">
              {acknowledgementsTitle}
            </h1>
            <div className="acknowledgements__support-grid">
              {data.map(({logo, logoHref, children}) => (
                  <PartnerCard key={logoHref} logo={logo} logoHref={logoHref}>
                    {children}
                  </PartnerCard>
              ))}
            </div>
          </div>

          {/* Data Sources */}
          <div className="mb-24">
            <h1 className="text-5xl font-semibold mb-6">Data Sources</h1>
            <div className="text-2xl">
              <p>
                See the{" "}
                <a
                    className="a-fake text-color-link"
                    href="http://www.caida.org/projects/ioda/"
                >
                  IODA project page
                </a>{" "}
                for scientific references and for more information about our
                methodology.{" "}
              </p>
              <h2 className="text-2xl font-semibold mt-6">
                Global Internet Routing Data
              </h2>
              <ul style={{listStyle: "inside"}}>
                <li>
                  RIPE NCC's{" "}
                  <a
                      className="a-fake text-color-link"
                      href="http://ris.ripe.net/"
                  >
                    Routing Information Service (RIS)
                  </a>
                </li>
                <li>
                  University of Oregon's{" "}
                  <a
                      className="a-fake text-color-link"
                      href="http://www.routeviews.org/"
                  >
                    Route Views Project
                  </a>
                </li>
              </ul>
              <h2 className="text-2xl font-semibold mt-6">
                Internet Background Radiation Data
              </h2>
              <ul style={{listStyle: "inside"}}>
                <li>
                  The{" "}
                  <a
                      className="a-fake text-color-link"
                      href="https://www.merit.edu/initiatives/orion-network-telescope/"
                  >
                    Merit Network Telescope
                  </a>
                </li>
              </ul>
              <h2 className="text-2xl font-semibold mt-6">Active Probing Data</h2>
              <ul style={{listStyle: "inside"}}>
                <li>Active measurements conducted from Georgia Tech servers.</li>
              </ul>
            </div>
          </div>

          <div className="mb-24">
            <Alert
                showIcon
                description={
                  <p className="text-2xl font-med">
                    For inquiries or feedback please contact the IODA team at
                    Georgia Tech's{" "}
                    <a
                        className="a-fake text-color-link"
                        href="https://inetintel.notion.site/Internet-Intelligence-Research-Lab-d186184563d345bab51901129d812ed6"
                        target="_blank"
                    >
                      Internet Intelligence Lab
                    </a>
                    : ioda-info@cc.gatech.edu.
                  </p>
                }
            />
          </div>
        </div>
    )
}

export default About;
