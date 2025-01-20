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

import React, { useState } from "react";
import { Typography, Card, Row, Col, Tabs } from "antd";
import { Helmet } from "react-helmet";

const { Title, Paragraph, Text } = Typography;

import print_1 from "images/resources/print-1.png";
import print_2 from "images/resources/print-2.png";
import print_3 from "images/resources/print-3.png";
import download_icon from "images/resources/download-icon.png";

const printableResources = [
  {
    title: "How to use IODA",
    date: "July 24, 2019",
    type: "PDF",
    link: "https://inetintel.github.io/IODA-site-files/files/brochure2024/Download_4Pages.pdf",
    thumbnail: print_1,
  },
  {
    title: "How to use IODA",
    date: "July 24, 2019",
    type: "PRINTABLE PAMPHLET",
    link: "https://inetintel.github.io/IODA-site-files/files/brochure2024/Download_4Pages.pdf",
    thumbnail: print_2,
  },
  {
    title: "IODA for Journalists",
    date: "July 24, 2019",
    type: "PRINTABLE PAMPHLET",
    link: "https://inetintel.github.io/IODA-site-files/files/brochure2024/Download_4Pages.pdf",
    thumbnail: print_3,
  },
];

const Resources = () => {
  const [activeTab, setActiveTab] = useState("printable");

  const renderPrintableResources = () => (
    <Row gutter={[16, 16]} justify="center">
      {printableResources.map((resource, index) => (
        <Col xs={24} sm={12} md={8} key={index}>
          {/* <a
            href={resource.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          > */}
          <Card
            hoverable
            style={{
              textAlign: "left",
              borderRadius: "2px",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            }}
            bodyStyle={{ padding: "13px" }}
          >
            <div
              style={{
                marginBottom: "16px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <img
                src={resource.thumbnail}
                alt={resource.title}
                style={{
                  width: "200px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            </div>
            <div>
              <Text
                style={{
                  font: "SF Pro Text",
                  fontSize: "14px",
                  color: "#A6A6A6",
                }}
              >
                {resource.type}
              </Text>
              <Title level={4} style={{ margin: "6px 0" }}>
                {resource.title}
              </Title>
              <Text
                style={{
                  color: "#A6A6A6",
                  fontSize: "12px",
                  font: "SF Pro Text",
                }}
              >
                <Text style={{ color: "#454545" }}> Last Updated - </Text>
                <Text style={{ color: "#A6A6A6" }}>{resource.date}</Text>
              </Text>
            </div>
            <a
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                position: "absolute",
                top: "150px",
                right: "15px",
              }}
            >
              <img
                src={download_icon}
                alt="Download"
                style={{
                  width: "40px",
                  height: "40px",
                }}
              />
            </a>
          </Card>
          {/* </a> */}
        </Col>
      ))}
    </Row>
  );

  return (
    <div
      className="max-cont project-info"
      style={{
        maxWidth: "100%",
        padding: "0",
      }}
    >
      <Helmet>
        <title>IODA | Resources</title>
        <meta name="description" content="Resource hub for IODA users." />
      </Helmet>

      <div className="mb-24">
        {/* Header Section */}
        <div
          className="ioda-container"
          style={{ position: "relative", textAlign: "center" }}
        >
          <div
            className="overlay-text"
            style={{
              position: "absolute",
              top: "30%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              width: "580px",
            }}
          >
            <Title
              level={1}
              style={{
                fontSize: "24px",
                fontWeight: 500,
                textAlign: "center",
                fontFamily: "Inter, sans-serif",
                color: "#1F2937",
                marginBottom: "30px",
                marginTop: "-50px",
              }}
            >
              IODA User Resource Hub
            </Title>
            <Paragraph
              style={{
                fontSize: "16px",
                fontWeight: 400,
                textAlign: "center",
                fontFamily: "Inter, sans-serif",
                color: "#494545",
                margin: 0,
              }}
            >
              View and download our screencasts, user guides, and animations to
              learn about IODA's signals and how to use IODA data to monitor
              Internet connectivity and disruptions.
            </Paragraph>
          </div>
        </div>
        {/* Tabs Section */}
        <Tabs
          centered
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          style={{
            marginBottom: "40px",
            marginTop: "-300px",
            width: "900px",
          }}
        >
          <Tabs.TabPane tab="Printable Resources" key="printable">
            {renderPrintableResources()}
          </Tabs.TabPane>
          <Tabs.TabPane tab="Screencasts" key="screencasts">
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Text style={{ color: "#888" }}>Screencasts will go here.</Text>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Technical Terms" key="terms">
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Text style={{ color: "#888" }}>
                Technical terms content will go here.
              </Text>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Repositories and Data Access" key="repositories">
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Text style={{ color: "#888" }}>
                Repository and data access content will go here.
              </Text>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default Resources;
