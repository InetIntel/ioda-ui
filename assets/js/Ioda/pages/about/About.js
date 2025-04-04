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
import React, { useEffect } from "react";
import { Typography, Card, Row, Col } from "antd";
const { Title, Paragraph } = Typography;
import Mission from './MissionSection';
import AcknowledgementSection from "./AcknowledgementSection";
// Internationalization

import { Helmet } from "react-helmet";

import { Alert } from "antd";

//Images
import worldmap from "images/about/world-map-background.png";
import worldMapBackground from 'images/about/world-map-background.png';

const About = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);
    return (
        <div className="max-cont project-info" style={{
            maxWidth: "100%",
            padding: "0"
        }}>
            <Helmet>
                <title>IODA | About</title>
                <meta
                    name="description"
                    content="More detailed information about the IODA project."
                />
            </Helmet>

            <div className="world-map-section">
                <div className="world-map-container">
                    <img src={worldmap} alt="World Map" className="world-map-image"/>
                    <div className="world-map-content">
                        <Title
                            level={2}
                            className="world-map-title">
                            Measuring and Detecting Internet Outages Worldwide in Real-Time
                        </Title>
                        <Paragraph className="world-map-paragraph">
                            Users across the globe rely on IODA to track and monitor Internet connectivity. IODA also
                            provides a valuable
                            open-data source for the technical research community that inspires collaboration and spurs
                            researchers to
                            publish scientific literature in the Internet measurement space.
                        </Paragraph>
                    </div>
                </div>
            </div>
            <Mission/>
            <AcknowledgementSection />

            <div className="mb-24" style={{margin: '40px'}}>
                <Alert
                    showIcon
                    description={
                        <p className="text-2xl font-med">
                            For inquiries or feedback please contact the IODA team at
                            Georgia Tech's{" "}
                            <a
                                className="a-fake text-color-link"
                                href="http://inetintel.cc.gatech.edu/"
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
