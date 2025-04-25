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
import {
  SearchOutlined,
  FilterOutlined,
  CloseCircleFilled,
} from "@ant-design/icons";
import { Helmet } from "react-helmet";

const { Title, Paragraph, Text } = Typography;

import download_icon from "images/resources/download-icon.png";
import link_resources from "./LinkConstants";
import text_resources from "./TextConstants";
import { useLocation, useNavigate } from "react-router-dom";

const FilterComponent = ({
  resources,
  onFilterChange,
  initialSearchQuery = "",
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || "");
  const [open, setOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState([]);
  const [communityOptions, setCommunityOptions] = useState([]);

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  useEffect(() => {
    const communitySet = new Set();
    resources.forEach((resource) => {
      resource.tags?.community?.forEach((tag) => communitySet.add(tag));
    });
    setCommunityOptions([...communitySet]);
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
      community: selectedCommunity,
    });
    setOpen(false);
  };

  const handleSearch = () => {
    handleApplyFilters();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    onFilterChange({
      searchQuery: "",
      community: selectedCommunity,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
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
    </div>
  );

  return (
    <div style={{ width: "100%", maxWidth: "900px", marginTop: "-350px" }}>
      <Row gutter={[10, 12]} align="middle" justify="center">
        <Col span={14}>
          <div style={{ position: "relative" }}>
            <Input
              placeholder="Search by Keywords"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown} // Update on Enter key press
              style={{
                height: "35px",
                borderRadius: "8px",
                paddingRight: "30px",
              }}
            />
            {searchQuery && (
              <CloseCircleFilled
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#999",
                }}
                onClick={handleClearSearch}
              />
            )}
          </div>
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
            onClick={handleSearch}
            style={{ height: "35px", borderRadius: "8px", width: "100%" }}
          >
            Search
          </Button>
        </Col>
      </Row>
    </div>
  );
};

const TextResource = ({ title, content, searchQuery }) => {
  const highlightText = (node, query) => {
    if (!query) return node;
    // perform highlighting
    if (typeof node === "string") {
      const parts = node.split(new RegExp(`(${query})`, "gi"));
      return parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={index} style={{ backgroundColor: "yellow" }}>
            {part}
          </span>
        ) : (
          part
        )
      );
    }
    if (Array.isArray(node)) {
      return node.map((child, index) => highlightText(child, query));
    }
    if (React.isValidElement(node)) {
      return React.cloneElement(node, {
        children: React.Children.map(node.props.children, (child) =>
          highlightText(child, query)
        ),
      });
    }
    return node;
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <Title level={3}>{highlightText(title, searchQuery)}</Title>
      <Paragraph>{highlightText(content, searchQuery)}</Paragraph>
    </div>
  );
};

