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

import download_icon from "images/resources/download-icon.png";
import link_resources from "./LinkConstants";
import text_resources from "./TextConstants";

const TextResource = ({ title, content }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={{ marginBottom: "20px" }}>
      <Title
        level={3}
        // style={{ cursor: "pointer", color: "#1890ff", paddingLeft: "50px" }}
        // onClick={() => setExpanded(!expanded)}
        style={{ color: "#1890ff", paddingLeft: "50px" }}
      >
        {title}
      </Title>
      {expanded && (
        <div style={{ paddingLeft: "70px" }}>
          <Paragraph>{content}</Paragraph>
        </div>
      )}
    </div>
  );
};

const Resources = () => {
  const [activeTab, setActiveTab] = useState("printable");
  const renderLinkResources = (tab) => (
    <Row gutter={[16, 16]} justify="venter" style={{ padding: "0 8px" }}>
      {link_resources
        .filter((resource) => resource.tab === tab)
        .map((resource, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <Card
              hoverable
              style={{
                textAlign: "left",
                borderRadius: "2px",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                cursor: "default",
                minHeight: resource.tab === "present" ? "310px" : "280px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
              bodyStyle={{
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
              }}
            >
              <div
                style={{
                  marginBottom: "16px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {resource.category === "video" ? (
                  <iframe
                    width="100%"
                    height="130px"
                    src={resource.link}
                    title={resource.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ borderRadius: "8px" }}
                  ></iframe>
                ) : (
                  <img
                    src={resource.thumbnail}
                    alt={resource.title}
                    style={{
                      // width: "250px",
                      width: "100%",
                      height: "130px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                )}
              </div>
              <Text
                style={{
                  font: "SF Pro Text",
                  fontSize: "14px",
                  color: "#A6A6A6",
                }}
              >
                {resource.type}
              </Text>
              <Title level={5} style={{ margin: "6px 0" }}>
                {resource.title}
              </Title>

              {/* Tags Section */}
              {resource.tags && resource.tags.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "12px",
                    right: "12px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "5px",
                  }}
                >
                  {resource.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        background: "#f0f0f0",
                        color: "#333",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {resource.category !== "video" && (
                <a
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    right: "10px",
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
              )}
            </Card>
          </Col>
        ))}
    </Row>
  );

  const renderTextResources = (tab) => (
    <div style={{ padding: "5px" }}>
      {text_resources
        .filter((text) => text.tab === tab)
        .map((text, index) => (
          <TextResource key={index} title={text.title} content={text.content} />
        ))}
    </div>
  );

  return (
    <div
      className="max-cont project-info"
      style={{ maxWidth: "100%", padding: "0" }}
    >
      <Helmet>
        <title>IODA | Resources</title>
        <meta name="description" content="Resource hub for IODA users." />
      </Helmet>

      <div className="mb-24">
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
              // width: "580px",
              width: "100%",
              maxWidth: "580px",
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
        <div style={{ width: "100%" }}>
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
            style={{
              marginBottom: "40px",
              marginTop: "-300px",
              maxWidth: "900px",
            }}
          >
            <Tabs.TabPane tab="Printable Resources" key="printable">
              {renderLinkResources("printable")}
            </Tabs.TabPane>
            <Tabs.TabPane tab="Video Tutorials" key="screencasts">
              {renderLinkResources("screencast")}
            </Tabs.TabPane>
            <Tabs.TabPane tab="Presentations" key="presentations">
              {renderLinkResources("present")}
            </Tabs.TabPane>
            <Tabs.TabPane tab="Glossary" key="terms">
              {renderTextResources("technical")}
            </Tabs.TabPane>
            <Tabs.TabPane tab="Repositories and Data Access" key="repositories">
              {renderTextResources("repo")}
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Resources;
