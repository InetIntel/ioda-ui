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
import tutorial_1 from "images/resources/tutorial-1.png";
import tutorial_2 from "images/resources/tutorial-2.png";
import tutorial_3 from "images/resources/tutorial-3.png";
import tutorial_4 from "images/resources/tutorial-4.png";
import tutorial_5 from "images/resources/tutorial-5.png";
import tutorial_6 from "images/resources/tutorial-6.png";
import tutorial_7 from "images/resources/tutorial-7.png";
import tutorial_8 from "images/resources/tutorial-8.png";
import tutorial_9 from "images/resources/tutorial-9.png";
import tutorial_10 from "images/resources/tutorial-10.png";
import tutorial_11 from "images/resources/tutorial-11.png";
import tutorial_12 from "images/resources/tutorial-12.png";
import tutorial_13 from "images/resources/tutorial-13.png";

const link_resources = [
  {
    title: "How to use IODA for Less Technical Users",
    type: "PDF",
    link: "https://inetintel.github.io/IODA-site-files/files/UserResources/Tutorials/UserGuide-PDFforprint.pdf",
    thumbnail: print_1,
    category: "file",
    tab: "tutorials",
    tags: {
      community: ["Internet Freedom"],
      user: ["Activist", "Lawyer", "Advocate", "Researcher", "Journalist"],
      expertise: ["beginner"],
    },
  },
  {
    title: "How to use IODA for Less Technical Users",
    type: "PNG",
    link: "https://inetintel.github.io/IODA-site-files/files/UserResources/Tutorials/UserGuide.png",
    thumbnail: print_2,
    category: "file",
    tab: "tutorials",
    tags: {
      community: ["Internet Freedom"],
      user: ["Activist", "Lawyer", "Advocate", "Researcher", "Journalist"],
      expertise: ["beginner"],
    },
  },
  {
    title: "IODA for Journalists",
    type: "PDF",
    link: "https://inetintel.github.io/IODA-site-files/files/UserResources/Tutorials/JournalistBrochurePDF.pdf",
    thumbnail: print_3,
    category: "file",
    tab: "tutorials",
    tags: {
      community: ["Internet Freedom"],
      user: ["Journalist"],
      expertise: ["beginner"],
    },
  },
  {
    title: "IODA Journalist Infographic",
    type: "PNG",
    link: "https://inetintel.github.io/IODA-site-files/files/UserResources/Tutorials/IODAJournalistInfographic.png",
    category: "file",
    tab: "tutorials",
    thumbnail: tutorial_13,
    tags: {
      community: ["Internet Measurement"],
    },
  },
  {
    title: "Why IODA is important in the Internet Freedom Community",
    type: "Video",
    link: "https://www.youtube.com/embed/YjsZoSyRbDQ",
    category: "video",
    tab: "tutorials",
    tags: {
      community: ["Internet Freedom"],
      user: ["Activist", "Lawyer", "Advocate", "Researcher", "Journalist"],
      expertise: ["beginner"],
    },
  },
  {
    title: "What IODA does and does not measure",
    type: "Video",
    link: "https://www.youtube.com/embed/ZPtFQgtjiSw",
    category: "video",
    tab: "tutorials",
    tags: {
      community: ["Internet Freedom"],
      user: ["Activist", "Lawyer", "Advocate", "Researcher", "Journalist"],
      expertise: ["beginner"],
    },
  },
  {
    title:
      "Introduction to IODA’s measurements: Active Probing, Routing Announcements (BGP), and Telescope",
    type: "Video",
    link: "https://www.youtube.com/embed/xvV9kTOb4J8",
    category: "video",
    tab: "tutorials",
    tags: {
      community: ["Internet Freedom"],
      user: ["Activist", "Lawyer", "Advocate", "Researcher", "Journalist"],
      expertise: ["beginner"],
    },
  },
  {
    title: "How the Internet gets shutdown",
    type: "Video",
    link: "https://www.youtube.com/embed/uk4iBd94Rno",
    category: "video",
    tab: "tutorials",
    tags: {
      community: ["Internet Freedom"],
      user: ["Activist", "Lawyer", "Advocate", "Researcher", "Journalist"],
      expertise: ["beginner"],
    },
  },
  {
    title: "Case Study: How the Economist uses IODA",
    type: "Video",
    link: "https://www.youtube.com/embed/vhPkrj3288k",
    category: "video",
    tab: "tutorials",
    tags: {
      community: ["Internet Freedom"],
      user: ["Activist", "Lawyer", "Advocate", "Researcher", "Journalist"],
      expertise: ["beginner"],
    },
  },
  {
    title: "Case Study: How IODA measures Internet shutdowns in Iran",
    type: "Video",
    link: "https://www.youtube.com/embed/A70BwfEgP7s",
    category: "video",
    tab: "tutorials",
    tags: {
      community: ["Internet Freedom"],
      user: ["Activist", "Lawyer", "Advocate", "Researcher", "Journalist"],
      expertise: ["beginner"],
    },
  },
  {
    title: "How to use the IODA dashboard",
    type: "Video",
    link: "https://www.youtube.com/embed/yDpducExaOI",
    category: "video",
    tab: "tutorials",
    tags: {
      community: ["Internet Freedom"],
      user: ["Activist", "Lawyer", "Advocate", "Researcher", "Journalist"],
      expertise: ["beginner"],
    },
  },
  {
    title: "IODA in practice: Russia-Ukraine War",
    type: "Video",
    link: "https://www.youtube.com/embed/b9N6gpaLSPY",
    category: "video",
    tab: "tutorials",
    tags: {
      community: ["Internet Freedom"],
      user: ["Activist", "Lawyer", "Advocate", "Researcher", "Journalist"],
      expertise: ["beginner"],
    },
  },
  {
    title: "IODA in practice: Iran protests September - October 2022",
    type: "Video",
    link: "https://www.youtube.com/embed/8sEF0AljSvg",
    category: "video",
    tab: "tutorials",
    tags: {
      community: ["Internet Freedom"],
      user: ["Activist", "Lawyer", "Advocate", "Researcher", "Journalist"],
      expertise: ["beginner"],
    },
  },
  {
    title:
      "Technical multi-stakeholder report on Internet connectivity: The case of Sudan Conflict 2023",
    type: "PDF",
    link: "https://inetintel.github.io/IODA-site-files/files/UserResources/Research/SudanChad_ConnectivityDuringConflict.pdf",
    thumbnail: present_1,
    category: "file",
    tab: "research",
    tags: {
      community: ["Internet Freedom"],
      user: ["Activist", "Lawyer", "Advocate", "Researcher", "Journalist"],
      expertise: [],
    },
  },
  {
    title: "Gaza Connectivity: Internet Outages and Shutdowns, November 2023",
    type: "PDF",
    link: "https://inetintel.github.io/IODA-site-files/files/UserResources/Research/IODA-GazaInternetConnectivity-Nov2023.pdf ",
    thumbnail: present_2,
    category: "file",
    tab: "research",
    tags: {
      community: ["Internet Freedom"],
      user: ["Activist", "Lawyer", "Advocate", "Researcher", "Journalist"],
      expertise: [],
    },
  },
  {
    title: "IODA Jeopardy Game",
    type: "PPT",
    link: "https://inetintel.github.io/IODA-site-files/files/UserResources/Tutorials/IODAJeopardy.pptx",
    thumbnail: present_3,
    category: "file",
    tab: "tutorials",
    tags: {
      community: ["Internet Freedom"],
      user: ["Activist", "Advocate"],
      expertise: [],
    },
  },
  {
    title: "IODA Splintercon Presentation",
    type: "PDF",
    link: "https://inetintel.github.io/IODA-site-files/files/UserResources/Tutorials/SplinterCon-IODA.pdf",
    thumbnail: present_4,
    category: "file",
    tab: "tutorials",
    tags: {
      community: ["Internet Freedom"],
      user: ["Activist", "Lawyer", "Advocate", "Researcher", "Journalist"],
      expertise: ["beginner"],
    },
  },
  {
    title:
      "Destination Unreachable: Characterizing Internet Outages and Shutdowns",
    type: "Video",
    link: "https://www.youtube.com/embed/8m8ibnJsdTc",
    category: "video",
    tab: "research",
    tags: {
      community: ["Internet Freedom"],
      user: ["Activist", "Lawyer", "Advocate", "Researcher", "Journalist"],
      expertise: [],
    },
  },
  {
    title:
      "Technical multi-stakeholder report on Internet shutdowns: The case of Iran amid autumn 2022 protests",
    type: "PDF",
    link: "https://inetintel.github.io/IODA-site-files/files/UserResources/Research/TTCIranShutdownReport.pdf",
    thumbnail: tutorial_1,
    category: "file",
    tab: "research",
    tags: {
      community: ["Internet Freedom"],
      user: ["Activist", "Lawyer", "Advocate", "Researcher", "Journalist"],
      expertise: [],
    },
  },
  {
    title:
      "Destination Unreachable: Characterizing Internet Outages and Shutdowns (SIGCOMM'23)",
    type: "PDF",
    link: "https://dl.acm.org/doi/10.1145/3603269.3604883",
    thumbnail: tutorial_2,
    category: "file",
    tab: "research",
    tags: {
      community: ["Internet Freedom", "Internet Measurement"],
      user: ["Researcher"],
      expertise: [],
    },
  },
  {
    title: "How to Operate a Meta-Telescope in your Spare Time (IMC'23)",
    type: "PDF",
    link: "https://dl.acm.org/doi/10.1145/3618257.3624831",
    thumbnail: tutorial_3,
    category: "file",
    tab: "research",
    tags: {
      community: ["Internet Measurement"],
      user: ["Researcher"],
      expertise: [],
    },
  },
  {
    title:
      "Aggressive Internet-Wide Scanners: Network Impact and Longitudinal Characterization (CoNEXT'23)",
    type: "PDF",
    link: "https://dl.acm.org/doi/10.1145/3624354.3630583",
    thumbnail: tutorial_4,
    category: "file",
    tab: "research",
    tags: {
      community: ["Internet Measurement"],
      user: ["Researcher"],
      expertise: [],
    },
  },
  {
    title:
      "Towards Improving Outage Detection with Multiple Probing Protocols (PAM'24)",
    type: "PDF",
    link: "https://inetintel.github.io/IODA-site-files/files/UserResources/Research/TowardsImprovingOutageDetection.pdf",
    thumbnail: tutorial_5,
    category: "file",
    tab: "research",
    tags: {
      community: ["Internet Measurement"],
      user: ["Researcher"],
      expertise: [],
    },
  },
  {
    title:
      "Attack or Block? Repertoires of Digital Censorship in Autocracies (Journal of Information Technology & Politics '23)",
    type: "PDF",
    link: "https://inetintel.github.io/IODA-site-files/files/UserResources/Research/AttackorBlock.pdf",
    thumbnail: tutorial_6,
    category: "file",
    tab: "research",
    tags: {
      community: ["Internet Measurement", "Internet Freedom"],
      user: ["Researcher"],
      expertise: [],
    },
  },
  {
    title:
      "Spoki: Unveiling a New Wave of Scanners through a Reactive Network Telescope (USINEX Security '22)",
    type: "PDF",
    link: "https://faculty.cc.gatech.edu/~adainotti6/pubs/spoki.pdf",
    thumbnail: tutorial_7,
    category: "file",
    tab: "research",
    tags: {
      community: ["Internet Measurement"],
      user: ["Researcher"],
      expertise: [],
    },
  },
  {
    title:
      "Quantifying Nations' Exposure to Traffic Observation and Selective Tampering (PAM'22)",
    type: "PDF",
    link: "https://faculty.cc.gatech.edu/~adainotti6/pubs/CTI-pam2022.pdf",
    thumbnail: tutorial_8,
    category: "file",
    tab: "research",
    tags: {
      community: ["Internet Freedom"],
      user: ["Researcher"],
      expertise: [],
    },
  },
  {
    title: "Identifying ASes of State-owned Internet operators (IMC'21)",
    type: "PDF",
    link: "https://www.cc.gatech.edu/~adainotti6/pubs/imc2021-64.state_owned.pdf",
    thumbnail: tutorial_9,
    category: "file",
    tab: "research",
    tags: {
      community: ["Internet Measurement"],
      user: ["Researcher"],
      expertise: [],
    },
  },
  {
    title:
      "The parallel lives of Autonomous Systems: ASN Allocations vs. BGP (IMC'21)",
    type: "PDF",
    link: "https://www.cc.gatech.edu/~adainotti6/pubs/imc2021-231.parallel_lives.pdf",
    thumbnail: tutorial_10,
    category: "file",
    tab: "research",
    tags: {
      community: ["Internet Measurement"],
      user: ["Researcher"],
      expertise: [],
    },
  },
  {
    title:
      "A multi-perspective view of Internet censorship in Myanmar (FOCI'21)",
    type: "PDF",
    link: "https://www.cc.gatech.edu/~adainotti6/pubs/myanmar_foci21_cr.pdf",
    thumbnail: tutorial_11,
    category: "file",
    tab: "research",
    tags: {
      community: ["Internet Measurement", "Internet Freedom"],
      user: ["Researcher"],
      expertise: [],
    },
  },
  {
    title:
      "Estimating Internet Address Space Usage through Passive Measurements (SIGCOMM'14)",
    type: "PDF",
    link: "https://inetintel.github.io/IODA-site-files/files/UserResources/Research/passive_ip_space_usage_estimation.pdf",
    thumbnail: tutorial_12,
    category: "file",
    tab: "research",
    tags: {
      community: ["Internet Measurement"],
      user: ["Researcher"],
      expertise: [],
    },
  },
  {
    title: "IODA Graph Markup Tool",
    type: "Video",
    link: "https://www.youtube.com/embed/LYm_Yu6QMuM",
    category: "video",
    tab: "tutorials",
    tags: {
      community: ["Internet Freedom", "Internet Measurement"],
      user: ["Activist", "Lawyer", "Advocate", "Researcher", "Journalist"],
      expertise: [],
    },
  },
  {
    title:
      "IODA Animated Signal Explainer Video: Active Probing, BGP, and Telescope",
    type: "Video",
    link: "https://www.youtube.com/embed/lP9f-zWrfjo",
    category: "video",
    tab: "tutorials",
    tags: {
      community: ["Internet Freedom"],
    },
  },
];

export default link_resources;
