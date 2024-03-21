import React, { Component } from "react";
import { Button, Popover } from "antd";
import { QuestionCircleFilled } from "@ant-design/icons";

const Tooltip = ({ title, text, customCode, className }) => {
  return (
    <Popover
      placement="right"
      title={title}
      content={customCode ?? text}
      trigger="click"
      overlayStyle={{
        maxWidth: "275px",
        padding: "24px !important",
      }}
      overlayClassName="ioda-help-tooltip"
      color="rgba(0, 0, 0, 0.9)"
      padding="24px"
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
