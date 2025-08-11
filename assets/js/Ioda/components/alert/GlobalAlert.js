import React from "react";
import { Alert } from "antd";
import  ReactHtmlParser from "react-html-parser";

const GlobalAlert = ({ title, description, type }) => {
  // Only render the Alert if both title and type are provided
  if (title && type) {
    return (
      <Alert
        message={title}
        description={ReactHtmlParser(description)} // description is optional
        type={type}
        closable
        showIcon
        banner
      />
    );
  }

  // If title is provided but type is not, or if neither is provided, return null
  return null;
};

export default GlobalAlert;
