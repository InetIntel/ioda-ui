import React, { Component } from "react";
import { Button, Popover } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

class Tooltip extends Component {
  render() {
    const { title, text, customCode } = this.props;

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
          type="link"
          color="primary"
          shape="circle"
          icon={<QuestionCircleOutlined />}
          size="small"
        />
      </Popover>
    );
  }
}

export default Tooltip;
