import * as React from "react";
import { EditOutlined } from "@ant-design/icons";
import Icon from "@ant-design/icons/lib/components/Icon";
import { Button } from "antd";

export default function MarkupStudioEntry({ show, onStart }) {
  return (
    <div
      className="absolute z-1 text-center w-full h-full bg-white"
      style={{
        display: show ? "block" : "none",
      }}
    >
      <div className="flex justify-center items-center w-full h-full">
        <div className="w-1/2">
          <Icon
            className="mb-4"
            style={{ fontSize: "60px" }}
            component={EditOutlined}
          />
          <p className="text-3xl font-bold">Introducing the Markup Studio</p>
          <p className="text-2xl mt-4">
            Use the markup studio to markup the current chart view. When you're
            done, save the image to share.
          </p>
          <Button className="mx-auto mt-4" type="primary" onClick={onStart}>
            Start
          </Button>
        </div>
      </div>
    </div>
  );
}
