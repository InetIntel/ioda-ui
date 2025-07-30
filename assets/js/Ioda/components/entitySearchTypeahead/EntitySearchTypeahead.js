import React, { useState } from "react";
import { fetchData } from "../../data/ActionCommons";
import T from "i18n-react";
import { v4 as uuidv4 } from "uuid";
import { Select } from "antd";
import clsx from "clsx";
import { debounce } from "lodash";

const MAX_LIMITS = 11;

const SearchInput = ({ onSelect, className, placeholder, size }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (newSearchText) => {
    setSearchText(newSearchText);
    if (newSearchText.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const url = `/entities/query?limit=${MAX_LIMITS}&search=${encodeURIComponent(
        newSearchText.trim()
      )}`;
      const fetched = await fetchData({ url });
      const results = (fetched?.data?.data ?? []).map((entity) => ({
        label: entity.name,
        id: uuidv4(),
        entity: {
          name: entity.name,
          code: entity.code,
          type: entity.type,
        },
      }));
      setSearchResults(results);
    } finally {
      setLoading(false);
    }
  };

  const debouncedHandleSearch = debounce(handleSearch, 200);

  const handleSelect = (id) => {
    const entity = searchResults.find((d) => d.id === id)?.entity ?? null;
    if (!entity) return;
    onSelect(entity);
  };

  const handleChange = (newSearchText) => {
    setSearchText(newSearchText);
  };

  const searchBarPlaceholder = T.translate("home.searchBarPlaceholder");

  const searchResultOptions = (searchResults || []).map((d) => ({
    value: d.id,
    label: d.label,
  }));

  const notFoundContent = loading ? (
    <div className="p-2">Loading...</div>
  ) : searchText?.trim() ? (
    <div className="p-2">No results found</div>
  ) : null;

  return (
    <Select
      className={clsx("w-full", className)}
      showSearch
      allowClear
      size={size ?? "medium"}
      value={searchText ? searchText : undefined}
      placeholder={searchBarPlaceholder ?? placeholder}
      defaultActiveFirstOption={true}
      suffixIcon={null}
      filterOption={false}
      onSearch={debouncedHandleSearch}
      onChange={handleChange}
      onSelect={handleSelect}
      notFoundContent={notFoundContent}
      options={searchResultOptions}
      style={{
        minWidth: 200,
        textAlign: "left",
      }}
    />
  );
};

export default SearchInput;