const Resources = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("tab") || "tutorials";
  });
  const params = new URLSearchParams(location.search);
  const initialSearch = params.get("search") || "";

  const [filters, setFilters] = useState({
    searchQuery: initialSearch,
    community: [],
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newQuery = params.get("search") || "";

    setFilters((prev) => ({
      ...prev,
      searchQuery: newQuery,
    }));
    // }
  }, [location.search]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    const params = new URLSearchParams(location.search);
    if (filters.searchQuery) {
      params.set("search", filters.searchQuery);
    } else {
      params.delete("search");
    }
    params.set("tab", key);
    navigate(`?${params.toString()}`, { replace: true });
  };

  // Filter for link-based resources
  const filteredResources = (tab, filters) => {
    const resources = link_resources
      .filter((res) => res.tab === tab)
      // Filter by search
      .filter((res) =>
        filters.searchQuery
          ? res.title.toLowerCase().includes(filters.searchQuery.toLowerCase())
          : true
      )
      // Filter by selected community tags
      .filter((res) => {
        if (!filters.community.length) return true;
        return (
          res.tags.community &&
          res.tags.community.some((tag) => filters.community.includes(tag))
        );
      });

    return { resources, count: resources.length };
  };
  function extractTextFromReact(node) {
    if (typeof node === "string") {
      return node;
    }
    if (Array.isArray(node)) {
      return node.map(extractTextFromReact).join(" ");
    }
    if (React.isValidElement(node)) {
      return extractTextFromReact(node.props.children);
    }
    return "";
  }

  const countTextMatches = (tab, filters) => {
    return text_resources
      .filter((text) => text.tab === tab)
      .reduce((count, text) => {
        const regex = new RegExp(filters.searchQuery, "gi");
        const titleMatches = (String(text.title).match(regex) || []).length;
        const contentString = extractTextFromReact(text.content);
        const contentMatches = (contentString.match(regex) || []).length;
        return count + titleMatches + contentMatches;
      }, 0);
  };

  const [resourceCounts, setResourceCounts] = useState({
    tutorials: 0,
    research: 0,
    glossary: 0,
    repositories: 0,
  });

  useEffect(() => {
    const tutorialsCount = filteredResources("tutorials", filters).count;
    const researchCount = filteredResources("research", filters).count;
    const glossaryCount = countTextMatches("glossary", filters);
    const repositoriesCount = countTextMatches("repo", filters);

    setResourceCounts({
      tutorials: tutorialsCount,
      research: researchCount,
      glossary: glossaryCount,
      repositories: repositoriesCount,
    });
  }, [filters]);

  const getTagClass = (tag, selectedTags) => {
    let classes = "tag-base tag-community";
    if (selectedTags.includes(tag)) {
      classes += " tag-selected";
    }
    return classes;
  };

  const renderLinkResources = (tab) => {
    const { resources } = filteredResources(tab, filters);
    return (
      <div className="resources-container" style={{ marginTop: "20px" }}>
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
                  minHeight: resource.tab === "research" ? "320px" : "320px",
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
                    top: resource.tab === "research" ? "285px" : "285px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "4px",
                  }}
                >
                  {resource.tags.community?.map((tag) => (
                    <span
                      key={tag}
                      className={getTagClass(tag, filters.community)}
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
    );
  };

  const renderTextResources = (tab) => {
    return (
      <div style={{ padding: "5px", marginTop: "20px" }}>
        {text_resources
          .filter((text) => text.tab === tab)
          .map((text, index) => (
            <TextResource
              key={index}
              title={text.title}
              content={text.content}
              searchQuery={filters.searchQuery}
            />
          ))}
      </div>
    );
  };

  return (
    <div
      className="max-cont project-info"
      style={{ maxWidth: "100%", padding: "0" }}
    >
      <Helmet>
        <title>IODA | Resources</title>
        <meta name="description" content="Resource hub for IODA users." />
      </Helmet>

      {/* Top banner and heading */}
      <div
        className="ioda-container"
        style={{
          position: "relative",
          textAlign: "center",
          marginBottom: "50px",
        }}
      >
        <div
          className="overlay-text"
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
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
            View and download our guides, tutorials, and presentations to learn
            about IODA's signals and how to use IODA data to monitor Internet
            connectivity and disruptions.
          </Paragraph>
        </div>
      </div>

      <FilterComponent
        resources={link_resources}
        onFilterChange={setFilters}
        initialSearchQuery={filters.searchQuery}
      />

      <div style={{ width: "100%", maxWidth: "900px", margin: "30px auto" }}>
        <Tabs activeKey={activeTab} onChange={handleTabChange} centered>
          <Tabs.TabPane
            tab={`Tutorials (${resourceCounts.tutorials})`}
            key="tutorials"
          >
            {renderLinkResources("tutorials")}
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={`Research (${resourceCounts.research})`}
            key="research"
          >
            {renderLinkResources("research")}
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={`Glossary${
              filters.searchQuery ? ` (${resourceCounts.glossary})` : ""
            }`}
            key="glossary"
          >
            {renderTextResources("glossary")}
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={`Repositories and Data Access${
              filters.searchQuery ? ` (${resourceCounts.repositories})` : ""
            }`}
            key="repositories"
          >
            {renderTextResources("repo")}
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default Resources;
