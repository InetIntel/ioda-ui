/*
 * This software is Copyright (c) 2013 The Regents of the University of
 * California. All Rights Reserved. Permission to copy, modify, and distribute this
 * software and its documentation for academic research and education purposes,
 * without fee, and without a written agreement is hereby granted, provided that
 * the above copyright notice, this paragraph and the following three paragraphs
 * appear in all copies. Permission to make use of this software for other than
 * academic research and education purposes may be obtained by contacting:
 *
 * Office of Innovation and Commercialization
 * 9500 Gilman Drive, Mail Code 0910
 * University of California
 * La Jolla, CA 92093-0910
 * (858) 534-5815
 * invent@ucsd.edu
 *
 * This software program and documentation are copyrighted by The Regents of the
 * University of California. The software program and documentation are supplied
 * "as is", without any accompanying services from The Regents. The Regents does
 * not warrant that the operation of the program will be uninterrupted or
 * error-free. The end-user understands that the program was developed for research
 * purposes and is advised not to rely exclusively on the program for any reason.
 *
 * IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY FOR
 * DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST
 * PROFITS, ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH
 * DAMAGE. THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE PROVIDED HEREUNDER IS ON AN "AS
 * IS" BASIS, AND THE UNIVERSITY OF CALIFORNIA HAS NO OBLIGATIONS TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 */

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

import React, { memo } from "react";
import { Layout, Row, Col, Typography, Space } from "antd";

const { Footer } = Layout;
const { Link, Text } = Typography;
import gatechLogo from "images/logos/gatech_white.svg";
import labLogo from "images/logos/iil_logo.png";

const AppFooter = () => {
  return (
    <Footer style={{ background: "#1e2430", padding: "40px", color: "white" }}>
      <Row gutter={[0, 24]}>
        <Col xs={24} md={16}>
          <Row gutter={[48, 24]}>
            <Col xs={12} sm={6}>
              <Text
                style={{
                  color: "white",
                  display: "block",
                  marginBottom: "24px",
                  fontSize: "12px",
                }}
              >
                Support
              </Text>
              <Space direction="vertical" size={12}>
                <Link href="/resources" style={{ color: "white" }}>
                  Resources
                </Link>
                <Link href="/about" style={{ color: "white" }}>
                  About
                </Link>
                <Link
                  href="mailto:ioda-info@cc.gatech.edu"
                  style={{ color: "white" }}
                >
                  Email Us
                </Link>
              </Space>
            </Col>

            <Col xs={12} sm={6}>
              <Text
                style={{
                  color: "white",
                  display: "block",
                  marginBottom: "24px",
                  fontSize: "12px",
                }}
              >
                Researchers
              </Text>
              <Space direction="vertical" size={12}>
                <Link href="/resources?tab=research" style={{ color: "white" }}>
                  Research
                </Link>
                <Link href="/reports" style={{ color: "white" }}>
                  Reports
                </Link>
                <Link href="/resources?tab=terms" style={{ color: "white" }}>
                  Data Sources
                </Link>
              </Space>
            </Col>

            <Col xs={12} sm={6}>
              <Text
                style={{
                  color: "white",
                  display: "block",
                  marginBottom: "24px",
                  fontSize: "12px",
                }}
              >
                Developers
              </Text>
              <Space direction="vertical" size={12}>
                <Link
                  href="https://api.ioda.inetintel.cc.gatech.edu/v2/"
                  style={{ color: "white" }}
                >
                  API
                </Link>
              </Space>
            </Col>

            <Col xs={12} sm={6}>
              <Text
                style={{
                  color: "white",
                  display: "block",
                  marginBottom: "24px",
                  fontSize: "12px",
                }}
              >
                Connect
              </Text>
              <Space direction="vertical" size={12}>
                <Link
                  href="https://bsky.app/profile/ioda.live"
                  style={{ color: "white" }}
                >
                  Bluesky
                </Link>
                <Link
                  href="https://mastodon.social/@IODA"
                  style={{ color: "white" }}
                >
                  Mastodon
                </Link>
              </Space>
            </Col>
          </Row>
        </Col>

        <Col xs={24} md={8} style={{ alignContent: "center" }}>
          <Row justify="center" gutter={[24, 16]} align="middle">
            <Col xs={12} sm={8} md={10}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <a
                  href="https://inetintel.cc.gatech.edu/"
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img
                      src={labLogo}
                      alt="Internet Intelligence Lab Logo"
                      style={{
                        height: "64px",
                        width: "auto",
                        marginRight: "15px",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        color: "white",
                      }}
                    >
                      <span style={{ fontSize: "20px", lineHeight: "1.5" }}>
                        Internet
                      </span>
                      <span style={{ fontSize: "20px", lineHeight: "1.5" }}>
                        Intelligence
                      </span>
                      <span style={{ fontSize: "20px", lineHeight: "1.5" }}>
                        Lab
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            </Col>

            <Col xs={12} sm={8} md={10} style={{ alignItems: "center" }}>
              <a
                href="https://www.gatech.edu"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <img
                  src={gatechLogo}
                  alt="Georgia Institute of Technology"
                  style={{
                    height: "64px",
                    maxWidth: "100%",
                    objectFit: "contain",
                  }}
                />
              </a>
              <div style={{ textAlign: "center", marginTop: "8px" }}>
                <Text style={{ color: "white", fontSize: "8px" }}>
                  © 2025 Georgia Institute of Technology
                </Text>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Footer>
  );
};

export default memo(AppFooter);
