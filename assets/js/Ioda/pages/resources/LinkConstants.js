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
import React, { Fragment } from "react";
import { Typography, Row, Col, Card } from "antd";
const { Text } = Typography;

import print_1 from "images/resources/print-1.png";
import print_2 from "images/resources/print-2.png";
import print_3 from "images/resources/print-3.png";
import present_1 from "images/resources/present-1.png";
import present_2 from "images/resources/present-2.png";
import present_3 from "images/resources/present-3.png";
import present_4 from "images/resources/present-4.png";

const link_resources = [
  {
    title: "How to use IODA for Less Technical Users",
    type: "PDF",
    link: "https://inetintel.github.io/IODA-site-files/files/UserResources/UserGuides/UserGuide-PDF-ForPrint.pdf",
    thumbnail: print_1,
    category: "file",
    tab: "printable",
    tags: ["tag1", "tag2"],
  },
  {
    title: "How to use IODA for Less Technical Users",
    type: "PNG",
    link: "https://inetintel.github.io/IODA-site-files/files/UserResources/UserGuides/UserGuide.png",
    thumbnail: print_2,
    category: "file",
    tab: "printable",
    tags: ["tag2"],
  },
  {
    title: "IODA for Journalists",
    type: "PDF",
    link: "https://inetintel.github.io/IODA-site-files/files/UserResources/UserGuides/JournalistBrochure-PDF.pdf",
    thumbnail: print_3,
    category: "file",
    tab: "printable",
    tags: ["tag3", "tag4"],
  },

  {
    title: "Why IODA is important in the Internet Freedom Community",
    type: "Video",
    link: "https://www.youtube.com/embed/YjsZoSyRbDQ",
    category: "video",
    tab: "screencast",
    tags: ["tag1"],
  },
  {
    title: "What IODA does and does not measure",
    type: "Video",
    link: "https://www.youtube.com/embed/ZPtFQgtjiSw",
    category: "video",
    tab: "screencast",
    tags: ["tag2"],
  },
  {
    title: "Introduction to IODA's measurements",
    type: "Video",
    link: "https://www.youtube.com/embed/xvV9kTOb4J8",
    category: "video",
    tab: "screencast",
    tags: ["tag3"],
  },
  {
    title: "How the Internet gets shutdown",
    type: "Video",
    link: "https://www.youtube.com/embed/uk4iBd94Rno",
    category: "video",
    tab: "screencast",
    tags: ["tag4"],
  },
  {
    title: "Case Study: How the Economist uses IODA",
    type: "Video",
    link: "https://www.youtube.com/embed/vhPkrj3288k",
    category: "video",
    tab: "screencast",
    tags: ["tag1"],
  },
  {
    title: "Case Study: How IODA measures Internet shutdowns in Iran",
    type: "Video",
    link: "https://www.youtube.com/embed/A70BwfEgP7s",
    category: "video",
    tab: "screencast",
    tags: ["tag2"],
  },
  {
    title: "How to use the IODA dashboard",
    type: "Video",
    link: "https://www.youtube.com/embed/yDpducExaOI",
    category: "video",
    tab: "screencast",
    tags: ["tag3"],
  },
  {
    title: "IODA in practice: Russia-Ukraine War",
    type: "Video",
    link: "https://www.youtube.com/embed/b9N6gpaLSPY",
    category: "video",
    tab: "screencast",
    tags: ["tag4"],
  },
  {
    title: "IODA in practice: Iran protests September - October 2022",
    type: "Video",
    link: "https://www.youtube.com/embed/8sEF0AljSvg",
    category: "video",
    tab: "screencast",
    tags: ["tag1"],
  },
  {
    title:
      "Technical multi-stakeholder report on Internet connectivity: The case of Sudan Conflict 2023",
    type: "PDF",
    link: "https://inetintel.github.io/IODA-site-files/files/UserResources/Presentations/SudanChad-ConnectivityDuringConflict.pdf",
    thumbnail: present_1,
    category: "file",
    tab: "present",
    tags: ["tag1"],
  },
  {
    title: "Gaza Connectivity: Internet Outages and Shutdowns, November 2023",
    type: "PDF",
    link: "https://inetintel.github.io/IODA-site-files/files/UserResources/Presentations/GazaInternetConnectivity-Nov2023.pdf",
    thumbnail: present_2,
    category: "file",
    tab: "present",
    tags: ["tag2"],
  },
  {
    title: "IODA Jeopardy Game",
    type: "PPT",
    link: "https://inetintel.github.io/IODA-site-files/files/UserResources/Presentations/IODA-Jeopardy.pptx",
    thumbnail: present_3,
    category: "file",
    tab: "present",
    tags: ["tag3"],
  },
  {
    title: "IODA Splintercon Presentation",
    type: "PDF",
    link: "https://inetintel.github.io/IODA-site-files/files/UserResources/Presentations/SplinterCon-IODA.pdf",
    thumbnail: present_4,
    category: "file",
    tab: "present",
    tags: ["tag4"],
  },
  {
    title:
      "Destination Unreachable: Characterizing Internet Outages and Shutdowns (SIGCOMM'23 S10)",
    type: "Video",
    link: "https://www.youtube.com/embed/8m8ibnJsdTc",
    category: "video",
    tab: "present",
    tags: ["tag1"],
  },
];

export default link_resources;
