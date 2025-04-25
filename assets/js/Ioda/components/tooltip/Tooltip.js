import React, { Component } from "react";
import { Button, Popover } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

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
    >
      <Button
        className={className}
        type="link"
        color="primary"
        shape="circle"
        icon={<QuestionCircleOutlined />}
        size="small"
      />
    </Popover>
  );
};

export default React.memo(Tooltip);
