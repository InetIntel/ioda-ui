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

import React, { useEffect, useState } from "react";
import {
  Select,
  Typography,
  Card,
  Row,
  Col,
  Tabs,
  Input,
  Button,
  Dropdown,
} from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { Helmet } from "react-helmet";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
import download_icon from "images/resources/download-icon.png";
import link_resources from "./LinkConstants";
import text_resources from "./TextConstants";
import { useLocation, useNavigate } from "react-router-dom";

import "./Resources.css";

const FilterComponent = ({ resources, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);

  const [selectedProfessions, setSelectedProfessions] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState([]);
  const [selectedExpertise, setSelectedExpertise] = useState([]);

  const [professionsOptions, setProfessionsOptions] = useState([]);
  const [communityOptions, setCommunityOptions] = useState([]);
  const [expertiseOptions, setExpertiseOptions] = useState([]);

  useEffect(() => {
    const professionsSet = new Set();
    const communitySet = new Set();
    const expertiseSet = new Set();

    resources.forEach((resource) => {
      resource.tags.user?.forEach((tag) => professionsSet.add(tag));
      resource.tags.community?.forEach((tag) => communitySet.add(tag));
      resource.tags.expertise?.forEach((tag) => expertiseSet.add(tag));
    });

    setProfessionsOptions([...professionsSet]);
    setCommunityOptions([...communitySet]);
    setExpertiseOptions([...expertiseSet]);
  }, [resources]);

  const toggleSelection = (value, selected, setSelected) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const handleApplyFilters = () => {
    onFilterChange({
      searchQuery,
      professions: selectedProfessions,
      community: selectedCommunity,
      expertise: selectedExpertise,
    });
    setOpen(false);
  };

  const filterMenu = (
    <div
      className="filter-menu-box"
      style={{ marginTop: "6px" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="filter-header">
        <span>Filter By Categories</span>
        <Button
          type="default"
          // size="small"
          className="save-button"
          onClick={handleApplyFilters}
        >
          Save
        </Button>
      </div>

      <div className="filter-section">
        <div className="filter-label">Community</div>
        <div className="pill-container">
          {communityOptions.map((item) => (
            <div
              key={item}
              className={`pill ${
                selectedCommunity.includes(item) ? "pill-selected" : ""
              }`}
              onClick={() =>
                toggleSelection(item, selectedCommunity, setSelectedCommunity)
              }
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-label">User</div>
        <div className="pill-container">
          {professionsOptions.map((item) => (
            <div
              key={item}
              className={`pill ${
                selectedProfessions.includes(item) ? "pill-selected" : ""
              }`}
              onClick={() =>
                toggleSelection(
                  item,
                  selectedProfessions,
                  setSelectedProfessions
                )
              }
            >
              {item}
            </div>
          ))}
        </div>
      </div>
      <div className="filter-section">
        <div className="filter-label">Expertise</div>
        <div className="pill-container">
          {expertiseOptions.map((item) => (
            <div
              key={item}
              className={`pill ${
                selectedExpertise.includes(item) ? "pill-selected" : ""
              }`}
              onClick={() =>
                toggleSelection(item, selectedExpertise, setSelectedExpertise)
              }
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ width: "100%", maxWidth: "900px", marginTop: "250px" }}>
      <Row gutter={[10, 12]} align="middle" justify="center">
        {/* Search Input */}
        <Col span={14}>
          <Input
            placeholder="Search by Keywords"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ height: "35px", borderRadius: "8px" }}
          />
        </Col>
        <Col span={3}>
          <Dropdown
            open={open}
            onOpenChange={setOpen}
            dropdownRender={() => filterMenu}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              icon={<FilterOutlined />}
              onClick={() => setOpen(!open)}
              style={{
                height: "35px",
                borderRadius: "8px",
                width: "100%",
                border: "1px solid #2e76ff",
                color: "#2e76ff",
              }}
            >
              Filter
            </Button>
          </Dropdown>
        </Col>
        <Col span={3}>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleApplyFilters}
            style={{ height: "35px", borderRadius: "8px", width: "100%" }}
          >
            Search
          </Button>
        </Col>
      </Row>
    </div>
  );
};

const TextResource = ({ title, content }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={{ marginBottom: "20px" }}>
      <Title
        level={3}
        // style={{ cursor: "pointer", color: "#1890ff", paddingLeft: "50px" }}
        // onClick={() => setExpanded(!expanded)}
        style={{ color: "#1890ff", paddingLeft: "20px" }}
      >
        {title}
      </Title>
      {expanded && (
        <div style={{ paddingLeft: "40px" }}>
          <Paragraph>{content}</Paragraph>
        </div>
      )}
    </div>
  );
};

const Resources = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const getActiveTabFromURL = () => {
    const params = new URLSearchParams(location.search);
    return params.get("tab") || "tutorials";
  };
  const [activeTab, setActiveTab] = useState(getActiveTabFromURL);
  const [filters, setFilters] = useState({
    searchQuery: "",
    professions: [],
    community: [],
    expertise: [],
  });
  useEffect(() => {
    setActiveTab(getActiveTabFromURL);
  }, [location]);
  const handleTabChange = (key) => {
    setActiveTab(key);
    navigate(`?tab=${key}`, { replace: true });
  };

  const printableResources = link_resources.filter(
    (resource) => resource.tab === "printable"
  );
  const filteredResources = (tab, filters) => {
    return link_resources
      .filter((resource) => resource.tab === tab)
      .filter((resource) => {
        if (filters.searchQuery.length === 0) return true;
        return resource.title
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase());
      })
      .filter((resource) => {
        if (filters.professions.length === 0) return true;
        return resource.tags.user?.some((tag) =>
          filters.professions.includes(tag)
        );
      })
      .filter((resource) => {
        if (filters.community.length === 0) return true;
        return resource.tags.community.some((tag) =>
          filters.community.includes(tag)
        );
      })
      .filter((resource) => {
        if (filters.expertise.length === 0) return true;
        return resource.tags.expertise.some((tag) =>
          filters.expertise.includes(tag)
        );
      });
  };

  const getTagClass = (tag, category, selectedTags) => {
    let classes = "tag-base";

    if (category === "profession") classes += " tag-profession";
    if (category === "community") classes += " tag-community";
    if (category === "expertise") classes += " tag-expertise";

    if (selectedTags.includes(tag)) {
      classes += " tag-selected";
    }

    return classes;
  };

  const renderLinkResources = (tab) => {
    const resources = filteredResources(tab, filters);

    return (
      <>
        <div className="resources-container">
          <Row gutter={[16, 16]} justify="left" style={{ padding: "0 8px" }}>
            {resources.map((resource, index) => (
              <Col
                xs={24}
                sm={12}
                md={8}
                style={{ minWidth: "300px" }}
                key={index}
              >
                <Card
                  hoverable
                  style={{
                    textAlign: "left",
                    borderRadius: "2px",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                    cursor: "default",
                    minHeight: resource.tab === "research" ? "370px" : "325px",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
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
                          width: "100%",
                          height: "130px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    )}
                  </div>
                  <Text style={{ fontSize: "14px", color: "#A6A6A6" }}>
                    {resource.type}
                  </Text>
                  <Title level={5} style={{ margin: "6px 0" }}>
                    {resource.title}
                  </Title>
                  {/* Tags Section */}
                  <div
                    style={{
                      position: "absolute",
                      top: resource.tab === "research" ? "285px" : "235px",
                      // marginTop: "8px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "4px",
                    }}
                  >
                    {resource.tags.community?.map((tag) => (
                      <span
                        key={tag}
                        className={getTagClass(
                          tag,
                          "community",
                          filters.community
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                    {resource.tags.user?.map((tag) => (
                      <span
                        key={tag}
                        className={getTagClass(
                          tag,
                          "profession",
                          filters.professions
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                    {resource.tags.expertise?.map((tag) => (
                      <span
                        key={tag}
                        className={getTagClass(
                          tag,
                          "expertise",
                          filters.expertise
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {resource.category !== "video" && (
                    <a
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        position: "absolute",
                        top: "155px",
                        right: "10px",
                      }}
                    >
                      <img
                        src={download_icon}
                        alt="Download"
                        style={{ width: "34px", height: "34px" }}
                      />
                    </a>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </>
    );
  };

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
              View and download our guides, tutorials, and presentations to
              learn about IODA's signals and how to use IODA data to monitor
              Internet connectivity and disruptions.
            </Paragraph>
          </div>
          <FilterComponent
            resources={link_resources}
            onFilterChange={setFilters}
          />
        </div>
        <div
          style={{
            width: "100%",
            maxWidth: "900px",
            minWidth: "300px",
            margin: "0 auto",
          }}
        >
          <Tabs
            activeKey={activeTab}
            // onChange={(key) => setActiveTab(key)}
            onChange={handleTabChange}
            centered
            style={{
              // marginBottom: "40px",
              marginTop: "-250px",
              maxWidth: "900px",
              // textAlign: "left",
              width: "100%",
            }}
          >
            <Tabs.TabPane tab="Tutorials" key="tutorials">
              {renderLinkResources("tutorials")}
            </Tabs.TabPane>
            <Tabs.TabPane tab="Research" key="research">
              {renderLinkResources("research")}
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
