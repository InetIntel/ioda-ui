import React, { Component } from "react";
import { Button, Popover } from "antd";
import { QuestionCircleFilled } from "@ant-design/icons";

const Tooltip = ({ title, text, customCode, className }) => {
  return (
    <Popover
      placement="right"
      title={title}
      content={customCode ?? text}
      trigger="hover"
      overlayStyle={{
        maxWidth: "275px",
      }}
      overlayClassName="ioda-help-tooltip"
      color="rgba(0, 0, 0, 0.9)"
      borderRadius="2px"
    >
      <Button
        className={`${className} question-tooltip-button`}
        type="link"
        shape="circle"
        color="rgba(0, 0, 0, 0.9)"
        icon={<QuestionCircleFilled />}
        size="small"
      />
    </Popover>
  );
};

export default Tooltip;
