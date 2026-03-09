import React from "react";
import { Button, Popover } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

const Tooltip = ({
  title,
  text,
  customCode,
  className,
  children,
  trigger = "hover",
  placement = "right",
  open,
  onOpenChange,
  overlayStyle,
  overlayClassName = "ioda-help-tooltip",
  color = "rgba(0, 0, 0, 0.9)",
}) => {
  return (
    <Popover
      placement={placement}
      title={title}
      content={customCode ?? text}
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      overlayStyle={overlayStyle ?? { maxWidth: "275px" }}
      overlayClassName={overlayClassName}
      color={color}
    >
      {children ?? (
        <Button
          className={className}
          type="link"
          color="primary"
          shape="circle"
          icon={<QuestionCircleOutlined />}
          size="small"
        />
      )}
    </Popover>
  );
};

export default React.memo(Tooltip);
