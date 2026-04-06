import React, { useEffect, useState } from "react";
import { Button, Popover } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

const MOBILE_TOOLTIP_BREAKPOINT = 678;

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
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth <= MOBILE_TOOLTIP_BREAKPOINT
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= MOBILE_TOOLTIP_BREAKPOINT);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const resolvedPlacement =
    isMobileScreen &&
    (placement === "left" ||
      placement === "leftTop" ||
      placement === "leftBottom" ||
      placement === "right" ||
      placement === "rightTop" ||
      placement === "rightBottom")
      ? "bottom"
      : placement;

  return (
    <Popover
      placement={resolvedPlacement}
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
